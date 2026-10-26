import asyncio
import glob
import ipaddress
import json
import os
import re
import socket
import tempfile
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple

import decky


def normalize_mac(mac_str: str) -> str:
    """Validate and normalize a MAC address to AA:BB:CC:DD:EE:FF format."""
    if not mac_str:
        raise ValueError("MAC address must not be empty.")
    clean = re.sub(r"[^0-9A-Fa-f]", "", mac_str).upper()
    if len(clean) != 12:
        raise ValueError(
            f"Invalid MAC address '{mac_str}'. Expected 12 hex characters (e.g. AA:BB:CC:DD:EE:FF)."
        )
    return ":".join(clean[i : i + 2] for i in range(0, 12, 2))


def create_magic_packet(mac_str: str) -> bytes:
    """Create a 102-byte Wake-on-LAN Magic Packet."""
    normalized = normalize_mac(mac_str)
    mac_bytes = bytes.fromhex(normalized.replace(":", ""))
    return b"\xff" * 6 + mac_bytes * 16


def derive_subnet_broadcast(ip_str: str) -> Optional[str]:
    """Derive a /24 subnet broadcast address from an IPv4 address (e.g. 192.168.1.20 -> 192.168.1.255)."""
    if not ip_str:
        return None
    try:
        ip_only = ip_str.split("/")[0].strip()
        addr = ipaddress.IPv4Address(ip_only)
        if addr.is_loopback or str(addr) == "255.255.255.255":
            return None
        net = ipaddress.IPv4Interface(f"{ip_only}/24").network
        return str(net.broadcast_address)
    except Exception:
        return None


def derive_subnet_gateway(ip_str: str) -> Optional[str]:
    """Derive the .1 gateway IP from an IPv4 address (e.g. 192.168.178.20 -> 192.168.178.1)."""
    if not ip_str:
        return None
    try:
        ip_only = ip_str.split("/")[0].strip()
        addr = ipaddress.IPv4Address(ip_only)
        if addr.is_loopback:
            return None
        net = ipaddress.IPv4Interface(f"{ip_only}/24").network
        return str(net.network_address + 1)
    except Exception:
        return None


