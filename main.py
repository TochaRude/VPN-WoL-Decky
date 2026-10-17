import asyncio
import glob
import ipaddress
import json
import os
import re
import socket
import uuid
from typing import Any, Dict, List, Optional, Tuple

import decky


def normalize_mac(mac_str: str) -> str:
    """Validate and normalize a MAC address to AA:BB:CC:DD:EE:FF format."""
    if not mac_str:
        raise ValueError("MAC-Adresse darf nicht leer sein.")
    clean = re.sub(r"[^0-9A-Fa-f]", "", mac_str).upper()
    if len(clean) != 12:
        raise ValueError(
            f"Ungültige MAC-Adresse '{mac_str}'. Erwartet werden 12 Hex-Zeichen (z.B. AA:BB:CC:DD:EE:FF)."
        )
    return ":".join(clean[i : i + 2] for i in range(0, 12, 2))


def create_magic_packet(mac_str: str) -> bytes:
    """Create a 102-byte Wake-on-LAN Magic Packet."""
    normalized = normalize_mac(mac_str)
    mac_bytes = bytes.fromhex(normalized.replace(":", ""))
    return b"\xff" * 6 + mac_bytes * 16


def derive_subnet_broadcast(ip_str: str) -> Optional[str]:
    """Derive a /24 subnet broadcast address from an IPv4 address (e.g. 192.168.178.20 -> 192.168.178.255)."""
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


