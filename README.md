# VPN & Wake-on-LAN — Decky Loader Plugin

A Decky Loader plugin for **SteamOS / CachyOS / Bazzite / Linux Handhelds** (Steam Deck, Lenovo Legion Go, ROG Ally) to discover and toggle **VPN connections** (`NetworkManager` & `WireGuard`) and wake up remote or local PCs via **Wake-on-LAN (WoL)**.

🌍 **Multi-language support:** Automatically adapts to your Steam / system language (**English, Deutsch, Français, Español, Italiano, Português, Polski, Русский**).

> 💡 **About this project:**
> I had the idea for this plugin because I couldn't find any existing Decky plugin that lets you easily switch VPN connections and wake up your home PC via Wake-on-LAN over that VPN. Because of that, I decided to vibe-code it myself — everyone is warmly welcome to test, use, and share feedback!

---

## Features

### 1. VPN Management (NetworkManager & WireGuard)
- **Automatic Discovery**:
  - Reads all VPN & WireGuard profiles configured in **NetworkManager (`nmcli`)**.
  - Reads standalone **WireGuard configurations (`/etc/wireguard/*.conf`)** and active `wg` interfaces.
- **Instant Switching**:
  - Toggle VPNs directly from the Decky Quick Access Menu (`...` button).
  - Displays connection state, tunnel IP address, and interface name.

### 2. Wake-on-LAN over VPN & Local Network
- **Manage Multiple PC Profiles in the UI**:
  - Configure PC Name, MAC address, local IP address, UDP port, and an optional linked VPN profile.
- **1-Click "⚡ Start VPN & Wake"**:
  - If a PC profile has a linked VPN that is currently disconnected, clicking Wake automatically connects the VPN first, waits for the tunnel interface to come up, and then sends the Wake-on-LAN packets.
- **Live Ping Status & Wake-up Watcher**:
  - Shows live reachability (`Online (12 ms)` vs. `Offline`).
  - Automatically polls the target PC after sending WoL and displays a Steam Toast notification as soon as the PC comes online.
- **Layer-3 VPN, Router TR-064 & Auto-Wake Support**:
  - **Router TR-064 Wake-on-LAN (e.g. FRITZ!Box)**: Optionally configure your router password to instruct the router via TR-064 (`WakeOnLANByMACAddress`) to broadcast a true Layer-2 Magic Packet inside your home LAN — works reliably even over mobile WireGuard VPN when the PC has been powered off for hours and its ARP entry has expired. *(Tip: When using TR-064, leave the router's automatic "Wake on internet access" checkbox disabled so live ping checks never wake your PC unintentionally).*
  - Sends the 102-byte Magic Packet simultaneously via **direct UDP unicast** to the PC IP, **directed subnet broadcast** (e.g. `192.168.1.255`), and **global broadcast** (`255.255.255.255`), bound directly to the VPN interface (`SO_BINDTODEVICE`) as well as standard kernel routing.
  - Optional **Router Auto-Wake / ARP Trigger**: Sends ICMP Ping & TCP SYN probes to the target IP when waking a PC if your router does not use TR-064.

### 3. Remote PC Shutdown & Windows Hello PIN Auto-Login via SSH
- **1-Click Remote Shutdown (Windows & Linux)**:
  - Displays a red **⏻ Shutdown** button when your target PC is online.
  - Opens a confirmation dialog before sending the shutdown command to prevent accidental shutdowns.
  - Windows command: `shutdown /s /t 0` | Linux command: `systemctl poweroff`
- **Windows Hello PIN Auto-Login (for Steam Remote Play / Sunshine / Moonlight)**:
  - Steam Remote Play and many streaming hosts only become available *after* a user logs into the Windows desktop session.
  - Enable **Auto-login after Wake-on-LAN (Windows Hello PIN)** to automatically unlock the Windows lock screen using your Windows Hello PIN as soon as the PC boots up after WoL.
  - Also adds a manual **🔓 Login (PIN)** button next to the Shutdown button whenever the PC is online.
- **SSH Authentication (SSH Keys & Password)**:
  - Automatically discovers your user's SSH private keys (`~/.ssh/id_ed25519`, `id_rsa`, `id_ecdsa`) on the handheld, or uses an SSH password if configured.
  - **Windows 10/11 OpenSSH Setup Tip**:
    Run in an elevated **PowerShell (as Administrator)** on your Windows PC:
    ```powershell
    # 1. Enable and start OpenSSH Server
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Start-Service sshd
    Set-Service -Name sshd -StartupType 'Automatic'

    # 2. (Optional, recommended) Register your handheld's SSH public key for admin users
    $pubKey = "ssh-ed25519 AAAA... your-public-key"
    $authFile = "C:\ProgramData\ssh\administrators_authorized_keys"
    Add-Content -Path $authFile -Value $pubKey -Encoding Ascii
    icacls.exe $authFile /inheritance:r /grant "*S-1-5-18:F" /grant "*S-1-5-32-544:F"
    Restart-Service sshd
    ```

### Installation
1. Download **[`VPN-WoL.zip`](https://github.com/TochaRude/VPN-WoL-Decky/releases/latest)** from the **[Releases](https://github.com/TochaRude/VPN-WoL-Decky/releases)** section.
2. In Steam Game Mode, open **Decky Loader Settings** -> **General** -> enable **Developer Mode**.
3. Go to **Developer** -> **Install Plugin from ZIP File** and select `VPN-WoL.zip`.
   *(Alternatively, run `./install.sh` from a terminal).*

---

## Development / Build from Source

```bash
pnpm install
pnpm run build
```