class Plugin:
    settings_path: str = ""
    settings: Dict[str, Any] = {}
    _router_user_cache: Dict[str, str] = {}
    _shutdown_until: Dict[str, float] = {}

    def _get_settings_dir(self) -> str:
        """Resolve the persistent plugin settings directory provided by Decky Loader."""
        settings_dir = (
            getattr(decky, "DECKY_PLUGIN_SETTINGS_DIR", "")
            or os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "")
        )
        if not settings_dir:
            base_settings = (
                getattr(decky, "DECKY_SETTINGS_DIR", "")
                or os.environ.get("DECKY_SETTINGS_DIR", "")
            )
            if base_settings:
                settings_dir = os.path.join(base_settings, "VPN-WoL")
            else:
                user_home = (
                    getattr(decky, "DECKY_USER_HOME", "")
                    or os.environ.get("DECKY_USER_HOME", "")
                    or os.path.expanduser("~")
                )
                settings_dir = os.path.join(user_home, "homebrew", "settings", "VPN-WoL")
        return settings_dir

    def _clean_env(self) -> Dict[str, str]:
        """
        Return a sanitized environment dictionary for running host commands on SteamOS/CachyOS/Linux.
        Decky Loader runs inside a PyInstaller bundle that sets LD_LIBRARY_PATH, which can break
        host binaries like nmcli, ip, wg, or ping if not stripped.
        """
        env = os.environ.copy()
        if "LD_LIBRARY_PATH_ORIG" in env:
            env["LD_LIBRARY_PATH"] = env["LD_LIBRARY_PATH_ORIG"]
        else:
            env.pop("LD_LIBRARY_PATH", None)
        env.pop("PYTHONPATH", None)
        env["LC_ALL"] = "C"
        env["LANG"] = "C"
        default_paths = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        current_path = env.get("PATH", "")
        if default_paths not in current_path:
            env["PATH"] = f"{default_paths}:{current_path}" if current_path else default_paths
        return env

    def _priv_args(self, args: List[str]) -> List[str]:
        """If the plugin process is not already running as root (euid != 0), prepend sudo -n."""
        try:
            if os.geteuid() != 0 and args and args[0] != "sudo":
                return ["sudo", "-n"] + args
        except AttributeError:
            pass
        return args

    async def _run_cmd(
        self,
        args: List[str],
        timeout: float = 15.0,
        privileged: bool = False,
        extra_env: Optional[Dict[str, str]] = None,
    ) -> Tuple[int, str, str]:
        """Execute a system command asynchronously and return (returncode, stdout, stderr)."""
        cmd_args = self._priv_args(args) if privileged else args
        try:
            env = self._clean_env()
            if extra_env:
                env.update(extra_env)
            proc = await asyncio.create_subprocess_exec(
                *cmd_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
            )
            stdout_b, stderr_b = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            stdout = stdout_b.decode("utf-8", errors="replace").strip()
            stderr = stderr_b.decode("utf-8", errors="replace").strip()
            return proc.returncode or 0, stdout, stderr
        except asyncio.TimeoutError:
            decky.logger.warning(f"Command timed out after {timeout}s: {' '.join(cmd_args)}")
            return 124, "", f"Command timed out after {int(timeout)}s: {' '.join(cmd_args)}"
        except FileNotFoundError:
            return 127, "", f"Command not found: {cmd_args[0]}"
        except Exception as e:
            decky.logger.error(f"Error running command {' '.join(cmd_args)}: {e}")
            return 1, "", str(e)

    def _load_settings(self) -> None:
        default_settings: Dict[str, Any] = {
            "wol_targets": [],
        }
        try:
            settings_dir = self._get_settings_dir()
            os.makedirs(settings_dir, exist_ok=True)
            self.settings_path = os.path.join(settings_dir, "settings.json")

            # Also check legacy path in case targets were previously saved in DECKY_SETTINGS_DIR
            legacy_dir = getattr(decky, "DECKY_SETTINGS_DIR", "")
            legacy_path = os.path.join(legacy_dir, "settings.json") if legacy_dir else ""

            if os.path.exists(self.settings_path):
                with open(self.settings_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                if isinstance(loaded, dict) and "wol_targets" in loaded:
                    default_settings.update(loaded)
            elif legacy_path and os.path.exists(legacy_path):
                with open(legacy_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                if isinstance(loaded, dict) and "wol_targets" in loaded:
                    default_settings.update(loaded)
            decky.logger.info(
                f"Loaded settings from {self.settings_path} ({len(default_settings.get('wol_targets', []))} targets)."
            )
        except Exception as e:
            decky.logger.error(f"Failed to load settings.json: {e}")

        for target in default_settings.get("wol_targets", []):
            if "wake_trigger" not in target:
                target["wake_trigger"] = bool(target.get("fritzbox_trigger", True))

        self.settings = default_settings

    def _save_settings(self) -> None:
        try:
            settings_dir = self._get_settings_dir()
            os.makedirs(settings_dir, exist_ok=True)
            self.settings_path = os.path.join(settings_dir, "settings.json")
            tmp_path = f"{self.settings_path}.tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(self.settings, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp_path, self.settings_path)
            decky.logger.info(
                f"Saved settings to {self.settings_path} ({len(self.settings.get('wol_targets', []))} targets)."
            )
        except Exception as e:
            decky.logger.error(f"Failed to save settings.json: {e}")

    async def _get_interface_map(self) -> Dict[str, Dict[str, Any]]:
        """Query iproute2 (`ip -j addr`) for active network interfaces and their IPv4 addresses."""
        iface_map: Dict[str, Dict[str, Any]] = {}
        rc, stdout, _ = await self._run_cmd(["ip", "-j", "addr"], timeout=5.0)
        if rc != 0 or not stdout:
            return iface_map

        try:
            data = json.loads(stdout)
            for entry in data:
                ifname = entry.get("ifname")
                if not ifname:
                    continue
                operstate = entry.get("operstate", "UNKNOWN")
                flags = entry.get("flags", [])
                is_up = "UP" in flags or operstate in ("UP", "UNKNOWN")
                ipv4_cidr = ""
                ipv4_addr = ""
                broadcast = ""

                for addr_info in entry.get("addr_info", []):
                    if addr_info.get("family") == "inet":
                        local_ip = addr_info.get("local", "")
                        prefixlen = addr_info.get("prefixlen", 24)
                        if local_ip:
                            ipv4_addr = local_ip
                            ipv4_cidr = f"{local_ip}/{prefixlen}"
                            bcast = addr_info.get("broadcast")
                            if not bcast:
                                bcast = derive_subnet_broadcast(local_ip) or ""
                            broadcast = bcast
                            break

                iface_map[ifname] = {
                    "ifname": ifname,
                    "is_up": is_up,
                    "ip": ipv4_cidr,
                    "address": ipv4_addr,
                    "broadcast": broadcast,
                }
        except Exception as e:
            decky.logger.error(f"Failed to parse ip -j addr output: {e}")

        return iface_map

    async def _get_active_wireguard_interfaces(self) -> set:
        """Return a set of currently active WireGuard interface names."""
        active_wg = set()
        rc, stdout, _ = await self._run_cmd(
            ["wg", "show", "interfaces"], timeout=5.0, privileged=True
        )
        if rc == 0 and stdout:
            for token in stdout.split():
                if token.strip():
                    active_wg.add(token.strip())

        # Also check /sys/class/net/*/uevent for DEVTYPE=wireguard in case wg binary is not in PATH
        try:
            for uevent_path in glob.glob("/sys/class/net/*/uevent"):
                with open(uevent_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if "DEVTYPE=wireguard" in content:
                    ifname = os.path.basename(os.path.dirname(uevent_path))
                    active_wg.add(ifname)
        except Exception:
            pass

        return active_wg

    async def get_vpns(self) -> List[Dict[str, Any]]:
        """
        Discover all configured and active VPNs via NetworkManager (nmcli)
        and WireGuard (/etc/wireguard/*.conf & active wg interfaces).
        """
        vpns: List[Dict[str, Any]] = []
        seen_interfaces = set()
        seen_names = set()

        iface_map = await self._get_interface_map()
        active_wg_ifaces = await self._get_active_wireguard_interfaces()

        # 1. Discover NetworkManager VPN & WireGuard connections
        rc, stdout, _ = await self._run_cmd(
            ["nmcli", "-t", "-f", "NAME,UUID,TYPE,DEVICE,STATE", "connection", "show"],
            timeout=8.0,
            privileged=True,
        )
        if rc == 0 and stdout:
            for line in stdout.splitlines():
                line = line.strip()
                if not line:
                    continue
                parts = line.rsplit(":", 4)
                if len(parts) != 5:
                    continue
                name, conn_uuid, conn_type, device, state = parts
                name = name.replace("\\:", ":")

                if conn_type not in ("wireguard", "vpn", "tun"):
                    continue

                is_active = state == "activated"
                is_connecting = state == "activating"

                resolved_iface = device if device and device != "--" else ""
                if not resolved_iface and name in iface_map:
                    resolved_iface = name

                if resolved_iface:
                    seen_interfaces.add(resolved_iface)
                seen_names.add(name)

                ip_info = iface_map.get(resolved_iface, {}) if resolved_iface else {}
                vpns.append(
                    {
                        "id": f"nm:{conn_uuid}",
                        "name": name,
                        "uuid": conn_uuid,
                        "backend": "nmcli",
                        "type": "wireguard" if conn_type == "wireguard" else "vpn",
                        "interface": resolved_iface,
                        "active": is_active,
                        "state": (
                            "connected"
                            if is_active
                            else ("connecting" if is_connecting else "disconnected")
                        ),
                        "ip": ip_info.get("ip", ""),
                        "broadcast": ip_info.get("broadcast", ""),
                    }
                )

        # 2. Discover /etc/wireguard/*.conf and active wg-quick interfaces
        wg_conf_ifaces = set()
        try:
            if os.path.isdir("/etc/wireguard"):
                for conf_file in sorted(glob.glob("/etc/wireguard/*.conf")):
                    iface_name = os.path.splitext(os.path.basename(conf_file))[0]
                    if iface_name:
                        wg_conf_ifaces.add(iface_name)
        except Exception as e:
            decky.logger.warning(f"Could not scan /etc/wireguard: {e}")

        all_wg_candidates = sorted(wg_conf_ifaces.union(active_wg_ifaces))
        for iface in all_wg_candidates:
            if iface in seen_interfaces or iface in seen_names:
                continue
            is_active = iface in active_wg_ifaces or iface in iface_map
            ip_info = iface_map.get(iface, {})
            vpns.append(
                {
                    "id": f"wg:{iface}",
                    "name": iface,
                    "uuid": iface,
                    "backend": "wg-quick",
                    "type": "wireguard",
                    "interface": iface,
                    "active": is_active,
                    "state": "connected" if is_active else "disconnected",
                    "ip": ip_info.get("ip", ""),
                    "broadcast": ip_info.get("broadcast", ""),
                }
            )

        # Sort active VPNs first, then alphabetically by name
        vpns.sort(key=lambda v: (not v.get("active", False), v.get("name", "").lower()))
        return vpns

    async def set_vpn_state(self, vpn_id: str, enable: bool) -> Dict[str, Any]:
        """Connect or disconnect a VPN by its ID (nm:<uuid> or wg:<iface>)."""
        decky.logger.info(
            f"Setting VPN state: vpn_id={vpn_id}, enable={enable}, euid={os.geteuid() if hasattr(os, 'geteuid') else 'N/A'}"
        )
        if not vpn_id or ":" not in vpn_id:
            return {
                "success": False,
                "error": f"Invalid VPN ID: {vpn_id}",
                "vpns": await self.get_vpns(),
            }

        backend, identifier = vpn_id.split(":", 1)

        if backend == "nm":
            cmd = ["nmcli", "connection", "up" if enable else "down", "uuid", identifier]
            rc, stdout, stderr = await self._run_cmd(cmd, timeout=20.0, privileged=True)
            if rc != 0 and "not authorized" in (stderr + stdout).lower():
                # Clear user-specific restriction on the connection profile if present and retry
                await self._run_cmd(
                    ["nmcli", "connection", "modify", "uuid", identifier, "connection.permissions", ""],
                    timeout=5.0,
                    privileged=True,
                )
                rc, stdout, stderr = await self._run_cmd(cmd, timeout=20.0, privileged=True)

            if rc != 0:
                err_msg = stderr or stdout or f"nmcli exit code {rc}"
                decky.logger.error(f"nmcli failed for {vpn_id}: {err_msg}")
                return {
                    "success": False,
                    "error": err_msg,
                    "vpns": await self.get_vpns(),
                }
        elif backend == "wg":
            cmd = ["wg-quick", "up" if enable else "down", identifier]
            rc, stdout, stderr = await self._run_cmd(cmd, timeout=20.0, privileged=True)
            if rc != 0:
                # Fallback to systemctl wg-quick@<iface>
                sys_action = "start" if enable else "stop"
                rc2, stdout2, stderr2 = await self._run_cmd(
                    ["systemctl", sys_action, f"wg-quick@{identifier}.service"],
                    timeout=20.0,
                    privileged=True,
                )
                if rc2 != 0:
                    err_msg = stderr or stdout or stderr2 or stdout2 or f"wg-quick exit code {rc}"
                    decky.logger.error(f"wg-quick failed for {vpn_id}: {err_msg}")
                    return {
                        "success": False,
                        "error": err_msg,
                        "vpns": await self.get_vpns(),
                    }
        else:
            return {
                "success": False,
                "error": f"Unknown VPN backend: {backend}",
                "vpns": await self.get_vpns(),
            }

        # Wait briefly for interface and routing table to settle
        await asyncio.sleep(0.4)
        vpns = await self.get_vpns()
        return {
            "success": True,
            "vpns": vpns,
        }

    async def get_wol_targets(self) -> List[Dict[str, Any]]:
        """Return the list of configured Wake-on-LAN targets."""
        return self.settings.get("wol_targets", [])

    async def save_wol_target(self, target: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a Wake-on-LAN PC profile."""
        try:
            name = (target.get("name") or "").strip() or "PC"
            mac = normalize_mac(target.get("mac", ""))
            ip = (target.get("ip") or "").strip()
            broadcast_ip = (target.get("broadcast_ip") or "").strip()
            vpn_id = (target.get("vpn_id") or "").strip()
            wake_trigger = bool(
                target.get("wake_trigger", target.get("fritzbox_trigger", True))
            )
            router_ip = (target.get("router_ip") or "").strip()
            router_user = (target.get("router_user") or "").strip()
            router_password = target.get("router_password") or ""
            ssh_enabled = bool(target.get("ssh_enabled", False))
            ssh_user = (target.get("ssh_user") or "").strip()
            ssh_password = target.get("ssh_password") or ""
            try:
                ssh_port = int(target.get("ssh_port", 22))
                if not (1 <= ssh_port <= 65535):
                    ssh_port = 22
            except (ValueError, TypeError):
                ssh_port = 22
            ssh_os = (target.get("ssh_os") or "windows").strip().lower()
            if ssh_os not in ("windows", "linux"):
                ssh_os = "windows"
            ssh_custom_cmd = (target.get("ssh_custom_cmd") or "").strip()

            try:
                port = int(target.get("port", 9))
                if not (1 <= port <= 65535):
                    port = 9
            except (ValueError, TypeError):
                port = 9

            if ip:
                try:
                    ipaddress.IPv4Address(ip)
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Invalid IPv4 address: '{ip}'",
                        "targets": self.settings.get("wol_targets", []),
                    }

            if broadcast_ip:
                try:
                    ipaddress.IPv4Address(broadcast_ip)
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Invalid broadcast IP: '{broadcast_ip}'",
                        "targets": self.settings.get("wol_targets", []),
                    }

            if router_ip:
                try:
                    ipaddress.IPv4Address(router_ip)
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Invalid router IP: '{router_ip}'",
                        "targets": self.settings.get("wol_targets", []),
                    }

            target_id = (target.get("id") or "").strip() or str(uuid.uuid4())
            clean_target = {
                "id": target_id,
                "name": name,
                "mac": mac,
                "ip": ip,
                "broadcast_ip": broadcast_ip,
                "port": port,
                "vpn_id": vpn_id,
                "wake_trigger": wake_trigger,
                "router_ip": router_ip,
                "router_user": router_user,
                "router_password": router_password,
                "ssh_enabled": ssh_enabled,
                "ssh_user": ssh_user,
                "ssh_password": ssh_password,
                "ssh_port": ssh_port,
                "ssh_os": ssh_os,
                "ssh_custom_cmd": ssh_custom_cmd,
            }

            if "wol_targets" not in self.settings:
                self._load_settings()

            targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
            updated = False
            for idx, existing in enumerate(targets):
                if existing.get("id") == target_id:
                    targets[idx] = clean_target
                    updated = True
                    break

            if not updated:
                targets.append(clean_target)

            self.settings["wol_targets"] = targets
            self._save_settings()
            return {
                "success": True,
                "target": clean_target,
                "targets": targets,
            }
        except ValueError as ve:
            return {
                "success": False,
                "error": str(ve),
                "targets": self.settings.get("wol_targets", []),
            }
        except Exception as e:
            decky.logger.error(f"Error saving WoL target: {e}")
            return {
                "success": False,
                "error": str(e),
                "targets": self.settings.get("wol_targets", []),
            }

    async def delete_wol_target(self, target_id: str) -> Dict[str, Any]:
        """Delete a Wake-on-LAN PC profile by ID."""
        if "wol_targets" not in self.settings:
            self._load_settings()
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        targets = [t for t in targets if t.get("id") != target_id]
        self.settings["wol_targets"] = targets
        self._save_settings()
        return {
            "success": True,
            "targets": targets,
        }

    async def _check_router_host_active(
        self,
        router_ip: str,
        mac: str,
        router_user: str = "",
        router_password: str = "",
    ) -> Optional[bool]:
        """
        Query the router via TR-064 `GetSpecificHostEntry` (sent to `router_ip`, NEVER to `pc_ip`)
        to check whether the target MAC is currently active (`NewActive` == 1 or 0).
        Returns True if active, False if inactive, or None if the router could not be queried.
        Because packets only go to `router_ip`, this never triggers router 'Wake on Access' for the PC.
        """
        if not router_ip or not mac:
            return None

        tr064_url = f"http://{router_ip}:49000/upnp/control/hosts"
        soap_body = (
            '<?xml version="1.0" encoding="utf-8"?>'
            '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" '
            's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">'
            "<s:Body>"
            '<u:GetSpecificHostEntry xmlns:u="urn:dslforum-org:service:Hosts:1">'
            f"<NewMACAddress>{mac}</NewMACAddress>"
            "</u:GetSpecificHostEntry>"
            "</s:Body>"
            "</s:Envelope>"
        )

        # 1. Try unauthenticated TR-064 query first (fast path if UPnP status is open)
        rc, out, _ = await self._run_cmd(
            [
                "curl",
                "-s",
                "-m",
                "2",
                "-H",
                'Content-Type: text/xml; charset="utf-8"',
                "-H",
                'SOAPACTION: "urn:dslforum-org:service:Hosts:1#GetSpecificHostEntry"',
                "-d",
                soap_body,
                tr064_url,
            ],
            timeout=2.5,
        )
        if rc == 0 and out:
            m = re.search(r"<NewActive>\s*([01])\s*</NewActive>", out)
            if m:
                return m.group(1) == "1"

        # 2. If authentication is required and router_password is provided, query with Digest Auth
        if not router_password:
            return None

        discovered_user = router_user.strip() or self._router_user_cache.get(router_ip, "")
        if not discovered_user:
            rc_u, xml_text, _ = await self._run_cmd(
                ["curl", "-s", "-m", "2", f"http://{router_ip}/login_sid.lua?version=2"],
                timeout=2.5,
            )
            if rc_u == 0 and xml_text:
                last_user = ""
                first_user = ""
                for attrs, uname in re.findall(r"<User([^>]*)>([^<]+)</User>", xml_text):
                    u_clean = uname.strip()
                    if not u_clean:
                        continue
                    if not first_user:
                        first_user = u_clean
                    if 'last="1"' in attrs or "last='1'" in attrs:
                        last_user = u_clean
                discovered_user = last_user or first_user
                if discovered_user:
                    self._router_user_cache[router_ip] = discovered_user

        candidate_users: List[str] = []
        for u in (router_user.strip(), discovered_user, "dslf-config", "admin"):
            if u and u not in candidate_users:
                candidate_users.append(u)

        for auth_user in candidate_users:
            rc, out, _ = await self._run_cmd(
                [
                    "curl",
                    "-s",
                    "-m",
                    "2",
                    "--digest",
                    "-u",
                    f"{auth_user}:{router_password}",
                    "-H",
                    'Content-Type: text/xml; charset="utf-8"',
                    "-H",
                    'SOAPACTION: "urn:dslforum-org:service:Hosts:1#GetSpecificHostEntry"',
                    "-d",
                    soap_body,
                    tr064_url,
                ],
                timeout=3.0,
            )
            if rc == 0 and out:
                m = re.search(r"<NewActive>\s*([01])\s*</NewActive>", out)
                if m:
                    self._router_user_cache[router_ip] = auth_user
                    return m.group(1) == "1"

        return None

    async def ping_target(self, ip: str) -> Dict[str, Any]:
        """Ping a single IPv4 address (1 packet, 1s timeout) and return online status + latency."""
        ip = (ip or "").strip()
        if not ip:
            return {"online": False, "latency_ms": None}

        rc, stdout, _ = await self._run_cmd(["ping", "-c", "1", "-W", "1", ip], timeout=2.5)
        if rc == 0:
            latency_ms: Optional[float] = None
            match = re.search(r"time[=<]([\d.]+)\s*ms", stdout)
            if match:
                try:
                    latency_ms = round(float(match.group(1)), 1)
                except ValueError:
                    pass
            return {"online": True, "latency_ms": latency_ms}
        return {"online": False, "latency_ms": None}

    async def ping_all_targets(
        self, vpns: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Check online status of all configured WoL targets concurrently and return a map of target_id -> status.
        To prevent accidentally waking an offline PC via router 'Wake on Access' (or NIC 'Wake on Pattern Match')
        when a VPN is connected, this first checks the router's host table via TR-064 (`GetSpecificHostEntry`)
        without sending any packet to the PC's IP address.
        """
        if "wol_targets" not in self.settings:
            self._load_settings()
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        results: Dict[str, Dict[str, Any]] = {}
        if not targets:
            return results

        if vpns is None:
            vpns = await self.get_vpns()
        iface_map = await self._get_interface_map()
        any_vpn_active = any(v.get("active") for v in vpns)
        now = time.monotonic()

        async def _check_one(t: Dict[str, Any]) -> None:
            tid = t.get("id", "")
            ip = (t.get("ip") or "").strip()
            if not tid:
                return
            if not ip:
                results[tid] = {"online": False, "latency_ms": None}
                return

            # 0. Respect post-shutdown cooldown so polling never wakes a PC that is shutting down
            if now < self._shutdown_until.get(tid, 0.0):
                results[tid] = {"online": False, "latency_ms": None}
                return

            # 1. If target is linked to a VPN that is currently disconnected, and we are not on the same local /24 subnet, skip pinging
            vpn_id = (t.get("vpn_id") or "").strip()
            if vpn_id:
                linked_vpn = next(
                    (v for v in vpns if v.get("id") == vpn_id or v.get("name") == vpn_id),
                    None,
                )
                if linked_vpn and not linked_vpn.get("active"):
                    target_bcast = derive_subnet_broadcast(ip)
                    on_local_subnet = any(
                        info.get("is_up") and info.get("broadcast") == target_bcast
                        for info in iface_map.values()
                        if target_bcast
                    )
                    if not on_local_subnet:
                        results[tid] = {"online": False, "latency_ms": None}
                        return

            # 2. Check router TR-064 host status first (goes to router IP only, never touches PC IP!)
            raw_mac = (t.get("mac") or "").strip()
            if raw_mac:
                try:
                    norm_mac = normalize_mac(raw_mac)
                    router_ip = (
                        (t.get("router_ip") or "").strip()
                        or derive_subnet_gateway(ip)
                        or "192.168.178.1"
                    )
                    router_user = (t.get("router_user") or "").strip()
                    router_password = t.get("router_password") or ""
                    router_active = await self._check_router_host_active(
                        router_ip, norm_mac, router_user, router_password
                    )
                    if router_active is False:
                        results[tid] = {"online": False, "latency_ms": None}
                        return
                    if router_active is True and any_vpn_active:
                        # Avoid sending ICMP packets directly to PC IP over VPN during background polls
                        results[tid] = {"online": True, "latency_ms": None}
                        return
                except Exception:
                    pass

            results[tid] = await self.ping_target(ip)

        await asyncio.gather(*[_check_one(t) for t in targets])
        return results

    def _send_udp_packet(
        self,
        payload: bytes,
        dest_ip: str,
        dest_port: int,
        bind_iface: Optional[str] = None,
    ) -> bool:
        """Send a single UDP packet (optionally bound to a specific network interface via SO_BINDTODEVICE)."""
        sock = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(1.0)
            if bind_iface:
                # SO_BINDTODEVICE = 25 on Linux
                so_bindtodevice = getattr(socket, "SO_BINDTODEVICE", 25)
                sock.setsockopt(
                    socket.SOL_SOCKET,
                    so_bindtodevice,
                    bind_iface.encode("utf-8") + b"\x00",
                )
            sock.sendto(payload, (dest_ip, dest_port))
            return True
        except Exception as e:
            decky.logger.debug(
                f"UDP send to {dest_ip}:{dest_port} (iface={bind_iface}) failed: {e}"
            )
            return False
        finally:
            if sock is not None:
                try:
                    sock.close()
                except Exception:
                    pass

    async def _send_router_wol(
        self,
        router_ip: str,
        router_user: str,
        router_password: str,
        mac: str,
        pc_ip: str = "",
    ) -> Tuple[bool, Optional[str]]:
        """
        Instruct the home router over VPN to send a Layer-2 Wake-on-LAN broadcast inside the home LAN.
        Uses host `curl` and regex parsing so no extra Python XML/HTTP modules are required.
        1. Auto-discovers default router username via /login_sid.lua?version=2 if router_user is empty.
        2. Sends TR-064 SOAP action `X_AVM-DE_WakeOnLANByMACAddress` on port 49000.
        3. Also attempts Web UI SID login + /query.lua & /data.lua (`btn_wake`) fallback.
        """
        base_url = f"http://{router_ip}"
        discovered_user = router_user.strip()
        challenge_str = ""

        # Step 1: Query /login_sid.lua?version=2 to auto-detect default username and challenge
        rc, xml_text, _ = await self._run_cmd(
            ["curl", "-s", "-m", "4", f"{base_url}/login_sid.lua?version=2"],
            timeout=5.0,
        )
        if rc == 0 and xml_text:
            c_match = re.search(r"<Challenge>\s*([^<\s]+)\s*</Challenge>", xml_text)
            if c_match:
                challenge_str = c_match.group(1).strip()

            if not discovered_user:
                last_user = ""
                first_user = ""
                for attrs, uname in re.findall(r"<User([^>]*)>([^<]+)</User>", xml_text):
                    u_clean = uname.strip()
                    if not u_clean:
                        continue
                    if not first_user:
                        first_user = u_clean
                    if 'last="1"' in attrs or "last='1'" in attrs:
                        last_user = u_clean
                discovered_user = last_user or first_user

        candidate_users: List[str] = []
        for u in (router_user.strip(), discovered_user, "dslf-config", "admin"):
            if u and u not in candidate_users:
                candidate_users.append(u)

        # Step 2: Try TR-064 SOAP WakeOnLANByMACAddress on port 49000 via curl --digest
        tr064_url = f"http://{router_ip}:49000/upnp/control/hosts"
        soap_body = (
            '<?xml version="1.0" encoding="utf-8"?>'
            '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" '
            's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">'
            "<s:Body>"
            '<u:X_AVM-DE_WakeOnLANByMACAddress xmlns:u="urn:dslforum-org:service:Hosts:1">'
            f"<NewMACAddress>{mac}</NewMACAddress>"
            "</u:X_AVM-DE_WakeOnLANByMACAddress>"
            "</s:Body>"
            "</s:Envelope>"
        )

        tr064_auth_failed = False
        for auth_user in candidate_users:
            rc, out, _ = await self._run_cmd(
                [
                    "curl",
                    "-s",
                    "-m",
                    "5",
                    "--digest",
                    "-u",
                    f"{auth_user}:{router_password}",
                    "-H",
                    'Content-Type: text/xml; charset="utf-8"',
                    "-H",
                    'SOAPACTION: "urn:dslforum-org:service:Hosts:1#X_AVM-DE_WakeOnLANByMACAddress"',
                    "-d",
                    soap_body,
                    "-w",
                    "\n%{http_code}",
                    tr064_url,
                ],
                timeout=6.0,
            )
            if rc == 0 and out:
                lines = [ln.strip() for ln in out.splitlines() if ln.strip()]
                http_code = lines[-1] if lines else ""
                if http_code.startswith("2"):
                    decky.logger.info(
                        f"Router TR-064 WoL succeeded via {router_ip}:49000 (user={auth_user})"
                    )
                    return True, None
                if http_code == "401":
                    tr064_auth_failed = True
                    continue

        # Step 3: Fallback to Router Web UI SID + query.lua / data.lua
        web_user = discovered_user or router_user.strip() or ""
        if challenge_str:
            try:
                import hashlib

                if challenge_str.startswith("2$"):
                    parts = challenge_str.split("$")
                    iter1 = int(parts[1])
                    salt1 = bytes.fromhex(parts[2])
                    iter2 = int(parts[3])
                    salt2 = bytes.fromhex(parts[4])
                    hash1 = hashlib.pbkdf2_hmac(
                        "sha256", router_password.encode("utf-8"), salt1, iter1
                    )
                    hash2 = hashlib.pbkdf2_hmac("sha256", hash1, salt2, iter2)
                    challenge_resp = f"{parts[4]}${hash2.hex()}"
                else:
                    raw = f"{challenge_str}-{router_password}".encode("utf-16le")
                    challenge_resp = f"{challenge_str}-{hashlib.md5(raw).hexdigest()}"

                rc, sid_xml, _ = await self._run_cmd(
                    [
                        "curl",
                        "-s",
                        "-m",
                        "4",
                        "--get",
                        "--data-urlencode",
                        f"username={web_user}",
                        "--data-urlencode",
                        f"response={challenge_resp}",
                        f"{base_url}/login_sid.lua?version=2",
                    ],
                    timeout=5.0,
                )
                sid_match = re.search(r"<SID>\s*([^<\s]+)\s*</SID>", sid_xml or "")
                sid = sid_match.group(1).strip() if sid_match else ""

                if sid and sid != "0000000000000000":
                    q_url = (
                        f"{base_url}/query.lua?sid={sid}"
                        "&network=landevice:settings/landevice/list(name,ip,mac,UID)"
                    )
                    rc, q_raw, _ = await self._run_cmd(
                        ["curl", "-s", "-m", "4", q_url],
                        timeout=5.0,
                    )
                    q_data = json.loads(q_raw) if (rc == 0 and q_raw) else {}

                    dev_uid = ""
                    for item in q_data.get("network", []):
                        item_mac = (item.get("mac") or "").strip().upper()
                        item_ip = (item.get("ip") or "").strip()
                        if item_mac == mac.upper() or (pc_ip and item_ip == pc_ip):
                            dev_uid = item.get("UID") or ""
                            break

                    if dev_uid:
                        rc, _, _ = await self._run_cmd(
                            [
                                "curl",
                                "-s",
                                "-m",
                                "5",
                                "-d",
                                f"xhr=1&sid={sid}&page=edit_device&dev={dev_uid}&btn_wake=",
                                f"{base_url}/data.lua",
                            ],
                            timeout=6.0,
                        )
                        if rc == 0:
                            decky.logger.info(
                                f"Router Web-UI WoL succeeded via {router_ip}/data.lua (dev={dev_uid})"
                            )
                            return True, None
                else:
                    return (
                        False,
                        f"Router login failed on {router_ip} (user '{web_user or 'default'}'). Please check Router Password.",
                    )
            except Exception as e:
                decky.logger.warning(f"Router Web-UI WoL fallback failed on {router_ip}: {e}")

        if tr064_auth_failed:
            return (
                False,
                f"Router authentication failed (HTTP 401) on {router_ip}. Please check Router Password.",
            )

        return False, None

    async def _trigger_router_wake_on_access(
        self, ip: str, bind_iface: Optional[str] = None
    ) -> None:
        """
        Stimulate router ARP resolution and trigger router 'Wake on Access' features
        by sending ICMP Echo + quick TCP SYN probes to common PC ports.
        """
        if not ip:
            return

        # 1. Fire a quick ICMP ping
        asyncio.create_task(self._run_cmd(["ping", "-c", "1", "-W", "1", ip], timeout=2.0))

        # 2. Fire quick non-blocking TCP SYN attempts to common ports (SMB 445, RDP 3389, HTTP 80, SSH 22, WoL 9)
        def _tcp_probes() -> None:
            for port in (445, 3389, 80, 443, 22, 9):
                s = None
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    s.settimeout(0.12)
                    if bind_iface:
                        so_bindtodevice = getattr(socket, "SO_BINDTODEVICE", 25)
                        try:
                            s.setsockopt(
                                socket.SOL_SOCKET,
                                so_bindtodevice,
                                bind_iface.encode("utf-8") + b"\x00",
                            )
                        except Exception:
                            pass
                    s.connect_ex((ip, port))
                except Exception:
                    pass
                finally:
                    if s is not None:
                        try:
                            s.close()
                        except Exception:
                            pass

        await asyncio.to_thread(_tcp_probes)

    async def send_wol(self, target_id: str, auto_connect_vpn: bool = True) -> Dict[str, Any]:
        """
        Send Wake-on-LAN to the specified target profile.
        - Automatically connects the assigned VPN if `auto_connect_vpn` is True.
        - If Router Password is set, triggers Router TR-064 / Web-UI Layer-2 WoL directly on the home LAN.
        - Sends UDP Magic Packets (Unicast to PC IP, Directed Subnet Broadcast, and Global Broadcast)
          across both kernel-routed sockets and SO_BINDTODEVICE on the VPN interface.
        - Optionally triggers Router Auto-Wake / ARP resolution via ICMP Ping + TCP SYN probes.
        """
        if "wol_targets" not in self.settings:
            self._load_settings()
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        target = next((t for t in targets if t.get("id") == target_id), None)
        if not target:
            return {"success": False, "error": "PC profile not found."}

        self._shutdown_until.pop(target_id, None)

        try:
            normalized_mac = normalize_mac(target.get("mac", ""))
            magic_packet = create_magic_packet(normalized_mac)
        except ValueError as ve:
            return {"success": False, "error": str(ve)}

        vpn_id = (target.get("vpn_id") or "").strip()
        vpn_was_activated = False
        active_vpn_iface: Optional[str] = None

        vpns = await self.get_vpns()

        # 1. Check / auto-connect linked VPN if configured
        if vpn_id:
            linked_vpn = next((v for v in vpns if v.get("id") == vpn_id), None)
            if not linked_vpn:
                linked_vpn = next((v for v in vpns if v.get("name") == vpn_id), None)

            if linked_vpn:
                if not linked_vpn.get("active") and auto_connect_vpn:
                    decky.logger.info(
                        f"Auto-connecting VPN '{linked_vpn.get('name')}' before sending WoL..."
                    )
                    res = await self.set_vpn_state(linked_vpn["id"], True)
                    if not res.get("success"):
                        return {
                            "success": False,
                            "error": f"Failed to start VPN '{linked_vpn.get('name')}': {res.get('error')}",
                            "vpns": res.get("vpns", vpns),
                        }
                    vpn_was_activated = True
                    vpns = res.get("vpns", vpns)

                    # Wait up to 5 seconds for VPN interface to be fully up
                    for _ in range(10):
                        updated_vpn = next(
                            (v for v in vpns if v.get("id") == linked_vpn["id"]), None
                        )
                        if updated_vpn and updated_vpn.get("active"):
                            linked_vpn = updated_vpn
                            break
                        await asyncio.sleep(0.5)
                        vpns = await self.get_vpns()

                active_vpn_iface = linked_vpn.get("interface") or None
        else:
            first_active = next((v for v in vpns if v.get("active") and v.get("interface")), None)
            if first_active:
                active_vpn_iface = first_active.get("interface")

        # 2. Build destination IP list
        pc_ip = (target.get("ip") or "").strip()
        explicit_bcast = (target.get("broadcast_ip") or "").strip()
        configured_port = int(target.get("port") or 9)

        dest_ips: List[str] = []
        if pc_ip:
            dest_ips.append(pc_ip)
            subnet_bcast = derive_subnet_broadcast(pc_ip)
            if subnet_bcast and subnet_bcast not in dest_ips:
                dest_ips.append(subnet_bcast)

        if explicit_bcast and explicit_bcast not in dest_ips:
            dest_ips.append(explicit_bcast)

        if active_vpn_iface:
            vpn_obj = next((v for v in vpns if v.get("interface") == active_vpn_iface), None)
            if vpn_obj and vpn_obj.get("broadcast"):
                vb = vpn_obj["broadcast"]
                if vb not in dest_ips:
                    dest_ips.append(vb)

        if "255.255.255.255" not in dest_ips:
            dest_ips.append("255.255.255.255")

        ports: List[int] = []
        for p in (configured_port, 9, 7):
            if 1 <= p <= 65535 and p not in ports:
                ports.append(p)

        sent_endpoints = set()

        # 3. Direct Router TR-064 / Web-UI Wake-on-LAN (solves Layer-3 VPN & empty ARP cache!)
        router_password = target.get("router_password") or ""
        if router_password:
            router_ip = (
                (target.get("router_ip") or "").strip()
                or derive_subnet_gateway(pc_ip)
                or "192.168.178.1"
            )
            router_user = (target.get("router_user") or "").strip()
            router_ok, router_err = await self._send_router_wol(
                router_ip,
                router_user,
                router_password,
                normalized_mac,
                pc_ip,
            )
            if router_ok:
                sent_endpoints.add(f"router://{router_ip}")
            elif router_err:
                return {
                    "success": False,
                    "error": router_err,
                    "vpns": vpns,
                }

        # 4. Optional Router Auto-Wake / ARP trigger (ICMP Ping + TCP SYN probes)
        use_wake_trigger = bool(
            target.get("wake_trigger", target.get("fritzbox_trigger", True))
        )
        if use_wake_trigger and pc_ip:
            await self._trigger_router_wake_on_access(pc_ip, active_vpn_iface)

        # 5. Send Magic Packets in 3 bursts for reliability over VPN / Wi-Fi
        def _send_burst() -> None:
            for dip in dest_ips:
                for dport in ports:
                    if self._send_udp_packet(magic_packet, dip, dport, bind_iface=None):
                        sent_endpoints.add(f"{dip}:{dport}")
                    if active_vpn_iface:
                        if self._send_udp_packet(
                            magic_packet, dip, dport, bind_iface=active_vpn_iface
                        ):
                            sent_endpoints.add(f"{dip}:{dport}@{active_vpn_iface}")

        for attempt in range(3):
            await asyncio.to_thread(_send_burst)
            if attempt < 2:
                await asyncio.sleep(0.15)

        if not sent_endpoints:
            return {
                "success": False,
                "error": "Could not send Wake-on-LAN packet on any network interface.",
                "vpns": vpns,
            }

        target_name = target.get("name", "PC")
        decky.logger.info(
            f"Sent WoL to '{target_name}' ({normalized_mac}). Endpoints: {sorted(sent_endpoints)}"
        )
        return {
            "success": True,
            "vpn_activated": vpn_was_activated,
            "endpoints": sorted(sent_endpoints),
            "vpns": vpns,
        }

    async def shutdown_target(self, target_id: str) -> Dict[str, Any]:
        """Send a shutdown command to the remote PC via SSH."""
        if "wol_targets" not in self.settings:
            self._load_settings()
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        target = next((t for t in targets if t.get("id") == target_id), None)
        if not target:
            return {"success": False, "error": "PC profile not found."}

        self._shutdown_until.pop(target_id, None)

        ip = (target.get("ip") or "").strip()
        if not ip:
            return {"success": False, "error": "PC IP address is required for SSH shutdown."}

        ssh_user = (target.get("ssh_user") or "").strip()
        if not ssh_user:
            return {"success": False, "error": "SSH username is required for remote shutdown."}

        ssh_password = target.get("ssh_password") or ""
        ssh_port = int(target.get("ssh_port") or 22)
        ssh_os = (target.get("ssh_os") or "windows").lower()
        ssh_custom_cmd = (target.get("ssh_custom_cmd") or "").strip()

        if ssh_custom_cmd:
            shutdown_cmd = ssh_custom_cmd
        elif ssh_os == "linux":
            shutdown_cmd = "systemctl poweroff || sudo poweroff || shutdown -h now"
        else:
            shutdown_cmd = "shutdown /s /t 0"

        decky.logger.info(
            f"Initiating SSH shutdown for '{target.get('name', 'PC')}' ({ssh_user}@{ip}:{ssh_port}, cmd='{shutdown_cmd}')..."
        )

        askpass_path: Optional[str] = None
        extra_env: Dict[str, str] = {}
        try:
            ssh_args = [
                "ssh",
                "-p", str(ssh_port),
                "-o", "StrictHostKeyChecking=no",
                "-o", "UserKnownHostsFile=/dev/null",
                "-o", "ConnectTimeout=6",
                "-o", "ServerAliveInterval=3",
                "-o", "ServerAliveCountMax=1",
            ]

            if ssh_password:
                fd, askpass_path = tempfile.mkstemp(prefix="decky_askpass_", suffix=".sh")
                with os.fdopen(fd, "w") as f:
                    f.write("#!/bin/sh\n")
                    f.write(f'printf "%s" {json.dumps(ssh_password)}\n')
                os.chmod(askpass_path, 0o700)
                extra_env["SSH_ASKPASS"] = askpass_path
                extra_env["SSH_ASKPASS_REQUIRE"] = "force"
                extra_env["DISPLAY"] = ":0"
                ssh_args.extend(["-o", "PreferredAuthentications=password,keyboard-interactive,publickey"])
            else:
                ssh_args.extend(["-o", "BatchMode=yes"])

            ssh_args.extend([f"{ssh_user}@{ip}", shutdown_cmd])

            rc, stdout, stderr = await self._run_cmd(
                ssh_args, timeout=12.0, extra_env=extra_env
            )

            combined_err = (stderr + " " + stdout).lower()
            if rc == 0:
                self._shutdown_until[target_id] = time.monotonic() + 180.0
                decky.logger.info(f"SSH shutdown command executed successfully on {ip}.")
                return {"success": True}

            if "permission denied" in combined_err or "authentication failed" in combined_err:
                return {
                    "success": False,
                    "error": "SSH authentication failed. Please check your SSH username and password.",
                }
            if "connection refused" in combined_err:
                return {
                    "success": False,
                    "error": f"SSH connection refused on {ip}:{ssh_port}. Is OpenSSH Server running on the PC?",
                }
            if "connection timed out" in combined_err or "timed out" in combined_err:
                return {
                    "success": False,
                    "error": f"SSH connection to {ip}:{ssh_port} timed out. Ensure the PC is online and reachable.",
                }

            if rc in (255, 1) and any(
                kw in combined_err
                for kw in ("closed by remote host", "connection reset", "broken pipe")
            ):
                self._shutdown_until[target_id] = time.monotonic() + 180.0
                decky.logger.info(
                    f"SSH connection closed by remote host during shutdown (rc={rc}). Assuming success."
                )
                return {"success": True}

            decky.logger.warning(f"SSH shutdown returned exit code {rc}: {stderr or stdout}")
            return {
                "success": False,
                "error": stderr or stdout or f"SSH exited with code {rc}",
            }
        except Exception as e:
            decky.logger.error(f"SSH shutdown exception: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if askpass_path and os.path.exists(askpass_path):
                try:
                    os.remove(askpass_path)
                except Exception:
                    pass

    async def get_initial_state(self) -> Dict[str, Any]:
        """Return VPNs, configured WoL targets, and live ping statuses in one call."""
        if "wol_targets" not in self.settings:
            self._load_settings()
        vpns = await self.get_vpns()
        statuses = await self.ping_all_targets(vpns=vpns)
        return {
            "vpns": vpns,
            "targets": self.settings.get("wol_targets", []),
            "ping_status": statuses,
        }

    def _ensure_polkit_rule(self) -> None:
        """
        Ensure a Polkit rule exists so NetworkManager allows VPN activation from background
        services (like Decky Loader's plugin_loader.service) without an interactive Polkit agent.
        """
        polkit_dir = "/etc/polkit-1/rules.d"
        rule_path = os.path.join(polkit_dir, "90-decky-vpn-wol.rules")
        try:
            if hasattr(os, "geteuid") and os.geteuid() == 0 and os.path.isdir(polkit_dir):
                if not os.path.exists(rule_path):
                    rule_content = (
                        "// Allow Decky VPN-WoL plugin / wheel users to control NetworkManager without interactive prompt\n"
                        "polkit.addRule(function(action, subject) {\n"
                        '    if (action.id.indexOf("org.freedesktop.NetworkManager.") === 0 &&\n'
                        '        (subject.isInGroup("wheel") || subject.isInGroup("network") || subject.user === "'
                        + os.environ.get("DECKY_USER", "deck")
                        + '")) {\n'
                        "        return polkit.Result.YES;\n"
                        "    }\n"
                        "});\n"
                    )
                    with open(rule_path, "w", encoding="utf-8") as f:
                        f.write(rule_content)
                    os.chmod(rule_path, 0o644)
                    decky.logger.info(f"Installed Polkit rule at {rule_path}")
        except Exception as e:
            decky.logger.warning(f"Could not write Polkit rule: {e}")

    async def _main(self):
        self.loop = asyncio.get_event_loop()
        self._load_settings()
        self._ensure_polkit_rule()
        euid = os.geteuid() if hasattr(os, "geteuid") else -1
        decky.logger.info(f"VPN & Wake-on-LAN Plugin loaded successfully (euid={euid}).")

    async def _unload(self):
        decky.logger.info("VPN & Wake-on-LAN Plugin unloaded.")

    async def _uninstall(self):
        try:
            rule_path = "/etc/polkit-1/rules.d/90-decky-vpn-wol.rules"
            if os.path.exists(rule_path):
                os.remove(rule_path)
        except Exception:
            pass
        decky.logger.info("VPN & Wake-on-LAN Plugin uninstalled.")

    async def _migration(self):
        decky.logger.info("Running VPN & Wake-on-LAN migrations if needed.")