class Plugin:
    settings_path: str = ""
    settings: Dict[str, Any] = {}

    def _clean_env(self) -> Dict[str, str]:
        """
        Return a sanitized environment dictionary for running host commands on CachyOS/SteamOS.
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
        self, args: List[str], timeout: float = 15.0, privileged: bool = False
    ) -> Tuple[int, str, str]:
        """Execute a system command asynchronously and return (returncode, stdout, stderr)."""
        cmd_args = self._priv_args(args) if privileged else args
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=self._clean_env(),
            )
            stdout_b, stderr_b = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            stdout = stdout_b.decode("utf-8", errors="replace").strip()
            stderr = stderr_b.decode("utf-8", errors="replace").strip()
            return proc.returncode or 0, stdout, stderr
        except asyncio.TimeoutError:
            decky.logger.warning(f"Command timed out after {timeout}s: {' '.join(cmd_args)}")
            return 124, "", f"Zeitüberschreitung nach {int(timeout)}s bei Befehl: {' '.join(cmd_args)}"
        except FileNotFoundError:
            return 127, "", f"Befehl nicht gefunden: {cmd_args[0]}"
        except Exception as e:
            decky.logger.error(f"Error running command {' '.join(cmd_args)}: {e}")
            return 1, "", str(e)

    def _load_settings(self) -> None:
        os.makedirs(decky.DECKY_SETTINGS_DIR, exist_ok=True)
        self.settings_path = os.path.join(decky.DECKY_SETTINGS_DIR, "settings.json")
        default_settings: Dict[str, Any] = {
            "wol_targets": [],
        }
        if os.path.exists(self.settings_path):
            try:
                with open(self.settings_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                if isinstance(loaded, dict):
                    default_settings.update(loaded)
            except Exception as e:
                decky.logger.error(f"Failed to load settings.json: {e}")
        self.settings = default_settings

    def _save_settings(self) -> None:
        try:
            os.makedirs(decky.DECKY_SETTINGS_DIR, exist_ok=True)
            with open(self.settings_path, "w", encoding="utf-8") as f:
                json.dump(self.settings, f, indent=2, ensure_ascii=False)
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
                "error": f"Ungültige VPN-ID: {vpn_id}",
                "vpns": await self.get_vpns(),
            }

        backend, identifier = vpn_id.split(":", 1)
        action_word = "verbunden" if enable else "getrennt"

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
                err_msg = stderr or stdout or f"nmcli Fehlercode {rc}"
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
                    err_msg = stderr or stdout or stderr2 or stdout2 or f"wg-quick Fehlercode {rc}"
                    decky.logger.error(f"wg-quick failed for {vpn_id}: {err_msg}")
                    return {
                        "success": False,
                        "error": err_msg,
                        "vpns": await self.get_vpns(),
                    }
        else:
            return {
                "success": False,
                "error": f"Unbekanntes VPN-Backend: {backend}",
                "vpns": await self.get_vpns(),
            }

        # Wait briefly for interface and routing table to settle
        await asyncio.sleep(0.4)
        vpns = await self.get_vpns()
        return {
            "success": True,
            "message": f"VPN erfolgreich {action_word}.",
            "vpns": vpns,
        }

    async def get_wol_targets(self) -> List[Dict[str, Any]]:
        """Return the list of configured Wake-on-LAN targets."""
        return self.settings.get("wol_targets", [])

    async def save_wol_target(self, target: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a Wake-on-LAN PC profile."""
        try:
            name = (target.get("name") or "").strip() or "Mein PC"
            mac = normalize_mac(target.get("mac", ""))
            ip = (target.get("ip") or "").strip()
            broadcast_ip = (target.get("broadcast_ip") or "").strip()
            vpn_id = (target.get("vpn_id") or "").strip()
            fritzbox_trigger = bool(target.get("fritzbox_trigger", True))

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
                        "error": f"Ungültige IPv4-Adresse: '{ip}'",
                        "targets": self.settings.get("wol_targets", []),
                    }

            if broadcast_ip:
                try:
                    ipaddress.IPv4Address(broadcast_ip)
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Ungültige Broadcast-IP: '{broadcast_ip}'",
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
                "fritzbox_trigger": fritzbox_trigger,
            }

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
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        targets = [t for t in targets if t.get("id") != target_id]
        self.settings["wol_targets"] = targets
        self._save_settings()
        return {
            "success": True,
            "targets": targets,
        }

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

    async def ping_all_targets(self) -> Dict[str, Dict[str, Any]]:
        """Ping all configured WoL targets concurrently and return a map of target_id -> status."""
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        results: Dict[str, Dict[str, Any]] = {}

        async def _check_one(t: Dict[str, Any]) -> None:
            tid = t.get("id", "")
            ip = (t.get("ip") or "").strip()
            if not tid:
                return
            if not ip:
                results[tid] = {"online": False, "latency_ms": None}
                return
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

    async def _trigger_fritzbox_wake_on_access(self, ip: str, bind_iface: Optional[str] = None) -> None:
        """
        Trigger FritzBox 'Computer automatisch starten, sobald darauf zugegriffen wird'
        and stimulate ARP resolution by sending ICMP Echo + quick TCP SYN probes to common PC ports.
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
        - Sends UDP Magic Packets (Unicast to PC IP, Directed Subnet Broadcast, and Global Broadcast)
          across both kernel-routed sockets and SO_BINDTODEVICE on the VPN interface.
        - Optionally triggers FritzBox Auto-Wake via ICMP Ping + TCP SYN probes.
        """
        targets: List[Dict[str, Any]] = self.settings.get("wol_targets", [])
        target = next((t for t in targets if t.get("id") == target_id), None)
        if not target:
            return {"success": False, "error": "PC-Profil wurde nicht gefunden."}

        try:
            magic_packet = create_magic_packet(target.get("mac", ""))
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
                # Fallback match by name if UUID changed
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
                            "error": f"VPN '{linked_vpn.get('name')}' konnte nicht gestartet werden: {res.get('error')}",
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
            # If no specific VPN is assigned, check if any VPN is currently active and grab its interface
            first_active = next((v for v in vpns if v.get("active") and v.get("interface")), None)
            if first_active:
                active_vpn_iface = first_active.get("interface")

        # 2. Build destination IP list
        pc_ip = (target.get("ip") or "").strip()
        explicit_bcast = (target.get("broadcast_ip") or "").strip()
        configured_port = int(target.get("port") or 9)

        dest_ips: List[str] = []
        if pc_ip:
            # Direct Unicast to PC IP (routed over WireGuard L3 tunnel directly to FritzBox)
            dest_ips.append(pc_ip)
            # Derived /24 subnet broadcast (e.g. 192.168.178.255)
            subnet_bcast = derive_subnet_broadcast(pc_ip)
            if subnet_bcast and subnet_bcast not in dest_ips:
                dest_ips.append(subnet_bcast)

        if explicit_bcast and explicit_bcast not in dest_ips:
            dest_ips.append(explicit_bcast)

        # Also include active VPN subnet broadcast if available
        if active_vpn_iface:
            vpn_obj = next((v for v in vpns if v.get("interface") == active_vpn_iface), None)
            if vpn_obj and vpn_obj.get("broadcast"):
                vb = vpn_obj["broadcast"]
                if vb not in dest_ips:
                    dest_ips.append(vb)

        if "255.255.255.255" not in dest_ips:
            dest_ips.append("255.255.255.255")

        # Deduplicated UDP ports (configured port + standard WoL ports 9 and 7)
        ports: List[int] = []
        for p in (configured_port, 9, 7):
            if 1 <= p <= 65535 and p not in ports:
                ports.append(p)

        # 3. Optional FritzBox Auto-Wake trigger (ICMP Ping + TCP SYN probes)
        if target.get("fritzbox_trigger", True) and pc_ip:
            await self._trigger_fritzbox_wake_on_access(pc_ip, active_vpn_iface)

        # 4. Send Magic Packets in 3 bursts for reliability over WireGuard / Wi-Fi
        sent_endpoints = set()

        def _send_burst() -> None:
            for dip in dest_ips:
                for dport in ports:
                    # Standard kernel-routed UDP send
                    if self._send_udp_packet(magic_packet, dip, dport, bind_iface=None):
                        sent_endpoints.add(f"{dip}:{dport}")
                    # Interface-bound UDP send (if VPN interface is active)
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
                "error": "Wake-on-LAN Paket konnte über keine Netzwerkschnittstelle gesendet werden.",
                "vpns": vpns,
            }

        target_name = target.get("name", "PC")
        msg = f"Wake-on-LAN an '{target_name}' ({target.get('mac')}) gesendet."
        if vpn_was_activated:
            msg = f"VPN aktiviert & {msg}"

        decky.logger.info(f"{msg} Endpoints: {sorted(sent_endpoints)}")
        return {
            "success": True,
            "message": msg,
            "vpn_activated": vpn_was_activated,
            "endpoints": sorted(sent_endpoints),
            "vpns": vpns,
        }

    async def get_initial_state(self) -> Dict[str, Any]:
        """Return VPNs, configured WoL targets, and live ping statuses in one call."""
        vpns, statuses = await asyncio.gather(
            self.get_vpns(),
            self.ping_all_targets(),
        )
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
