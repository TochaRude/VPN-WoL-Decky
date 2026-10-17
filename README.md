# VPN & Wake-on-LAN – Decky Loader Plugin

Ein Decky Loader Plugin für **CachyOS / SteamOS** (z. B. auf dem **Lenovo Legion Go** oder Steam Deck), das vorhandene VPN-Verbindungen ausliest, per Schalter umschaltet und PCs per **Wake-on-LAN (WoL)** über das VPN (speziell optimiert für **WireGuard + FritzBox**) aufweckt.

---

## Funktionen

### 1. VPN-Verwaltung (NetworkManager & WireGuard)
- **Automatische Erkennung**:
  - Liest alle in **NetworkManager (`nmcli`)** hinterlegten VPN- und WireGuard-Profile aus (z. B. über die KDE Plasma Netzwerkeinstellungen eingerichtet).
  - Liest zusätzlich klassische **WireGuard-Konfigurationen (`/etc/wireguard/*.conf`)** sowie aktive `wg`-Interfaces aus.
- **Direktes Umschalten**:
  - Ein-/Ausschalten jedes VPNs direkt im Decky Quick Access Menü (`...`-Taste).
  - Zeigt den Verbindungsstatus (🟢 Verbunden / ⚪ Getrennt), die zugewiesene Tunnel-IP-Adresse (z. B. `192.168.178.201/24`) und das Interface an.

### 2. Wake-on-LAN über WireGuard / FritzBox
- **Mehrere PC-Profile direkt in der UI verwalten**:
  - Name, MAC-Adresse, lokale IP-Adresse im Heimnetz (z. B. `192.168.178.20`), Port und verknüpftes VPN-Profil.
- **1-Klick „⚡ VPN starten & wecken"**:
  - Wenn dem PC ein VPN zugewiesen ist und dieses noch getrennt ist, aktiviert das Plugin beim Klick auf *Wecken* zuerst automatisch das VPN, wartet auf das Interface und sendet danach die Wake-on-LAN-Pakete.
- **Live Ping-Status & Aufwach-Überwachung**:
  - Zeigt live an, ob der PC erreichbar ist (`Online (12 ms)` vs. `Offline`).
  - Nach dem Senden des WoL-Pakets prüft das Plugin im Hintergrund automatisch per Ping, wann der PC hochgefahren ist, und zeigt eine Steam-Toast-Benachrichtigung an, sobald er antwortet.
- **Spezielle FritzBox + WireGuard Unterstützung**:
  - Da WireGuard auf Layer 3 arbeitet, sendet das Plugin das 102-Byte Magic Packet gleichzeitig:
    1. **Als direktes UDP-Unicast** an die IP des PCs (`192.168.178.X`) über den WireGuard-Tunnel,
    2. **Als gerichteten Subnet-Broadcast** (`192.168.178.255`) und globalen Broadcast (`255.255.255.255`),
    3. **Gebunden an das aktive VPN-Interface (`SO_BINDTODEVICE`)** sowie über das Standard-Kernel-Routing,
    4. **Mit FritzBox Auto-Wake Trigger**: Sendet zusätzlich kurze ICMP-Ping- und TCP-SYN-Pakete an die PC-IP. Falls die FritzBox den ARP-Eintrag des ausgeschalteten PCs nach längerer Ruhezeit verworfen hat, greift damit die FritzBox-Option *„Diesen Computer automatisch starten, sobald aus dem Internet darauf zugegriffen wird"*.

---

## Installation auf dem Lenovo Legion Go (CachyOS)

Das Plugin enthält bereits eine fertig gebaute [`dist/index.js`](file:///c:/Users/ootoc/source/repos/VPN_WoL/dist/index.js) sowie ein installationsfertiges Archiv [`VPN-WoL.zip`](file:///c:/Users/ootoc/source/repos/VPN_WoL/VPN-WoL.zip).

### Methode A: Über Decky Loader per ZIP installieren (Empfohlen)
1. Kopiere die Datei [`VPN-WoL.zip`](file:///c:/Users/ootoc/source/repos/VPN_WoL/VPN-WoL.zip) auf dein Lenovo Legion Go.
2. Öffne im Steam Game Mode die **Decky Loader Einstellungen** (Zahnrad-Symbol).
3. Aktiviere unter **General** den **Developer Mode**, falls noch nicht aktiv.
4. Wechsle zum Reiter **Developer** -> **Install Plugin from ZIP File** und wähle `VPN-WoL.zip` aus.

### Methode B: Per Installationsskript (`install.sh`) im Terminal
1. Kopiere diesen Projektordner auf dein Legion Go.
2. Führe im Terminal im Projektordner folgenden Befehl aus:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   Das Skript kopiert alle Dateien nach `~/homebrew/plugins/VPN-WoL` und startet `plugin_loader.service` automatisch neu.

---

## Hinweis für zuverlässiges Wake-on-LAN über die FritzBox

Wenn ein PC länger als ca. 15 Minuten ausgeschaltet ist, löscht die FritzBox dessen MAC-Adresse aus ihrem internen ARP-Cache und verwirft reine UDP-Pakete aus dem WireGuard-Tunnel.

Damit das Aufwecken über WireGuard **auch nach Stunden** immer zuverlässig funktioniert:
1. Öffne deine FritzBox-Oberfläche (`http://fritz.box` bzw. `192.168.178.1`).
2. Gehe zu **Heimnetz -> Netzwerk -> Netzwerkverbindungen**.
3. Klicke beim gewünschten PC auf **Bearbeiten** (Stift-Symbol).
4. Aktiviere **„Diesen Computer immer die gleiche IPv4-Adresse zuweisen"**.
5. Aktiviere im Bereich *Wake on LAN* die Option **„Diesen Computer automatisch starten, sobald aus dem Internet darauf zugegriffen wird"** (funktioniert bei der FritzBox auch bei Zugriffen über das WireGuard-VPN durch den im Plugin integrierten *FritzBox Auto-Wake Trigger*).

---

## Eigene Entwicklung / Build aus dem Quellcode

Falls du Änderungen am TypeScript-Frontend ([`src/index.tsx`](file:///c:/Users/ootoc/source/repos/VPN_WoL/src/index.tsx), [`src/components/TargetModal.tsx`](file:///c:/Users/ootoc/source/repos/VPN_WoL/src/components/TargetModal.tsx)) vornehmen möchtest:

```bash
pnpm install
pnpm run build
```

Die Konfigurationsdatei mit den gespeicherten PC-Profilen legt Decky Loader unter `~/homebrew/settings/VPN-WoL/settings.json` ab.
