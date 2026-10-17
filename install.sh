#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR_NAME="VPN-WoL"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine target user's home directory even when run with sudo
if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
    USER_HOME="$(getent passwd "$SUDO_USER" | cut -d: -f6)"
else
    USER_HOME="$HOME"
fi

HOMEBREW_PLUGINS="${USER_HOME}/homebrew/plugins"
TARGET_DIR="${HOMEBREW_PLUGINS}/${PLUGIN_DIR_NAME}"

echo "==> Installiere Decky Plugin '${PLUGIN_DIR_NAME}' nach: ${TARGET_DIR}"

# Optional: Falls pnpm installiert ist und node_modules existiert, neu bauen
if command -v pnpm >/dev/null 2>&1 && [ -d "${SCRIPT_DIR}/node_modules" ]; then
    echo "==> Baue Frontend mit pnpm..."
    (cd "${SCRIPT_DIR}" && pnpm run build)
fi

sudo mkdir -p "${TARGET_DIR}/dist"
sudo cp -f "${SCRIPT_DIR}/plugin.json" "${TARGET_DIR}/"
sudo cp -f "${SCRIPT_DIR}/package.json" "${TARGET_DIR}/"
sudo cp -f "${SCRIPT_DIR}/main.py" "${TARGET_DIR}/"
sudo cp -f "${SCRIPT_DIR}/LICENSE" "${TARGET_DIR}/"
sudo cp -rf "${SCRIPT_DIR}/dist/"* "${TARGET_DIR}/dist/"

sudo chmod -R 755 "${TARGET_DIR}"

# Polkit-Regel für NetworkManager anlegen, falls noch nicht vorhanden
if [ -d "/etc/polkit-1/rules.d" ]; then
    echo "==> Erstelle Polkit-Regel für NetworkManager..."
    sudo tee /etc/polkit-1/rules.d/90-decky-vpn-wol.rules >/dev/null <<'EOF'
polkit.addRule(function(action, subject) {
    if (action.id.indexOf("org.freedesktop.NetworkManager.") === 0 &&
        (subject.isInGroup("wheel") || subject.isInGroup("network"))) {
        return polkit.Result.YES;
    }
});
EOF
    sudo chmod 644 /etc/polkit-1/rules.d/90-decky-vpn-wol.rules
fi

echo "==> Starte Decky Loader (plugin_loader.service) neu..."
if systemctl is-active --quiet plugin_loader.service; then
    sudo systemctl restart plugin_loader.service
    echo "==> Fertig! Das Plugin 'VPN & Wake-on-LAN' ist jetzt im Quick Access Menü verfügbar."
else
    echo "==> Hinweis: plugin_loader.service läuft aktuell nicht oder heißt anders. Bitte starte Decky Loader neu."
fi
