# VPN & Wake-on-LAN — Decky Loader Plugin

A Decky Loader plugin for **SteamOS / CachyOS / Bazzite / Linux Handhelds** (Steam Deck, Lenovo Legion Go, ROG Ally) to discover and toggle **VPN connections** (`NetworkManager` & `WireGuard`) and wake up remote or local PCs via **Wake-on-LAN (WoL)**.

🌍 **Multi-language support:** Automatically adapts to your Steam / system language (**English, Deutsch, Français, Español, Italiano, Português, Polski, Русский**).

---

## Features (English)

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
- **Layer-3 VPN & Router Auto-Wake Support**:
  - Sends the 102-byte Magic Packet simultaneously via **direct UDP unicast** to the PC IP, **directed subnet broadcast** (e.g. `192.168.1.255`), and **global broadcast** (`255.255.255.255`), bound directly to the VPN interface (`SO_BINDTODEVICE`) as well as standard kernel routing.
  - Optional **Router Auto-Wake / ARP Trigger**: Sends ICMP Ping & TCP SYN probes to the target IP to refresh router ARP caches or trigger router *Wake-on-Access* features when waking a PC that has been powered off for a long time.

### Installation
1. Download `VPN-WoL.zip` from Releases (or from this repository).
2. In Steam Game Mode, open **Decky Loader Settings** -> **General** -> enable **Developer Mode**.
3. Go to **Developer** -> **Install Plugin from ZIP File** and select `VPN-WoL.zip`.
   *(Alternatively, run `./install.sh` from a terminal).*

---

## Funktionen (Deutsch)

### 1. VPN-Verwaltung (NetworkManager & WireGuard)
- **Automatische Erkennung**:
  - Liest alle in **NetworkManager (`nmcli`)** hinterlegten VPN- und WireGuard-Profile sowie **`/etc/wireguard/*.conf` (`wg-quick`)** aus.
- **Direktes Umschalten**:
  - Ein-/Ausschalten jedes VPNs direkt im Decky Quick Access Menü inkl. Anzeige von Verbindungsstatus, Tunnel-IP und Interface.

### 2. Wake-on-LAN über VPN & Heimnetz
- **PC-Profile direkt in der UI verwalten**:
  - Name, MAC-Adresse, lokale IP-Adresse, Port und verknüpftes VPN-Profil.
- **1-Klick „⚡ VPN starten & wecken"**:
  - Verbindet ein zugeordnetes VPN bei Bedarf automatisch vor dem Senden des Wake-on-LAN-Pakets.
- **Live Ping-Status & Aufwach-Überwachung**:
  - Zeigt live an, ob der PC erreichbar ist (`Online (12 ms)` / `Offline`), und benachrichtigt per Steam-Toast, sobald der geweckte PC antwortet.
- **Router Auto-Wake / ARP-Trigger**:
  - Kombiniert UDP-Magic-Packets (Unicast, Subnet-Broadcast & `SO_BINDTODEVICE`) mit optionalen Ping-/TCP-Impulsen, damit Router den ARP-Cache auflösen bzw. *Wake-on-Access*-Funktionen (automatisches Starten bei Zugriff aus dem VPN) zuverlässig auslösen.

### Installation
1. Lade `VPN-WoL.zip` herunter.
2. Öffne im Steam Game Mode die **Decky Loader Einstellungen** -> aktiviere unter **General** den **Developer Mode**.
3. Wähle unter **Developer** -> **Install Plugin from ZIP File** die Datei `VPN-WoL.zip` aus (oder führe `./install.sh` im Terminal aus).

---

## Development / Build from Source

```bash
pnpm install
pnpm run build
```
