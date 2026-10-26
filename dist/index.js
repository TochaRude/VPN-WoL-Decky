const manifest = {
  name: "VPN & Wake-on-LAN",
  author: "TochaRude",
  flags: ["root"],
  api_version: 1,
  publish: {
    tags: ["vpn", "wireguard", "wol", "wake-on-lan", "network", "root"],
    description:
      "Manage and toggle VPN connections (NetworkManager & WireGuard) and wake up PCs via Wake-on-LAN over VPN or local network.",
    image: "https://opengraph.githubassets.com/1/TochaRude/VPN-WoL-Decky",
  },
};

const API_VERSION = 2;
if (!manifest?.name) {
  throw new Error("[@decky/api]: Failed to find plugin manifest.");
}
const internalAPIConnection =
  window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
  throw new Error(
    "[@decky/api]: Failed to connect to the loader as the loader API was not initialized."
  );
}
let api;
try {
  api = internalAPIConnection.connect(API_VERSION, manifest.name);
} catch {
  api = internalAPIConnection.connect(1, manifest.name);
  console.warn(
    `[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1.`
  );
}

const callable = api.callable;
const toaster = api.toaster;
const useQuickAccessVisible = api.useQuickAccessVisible;
const definePlugin = (fn) => (...args) => fn(...args);

// Localization (i18n)
const translations = {
  en: {
    vpnSectionTitle: "VPN Connections",
    noVpnsFound: "No VPN profiles found in NetworkManager (nmcli) or /etc/wireguard.",
    statusSwitching: "Switching...",
    statusConnected: "Connected",
    statusDisconnected: "Disconnected",
    refreshStatus: "Refresh Status",
    wolSectionTitle: "Wake-on-LAN (PCs)",
    noTargetsConfigured:
      "No PC profile configured yet. Add your PC to wake it up over VPN or local network.",
    badgeOnline: "Online",
    badgeWaking: "Waking up...",
    badgeOffline: "Offline",
    badgeReady: "Ready",
    vpnAutoStartHint: "Starts automatically",
    btnSendingWol: "Sending WoL...",
    btnStartVpnAndWake: "⚡ Start VPN & Wake",
    btnWakePc: "⚡ Wake PC (WoL)",
    btnAddPc: "+ Add New PC",
    toastVpnConnected: "Connection established.",
    toastVpnDisconnected: "Connection closed.",
    toastVpnErrorTitle: "VPN Error",
    toastWolSentTitle: "Wake-on-LAN Sent",
    toastWolSentBody: "Magic Packet sent to {name}.",
    toastWolFailedTitle: "Wake-on-LAN Failed",
    toastPcOnlineTitle: "{name} is online!",
    toastPcOnlineBody: "Reply from {ip}",
    modalTitleEdit: "Edit PC: {name}",
    modalTitleNew: "Add New PC (Wake-on-LAN)",
    errMacRequired: "Please enter the MAC address of your PC (e.g. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Failed to save PC profile.",
    fieldPcNameLabel: "PC Name",
    fieldPcNameDesc: "Display name in the Quick Access Menu (e.g. Gaming PC)",
    fieldMacLabel: "MAC Address (Required)",
    fieldMacDesc: "Format: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Local IP Address of PC",
    fieldIpDesc:
      "Used for live ping status, direct VPN unicast WoL, and subnet broadcast (e.g. 192.168.1.20)",
    fieldVpnLabel: "Linked VPN",
    fieldVpnDesc: "Automatically connects before waking when using 'Start VPN & Wake'",
    fieldVpnNone: "No fixed VPN (use current network)",
    fieldWakeTriggerLabel: "Router Auto-Wake / ARP Trigger",
    fieldWakeTriggerDesc:
      "Sends additional ping & TCP packets to the PC IP (refreshes router ARP cache and triggers router wake-on-access)",
    fieldBroadcastLabel: "Custom Broadcast IP (Optional)",
    fieldBroadcastDesc: "Leave empty for automatic calculation from PC IP",
    fieldPortLabel: "UDP Port",
    fieldPortDesc: "Default is 9 (sends on port 9, 7, and this port for reliability)",
    fieldRouterPasswordLabel: "Router Password for VPN Wake-on-LAN (Optional, TR-064)",
    fieldRouterPasswordDesc:
      "Recommended for WireGuard over mobile hotspot: lets your router send a real Layer-2 WoL broadcast inside your home LAN",
    fieldRouterUserLabel: "Router Username (Optional)",
    fieldRouterUserDesc: "Leave empty for automatic detection of default router user",
    fieldRouterIpLabel: "Router IP Address (Optional)",
    fieldRouterIpDesc: "Leave empty for automatic gateway detection (e.g. 192.168.178.1)",
    btnShutdownPc: "⏻ Shutdown",
    btnShuttingDown: "Shutting down...",
    modalSectionSsh: "Remote Shutdown via SSH (Optional)",
    fieldSshEnableLabel: "Enable SSH Shutdown",
    fieldSshEnableDesc: "Shows a shutdown button in the menu when this PC is online",
    fieldSshUserLabel: "SSH Username",
    fieldSshUserDesc: "Username on the PC (e.g. Windows account name)",
    fieldSshPasswordLabel: "SSH Password (Optional)",
    fieldSshPasswordDesc: "Leave empty if using SSH key authentication",
    fieldSshPortLabel: "SSH Port",
    fieldSshPortDesc: "Default is 22",
    fieldSshOsLabel: "PC Operating System",
    fieldSshOsDesc: "Windows sends 'shutdown /s /t 0', Linux sends 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Auto-Login after WoL (Windows PIN)",
    fieldSshAutoLoginDesc:
      "Automatically signs in on the Windows lock screen using your PIN after Wake-on-LAN (ideal for Steam Remote Play)",
    fieldSshPinLabel: "Windows Hello PIN",
    fieldSshPinDesc: "Sent via SSH to unlock the Windows sign-in screen after waking up",
    errPinRequired: "Please enter your Windows Hello PIN for Auto-Login.",
    btnLoginPc: "🔓 Login (PIN)",
    btnLoggingIn: "Logging in...",
    toastLoginSuccessTitle: "Windows Login Successful",
    toastLoginSuccessBody: "{name} unlocked via Windows Hello PIN.",
    toastLoginAlreadyTitle: "{name} Unlocked",
    toastLoginAlreadyBody: "Windows session is already logged in.",
    toastLoginFailedTitle: "Windows Login Failed",
    toastShutdownSentTitle: "Shutdown Command Sent",
    toastShutdownSentBody: "Shutdown signal sent to {name}.",
    toastShutdownFailedTitle: "Shutdown Failed",
    confirmShutdownTitle: "Shutdown PC?",
    confirmShutdownBody: "Are you sure you want to shut down '{name}'?",
    confirmShutdownButton: "Shutdown",
    btnDelete: "Delete",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnSaving: "Saving...",
  },
  de: {
    vpnSectionTitle: "VPN-Verbindungen",
    noVpnsFound:
      "Keine VPN-Profile in NetworkManager (nmcli) oder /etc/wireguard gefunden.",
    statusSwitching: "Schalte um...",
    statusConnected: "Verbunden",
    statusDisconnected: "Getrennt",
    refreshStatus: "Status aktualisieren",
    wolSectionTitle: "Wake-on-LAN (PCs)",
    noTargetsConfigured:
      "Noch kein PC-Profil eingerichtet. Füge deinen PC hinzu, um ihn über das VPN oder Heimnetz aufzuwecken.",
    badgeOnline: "Online",
    badgeWaking: "Wecke auf...",
    badgeOffline: "Offline",
    badgeReady: "Bereit",
    vpnAutoStartHint: "Wird automatisch gestartet",
    btnSendingWol: "Sende WoL...",
    btnStartVpnAndWake: "⚡ VPN starten & wecken",
    btnWakePc: "⚡ PC wecken (WoL)",
    btnAddPc: "+ Neuen PC hinzufügen",
    toastVpnConnected: "Verbindung hergestellt.",
    toastVpnDisconnected: "Verbindung getrennt.",
    toastVpnErrorTitle: "VPN-Fehler",
    toastWolSentTitle: "Wake-on-LAN gesendet",
    toastWolSentBody: "Magic Packet an {name} gesendet.",
    toastWolFailedTitle: "Wake-on-LAN fehlgeschlagen",
    toastPcOnlineTitle: "{name} ist online!",
    toastPcOnlineBody: "Antwort von {ip}",
    modalTitleEdit: "PC bearbeiten: {name}",
    modalTitleNew: "Neuen PC (Wake-on-LAN) anlegen",
    errMacRequired:
      "Bitte gib die MAC-Adresse deines PCs ein (z.B. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Fehler beim Speichern des PC-Profils.",
    fieldPcNameLabel: "Name des PCs",
    fieldPcNameDesc: "Anzeigename im Quick Access Menü (z.B. Gaming PC)",
    fieldMacLabel: "MAC-Adresse (Pflichtfeld)",
    fieldMacDesc: "Format: AA:BB:CC:DD:EE:FF oder AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Lokale IP-Adresse des PCs",
    fieldIpDesc:
      "Wird für Live-Ping-Status, direktes VPN-Unicast-WoL und Subnet-Broadcast genutzt",
    fieldVpnLabel: "Zugehöriges VPN",
    fieldVpnDesc:
      "Wird bei 'VPN starten & wecken' automatisch vor dem Aufwecken verbunden",
    fieldVpnNone: "Kein festes VPN (aktuelles Netzwerk nutzen)",
    fieldWakeTriggerLabel: "Router Auto-Wake / ARP-Trigger",
    fieldWakeTriggerDesc:
      "Sendet zusätzlich Ping- & TCP-Pakete an die PC-IP (aktualisiert den Router-ARP-Cache und löst Router-Auto-Wake bei Zugriff aus)",
    fieldBroadcastLabel: "Abweichende Broadcast-IP (Optional)",
    fieldBroadcastDesc: "Leer lassen für automatische Berechnung aus der PC-IP",
    fieldPortLabel: "UDP-Port",
    fieldPortDesc: "Standard ist 9 (sendet zur Sicherheit auf Port 9, 7 und diesem Port)",
    fieldRouterPasswordLabel: "Router-Passwort für VPN-WoL (Optional, TR-064)",
    fieldRouterPasswordDesc:
      "Empfohlen für Mobilfunk-VPN: weist den Router direkt an, ein echtes Layer-2-WoL-Paket im Heimnetz zu senden (auch wenn der ARP-Cache leer ist)",
    fieldRouterUserLabel: "Router-Benutzername (Optional)",
    fieldRouterUserDesc: "Leer lassen für automatische Erkennung des Standard-Routerbenutzers",
    fieldRouterIpLabel: "Router-IP-Adresse (Optional)",
    fieldRouterIpDesc: "Leer lassen für automatische Gateway-Erkennung (z.B. 192.168.178.1)",
    btnShutdownPc: "⏻ Herunterfahren",
    btnShuttingDown: "Fahre herunter...",
    modalSectionSsh: "Remote-Herunterfahren via SSH (Optional)",
    fieldSshEnableLabel: "SSH-Herunterfahren aktivieren",
    fieldSshEnableDesc: "Zeigt einen Herunterfahren-Button im Menü, wenn dieser PC online ist",
    fieldSshUserLabel: "SSH-Benutzername",
    fieldSshUserDesc: "Benutzername auf dem PC (z.B. dein Windows-Benutzername)",
    fieldSshPasswordLabel: "SSH-Passwort (Optional)",
    fieldSshPasswordDesc: "Leer lassen, falls SSH-Key-Authentifizierung verwendet wird",
    fieldSshPortLabel: "SSH-Port",
    fieldSshPortDesc: "Standard ist 22",
    fieldSshOsLabel: "Betriebssystem des PCs",
    fieldSshOsDesc: "Windows sendet 'shutdown /s /t 0', Linux sendet 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Auto-Login nach WoL (Windows PIN)",
    fieldSshAutoLoginDesc:
      "Meldet deinen normalen Windows-Hauptbenutzer nach Wake-on-LAN automatisch per PIN am Sperrbildschirm an (der SSH-Nutzer führt nur den Befehl im Hintergrund aus)",
    fieldSshPinLabel: "Windows Hello PIN (Hauptbenutzer)",
    fieldSshPinDesc:
      "PIN deines normalen Windows-Benutzers für den Sperrbildschirm (nicht das SSH-Passwort)",
    errPinRequired: "Bitte gib deine Windows Hello PIN für den Auto-Login ein.",
    btnLoginPc: "🔓 Anmelden (PIN)",
    btnLoggingIn: "Melde an...",
    toastLoginSuccessTitle: "Windows-Login erfolgreich",
    toastLoginSuccessBody: "{name} wurde per Windows Hello PIN entsperrt.",
    toastLoginAlreadyTitle: "{name} bereits entsperrt",
    toastLoginAlreadyBody: "Der Windows-Benutzer ist bereits angemeldet.",
    toastLoginFailedTitle: "Windows-Login fehlgeschlagen",
    toastShutdownSentTitle: "Herunterfahren gesendet",
    toastShutdownSentBody: "Herunterfahren-Signal an {name} übermittelt.",
    toastShutdownFailedTitle: "Herunterfahren fehlgeschlagen",
    confirmShutdownTitle: "PC herunterfahren?",
    confirmShutdownBody: "Möchtest du '{name}' wirklich herunterfahren?",
    confirmShutdownButton: "Herunterfahren",
    btnDelete: "Löschen",
    btnCancel: "Abbrechen",
    btnSave: "Speichern",
    btnSaving: "Speichere...",
  },
  fr: {
    vpnSectionTitle: "Connexions VPN",
    noVpnsFound: "Aucun profil VPN trouvé dans NetworkManager (nmcli) ou /etc/wireguard.",
    statusSwitching: "Basculement...",
    statusConnected: "Connecté",
    statusDisconnected: "Déconnecté",
    refreshStatus: "Actualiser l'état",
    wolSectionTitle: "Wake-on-LAN (PC)",
    noTargetsConfigured:
      "Aucun profil PC configuré. Ajoutez votre PC pour le réveiller via VPN ou réseau local.",
    badgeOnline: "En ligne",
    badgeWaking: "Réveil...",
    badgeOffline: "Hors ligne",
    badgeReady: "Prêt",
    vpnAutoStartHint: "Démarrage automatique",
    btnSendingWol: "Envoi WoL...",
    btnStartVpnAndWake: "⚡ Démarrer VPN & Réveiller",
    btnWakePc: "⚡ Réveiller le PC (WoL)",
    btnAddPc: "+ Ajouter un PC",
    toastVpnConnected: "Connexion établie.",
    toastVpnDisconnected: "Connexion fermée.",
    toastVpnErrorTitle: "Erreur VPN",
    toastWolSentTitle: "Wake-on-LAN envoyé",
    toastWolSentBody: "Magic Packet envoyé à {name}.",
    toastWolFailedTitle: "Échec du Wake-on-LAN",
    toastPcOnlineTitle: "{name} est en ligne !",
    toastPcOnlineBody: "Réponse de {ip}",
    modalTitleEdit: "Modifier le PC : {name}",
    modalTitleNew: "Ajouter un PC (Wake-on-LAN)",
    errMacRequired: "Veuillez saisir l'adresse MAC du PC (ex. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Échec de l'enregistrement du profil.",
    fieldPcNameLabel: "Nom du PC",
    fieldPcNameDesc: "Nom affiché dans le menu rapide (ex. Gaming PC)",
    fieldMacLabel: "Adresse MAC (Requis)",
    fieldMacDesc: "Format : AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Adresse IP locale du PC",
    fieldIpDesc:
      "Utilisée pour le statut ping, l'unicast VPN et la diffusion de sous-réseau",
    fieldVpnLabel: "VPN associé",
    fieldVpnDesc: "Se connecte automatiquement avant d'envoyer le paquet Wake-on-LAN",
    fieldVpnNone: "Aucun VPN fixe (utiliser le réseau actuel)",
    fieldWakeTriggerLabel: "Déclencheur Auto-Wake Routeur / ARP",
    fieldWakeTriggerDesc:
      "Envoie des paquets ping et TCP supplémentaires pour rafraîchir le cache ARP ou déclencher le réveil du routeur",
    fieldBroadcastLabel: "IP de diffusion personnalisée (Optionnel)",
    fieldBroadcastDesc: "Laisser vide pour un calcul automatique depuis l'IP du PC",
    fieldPortLabel: "Port UDP",
    fieldPortDesc: "Par défaut 9 (envoie sur les ports 9, 7 et ce port)",
    fieldRouterPasswordLabel: "Mot de passe routeur pour WoL VPN (Optionnel, TR-064)",
    fieldRouterPasswordDesc:
      "Recommandé pour VPN mobile : demande au routeur d'envoyer un vrai paquet WoL Layer-2 sur le réseau local",
    fieldRouterUserLabel: "Utilisateur routeur (Optionnel)",
    fieldRouterUserDesc: "Laisser vide pour la détection automatique de l'utilisateur par défaut",
    fieldRouterIpLabel: "Adresse IP du routeur (Optionnel)",
    fieldRouterIpDesc: "Laisser vide pour la détection automatique de la passerelle",
    btnShutdownPc: "⏻ Éteindre",
    btnShuttingDown: "Arrêt en cours...",
    modalSectionSsh: "Arrêt à distance via SSH (Optionnel)",
    fieldSshEnableLabel: "Activer l'arrêt par SSH",
    fieldSshEnableDesc: "Affiche un bouton d'arrêt dans le menu lorsque ce PC est en ligne",
    fieldSshUserLabel: "Nom d'utilisateur SSH",
    fieldSshUserDesc: "Nom d'utilisateur sur le PC (ex. compte Windows)",
    fieldSshPasswordLabel: "Mot de passe SSH (Optionnel)",
    fieldSshPasswordDesc: "Laisser vide si vous utilisez une clé SSH",
    fieldSshPortLabel: "Port SSH",
    fieldSshPortDesc: "Par défaut 22",
    fieldSshOsLabel: "Système d'exploitation du PC",
    fieldSshOsDesc: "Windows envoie 'shutdown /s /t 0', Linux envoie 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Connexion auto après WoL (PIN Windows)",
    fieldSshAutoLoginDesc:
      "Connecte automatiquement la session Windows avec votre PIN après le réveil (idéal pour Steam Remote Play)",
    fieldSshPinLabel: "Code PIN Windows Hello",
    fieldSshPinDesc: "Envoyé via SSH pour déverrouiller l'écran de connexion Windows",
    errPinRequired: "Veuillez saisir votre code PIN Windows Hello.",
    btnLoginPc: "🔓 Connexion (PIN)",
    btnLoggingIn: "Connexion...",
    toastLoginSuccessTitle: "Connexion Windows réussie",
    toastLoginSuccessBody: "{name} déverrouillé avec le code PIN.",
    toastLoginAlreadyTitle: "{name} déjà déverrouillé",
    toastLoginAlreadyBody: "La session Windows est déjà ouverte.",
    toastLoginFailedTitle: "Échec de connexion Windows",
    toastShutdownSentTitle: "Commande d'arrêt envoyée",
    toastShutdownSentBody: "Signal d'arrêt envoyé à {name}.",
    toastShutdownFailedTitle: "Échec de l'arrêt",
    confirmShutdownTitle: "Éteindre le PC ?",
    confirmShutdownBody: "Voulez-vous vraiment éteindre '{name}' ?",
    confirmShutdownButton: "Éteindre",
    btnDelete: "Supprimer",
    btnCancel: "Annuler",
    btnSave: "Enregistrer",
    btnSaving: "Enregistrement...",
  },
  es: {
    vpnSectionTitle: "Conexiones VPN",
    noVpnsFound:
      "No se encontraron perfiles VPN en NetworkManager (nmcli) ni en /etc/wireguard.",
    statusSwitching: "Cambiando...",
    statusConnected: "Conectado",
    statusDisconnected: "Desconectado",
    refreshStatus: "Actualizar estado",
    wolSectionTitle: "Wake-on-LAN (PCs)",
    noTargetsConfigured:
      "Aún no hay ningún perfil de PC configurado. Añade tu PC para encenderlo por VPN o red local.",
    badgeOnline: "En línea",
    badgeWaking: "Encendiendo...",
    badgeOffline: "Desconectado",
    badgeReady: "Listo",
    vpnAutoStartHint: "Se iniciará automáticamente",
    btnSendingWol: "Enviando WoL...",
    btnStartVpnAndWake: "⚡ Iniciar VPN y encender",
    btnWakePc: "⚡ Encender PC (WoL)",
    btnAddPc: "+ Añadir nuevo PC",
    toastVpnConnected: "Conexión establecida.",
    toastVpnDisconnected: "Conexión cerrada.",
    toastVpnErrorTitle: "Error de VPN",
    toastWolSentTitle: "Wake-on-LAN enviado",
    toastWolSentBody: "Magic Packet enviado a {name}.",
    toastWolFailedTitle: "Error de Wake-on-LAN",
    toastPcOnlineTitle: "¡{name} está en línea!",
    toastPcOnlineBody: "Respuesta desde {ip}",
    modalTitleEdit: "Editar PC: {name}",
    modalTitleNew: "Añadir nuevo PC (Wake-on-LAN)",
    errMacRequired: "Introduce la dirección MAC de tu PC (ej. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Error al guardar el perfil del PC.",
    fieldPcNameLabel: "Nombre del PC",
    fieldPcNameDesc: "Nombre visible en el menú rápido (ej. Gaming PC)",
    fieldMacLabel: "Dirección MAC (Obligatorio)",
    fieldMacDesc: "Formato: AA:BB:CC:DD:EE:FF o AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Dirección IP local del PC",
    fieldIpDesc:
      "Se usa para el estado ping en vivo, WoL unicast por VPN y broadcast de subred",
    fieldVpnLabel: "VPN vinculada",
    fieldVpnDesc: "Se conecta automáticamente antes de despertar el PC",
    fieldVpnNone: "Sin VPN fija (usar red actual)",
    fieldWakeTriggerLabel: "Activador Auto-Wake de Router / ARP",
    fieldWakeTriggerDesc:
      "Envía paquetes ping y TCP adicionales a la IP del PC para actualizar la caché ARP o activar el encendido automático del router",
    fieldBroadcastLabel: "IP de Broadcast personalizada (Opcional)",
    fieldBroadcastDesc: "Dejar vacío para cálculo automático a partir de la IP del PC",
    fieldPortLabel: "Puerto UDP",
    fieldPortDesc: "Por defecto 9 (envía en los puertos 9, 7 y este puerto)",
    fieldRouterPasswordLabel: "Contraseña del Router para WoL por VPN (Opcional, TR-064)",
    fieldRouterPasswordDesc:
      "Recomendado para VPN móvil: indica al router que envíe un paquete WoL Layer-2 directo en la red local",
    fieldRouterUserLabel: "Usuario del Router (Opcional)",
    fieldRouterUserDesc: "Dejar vacío para detección automática del usuario predeterminado",
    fieldRouterIpLabel: "Dirección IP del Router (Opcional)",
    fieldRouterIpDesc: "Dejar vacío para detección automática de puerta de enlace",
    btnShutdownPc: "⏻ Apagar",
    btnShuttingDown: "Apagando...",
    modalSectionSsh: "Apagado remoto por SSH (Opcional)",
    fieldSshEnableLabel: "Activar apagado por SSH",
    fieldSshEnableDesc: "Muestra un botón de apagado en el menú cuando este PC está en línea",
    fieldSshUserLabel: "Usuario SSH",
    fieldSshUserDesc: "Nombre de usuario en el PC (ej. cuenta de Windows)",
    fieldSshPasswordLabel: "Contraseña SSH (Opcional)",
    fieldSshPasswordDesc: "Dejar vacío si usas autenticación por clave SSH",
    fieldSshPortLabel: "Puerto SSH",
    fieldSshPortDesc: "Por defecto 22",
    fieldSshOsLabel: "Sistema operativo del PC",
    fieldSshOsDesc: "Windows envía 'shutdown /s /t 0', Linux envía 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Inicio de sesión automático tras WoL (PIN Windows)",
    fieldSshAutoLoginDesc:
      "Inicia sesión automáticamente en Windows con tu PIN tras encender por WoL (ideal para Steam Remote Play)",
    fieldSshPinLabel: "PIN de Windows Hello",
    fieldSshPinDesc: "Se envía por SSH para desbloquear la pantalla de inicio de sesión",
    errPinRequired: "Introduce tu PIN de Windows Hello para el inicio automático.",
    btnLoginPc: "🔓 Iniciar sesión (PIN)",
    btnLoggingIn: "Iniciando sesión...",
    toastLoginSuccessTitle: "Sesión iniciada en Windows",
    toastLoginSuccessBody: "{name} desbloqueado mediante PIN.",
    toastLoginAlreadyTitle: "{name} desbloqueado",
    toastLoginAlreadyBody: "La sesión de Windows ya está activa.",
    toastLoginFailedTitle: "Error de inicio de sesión",
    toastShutdownSentTitle: "Comando de apagado enviado",
    toastShutdownSentBody: "Señal de apagado enviada a {name}.",
    toastShutdownFailedTitle: "Fallo al apagar",
    confirmShutdownTitle: "¿Apagar PC?",
    confirmShutdownBody: "¿Seguro que quieres apagar '{name}'?",
    confirmShutdownButton: "Apagar",
    btnDelete: "Eliminar",
    btnCancel: "Cancelar",
    btnSave: "Guardar",
    btnSaving: "Guardando...",
  },
  it: {
    vpnSectionTitle: "Connessioni VPN",
    noVpnsFound:
      "Nessun profilo VPN trovato in NetworkManager (nmcli) o /etc/wireguard.",
    statusSwitching: "Cambio in corso...",
    statusConnected: "Connesso",
    statusDisconnected: "Disconnesso",
    refreshStatus: "Aggiorna stato",
    wolSectionTitle: "Wake-on-LAN (PC)",
    noTargetsConfigured:
      "Nessun profilo PC configurato. Aggiungi il tuo PC per avviarlo tramite VPN o rete locale.",
    badgeOnline: "Online",
    badgeWaking: "Avvio...",
    badgeOffline: "Offline",
    badgeReady: "Pronto",
    vpnAutoStartHint: "Avvio automatico",
    btnSendingWol: "Invio WoL...",
    btnStartVpnAndWake: "⚡ Avvia VPN e sveglia",
    btnWakePc: "⚡ Sveglia PC (WoL)",
    btnAddPc: "+ Aggiungi nuovo PC",
    toastVpnConnected: "Connessione stabilita.",
    toastVpnDisconnected: "Connessione chiusa.",
    toastVpnErrorTitle: "Errore VPN",
    toastWolSentTitle: "Wake-on-LAN inviato",
    toastWolSentBody: "Magic Packet inviato a {name}.",
    toastWolFailedTitle: "Wake-on-LAN fallito",
    toastPcOnlineTitle: "{name} è online!",
    toastPcOnlineBody: "Risposta da {ip}",
    modalTitleEdit: "Modifica PC: {name}",
    modalTitleNew: "Aggiungi nuovo PC (Wake-on-LAN)",
    errMacRequired: "Inserisci l'indirizzo MAC del PC (es. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Impossibile salvare il profilo PC.",
    fieldPcNameLabel: "Nome del PC",
    fieldPcNameDesc: "Nome visualizzato nel menu rapido (es. Gaming PC)",
    fieldMacLabel: "Indirizzo MAC (Obbligatorio)",
    fieldMacDesc: "Formato: AA:BB:CC:DD:EE:FF o AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Indirizzo IP locale del PC",
    fieldIpDesc: "Usato per lo stato ping, WoL unicast su VPN e broadcast di sottorete",
    fieldVpnLabel: "VPN associata",
    fieldVpnDesc: "Si connette automaticamente prima di inviare il pacchetto WoL",
    fieldVpnNone: "Nessuna VPN fissa (usa rete attuale)",
    fieldWakeTriggerLabel: "Trigger Auto-Wake Router / ARP",
    fieldWakeTriggerDesc:
      "Invia pacchetti ping e TCP aggiuntivi per aggiornare la cache ARP del router o attivare l'avvio su accesso",
    fieldBroadcastLabel: "IP Broadcast personalizzato (Opzionale)",
    fieldBroadcastDesc: "Lascia vuoto per il calcolo automatico dall'IP del PC",
    fieldPortLabel: "Porta UDP",
    fieldPortDesc: "Predefinita 9 (invia sulle porte 9, 7 e questa porta)",
    fieldRouterPasswordLabel: "Password Router per WoL VPN (Opzionale, TR-064)",
    fieldRouterPasswordDesc:
      "Consigliato per VPN mobile: fa inviare al router un vero pacchetto WoL Layer-2 nella rete locale",
    fieldRouterUserLabel: "Utente Router (Opzionale)",
    fieldRouterUserDesc: "Lascia vuoto per il rilevamento automatico dell'utente predefinito",
    fieldRouterIpLabel: "Indirizzo IP Router (Opzionale)",
    fieldRouterIpDesc: "Lascia vuoto per il rilevamento automatico del gateway",
    btnShutdownPc: "⏻ Spegni",
    btnShuttingDown: "Spegnimento...",
    modalSectionSsh: "Spegnimento remoto via SSH (Opzionale)",
    fieldSshEnableLabel: "Abilita spegnimento SSH",
    fieldSshEnableDesc: "Mostra un pulsante di spegnimento nel menu quando questo PC è online",
    fieldSshUserLabel: "Nome utente SSH",
    fieldSshUserDesc: "Nome utente sul PC (es. account Windows)",
    fieldSshPasswordLabel: "Password SSH (Opzionale)",
    fieldSshPasswordDesc: "Lascia vuoto se usi l'autenticazione con chiave SSH",
    fieldSshPortLabel: "Porta SSH",
    fieldSshPortDesc: "Predefinita 22",
    fieldSshOsLabel: "Sistema operativo del PC",
    fieldSshOsDesc: "Windows invia 'shutdown /s /t 0', Linux invia 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Accesso automatico dopo WoL (PIN Windows)",
    fieldSshAutoLoginDesc:
      "Accede automaticamente a Windows con il PIN dopo il risveglio WoL (ideale per Steam Remote Play)",
    fieldSshPinLabel: "PIN Windows Hello",
    fieldSshPinDesc: "Inviato via SSH per sbloccare la schermata di accesso di Windows",
    errPinRequired: "Inserisci il PIN Windows Hello per l'accesso automatico.",
    btnLoginPc: "🔓 Accedi (PIN)",
    btnLoggingIn: "Accesso...",
    toastLoginSuccessTitle: "Accesso Windows riuscito",
    toastLoginSuccessBody: "{name} sbloccato tramite PIN.",
    toastLoginAlreadyTitle: "{name} già sbloccato",
    toastLoginAlreadyBody: "La sessione Windows è già attiva.",
    toastLoginFailedTitle: "Accesso Windows fallito",
    toastShutdownSentTitle: "Comando di spegnimento inviato",
    toastShutdownSentBody: "Segnale di spegnimento inviato a {name}.",
    toastShutdownFailedTitle: "Spegnimento non riuscito",
    confirmShutdownTitle: "Spegnere il PC?",
    confirmShutdownBody: "Sei sicuro di voler spegnere '{name}'?",
    confirmShutdownButton: "Spegni",
    btnDelete: "Elimina",
    btnCancel: "Annulla",
    btnSave: "Salva",
    btnSaving: "Salvataggio...",
  },
  pt: {
    vpnSectionTitle: "Conexões VPN",
    noVpnsFound:
      "Nenhum perfil VPN encontrado no NetworkManager (nmcli) ou /etc/wireguard.",
    statusSwitching: "Alternando...",
    statusConnected: "Conectado",
    statusDisconnected: "Desconectado",
    refreshStatus: "Atualizar status",
    wolSectionTitle: "Wake-on-LAN (PCs)",
    noTargetsConfigured:
      "Nenhum perfil de PC configurado. Adicione seu PC para ligá-lo via VPN ou rede local.",
    badgeOnline: "Online",
    badgeWaking: "Iniciando...",
    badgeOffline: "Offline",
    badgeReady: "Pronto",
    vpnAutoStartHint: "Inicia automaticamente",
    btnSendingWol: "Enviando WoL...",
    btnStartVpnAndWake: "⚡ Iniciar VPN e ligar",
    btnWakePc: "⚡ Ligar PC (WoL)",
    btnAddPc: "+ Adicionar novo PC",
    toastVpnConnected: "Conexão estabelecida.",
    toastVpnDisconnected: "Conexão encerrada.",
    toastVpnErrorTitle: "Erro de VPN",
    toastWolSentTitle: "Wake-on-LAN enviado",
    toastWolSentBody: "Magic Packet enviado para {name}.",
    toastWolFailedTitle: "Falha no Wake-on-LAN",
    toastPcOnlineTitle: "{name} está online!",
    toastPcOnlineBody: "Resposta de {ip}",
    modalTitleEdit: "Editar PC: {name}",
    modalTitleNew: "Adicionar novo PC (Wake-on-LAN)",
    errMacRequired: "Insira o endereço MAC do seu PC (ex. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Falha ao salvar o perfil do PC.",
    fieldPcNameLabel: "Nome do PC",
    fieldPcNameDesc: "Nome exibido no menu rápido (ex. Gaming PC)",
    fieldMacLabel: "Endereço MAC (Obrigatório)",
    fieldMacDesc: "Formato: AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Endereço IP local do PC",
    fieldIpDesc: "Usado para status de ping, WoL unicast via VPN e broadcast de sub-rede",
    fieldVpnLabel: "VPN vinculada",
    fieldVpnDesc: "Conecta automaticamente antes de acordar o PC",
    fieldVpnNone: "Nenhuma VPN fixa (usar rede atual)",
    fieldWakeTriggerLabel: "Gatilho Auto-Wake do Roteador / ARP",
    fieldWakeTriggerDesc:
      "Envia pacotes ping e TCP adicionais para atualizar o cache ARP do roteador ou acionar o despertar automático",
    fieldBroadcastLabel: "IP de Broadcast personalizado (Opcional)",
    fieldBroadcastDesc: "Deixe em branco para cálculo automático a partir do IP do PC",
    fieldPortLabel: "Porta UDP",
    fieldPortDesc: "Padrão é 9 (envia nas portas 9, 7 e nesta porta)",
    fieldRouterPasswordLabel: "Senha do Roteador para WoL via VPN (Opcional, TR-064)",
    fieldRouterPasswordDesc:
      "Recomendado para VPN móvel: instrui o roteador a enviar um pacote WoL Layer-2 real na rede local",
    fieldRouterUserLabel: "Usuário do Roteador (Opcional)",
    fieldRouterUserDesc: "Deixe em branco para detecção automática do usuário padrão",
    fieldRouterIpLabel: "Endereço IP do Roteador (Opcional)",
    fieldRouterIpDesc: "Deixe em branco para detecção automática do gateway",
    btnShutdownPc: "⏻ Desligar",
    btnShuttingDown: "Desligando...",
    modalSectionSsh: "Desligamento remoto via SSH (Opcional)",
    fieldSshEnableLabel: "Ativar desligamento via SSH",
    fieldSshEnableDesc: "Mostra um botão de desligar no menu quando o PC estiver online",
    fieldSshUserLabel: "Usuário SSH",
    fieldSshUserDesc: "Nome de usuário no PC (ex: conta do Windows)",
    fieldSshPasswordLabel: "Senha SSH (Opcional)",
    fieldSshPasswordDesc: "Deixe em branco se usar autenticação por chave SSH",
    fieldSshPortLabel: "Porta SSH",
    fieldSshPortDesc: "Padrão é 22",
    fieldSshOsLabel: "Sistema operacional do PC",
    fieldSshOsDesc: "Windows envia 'shutdown /s /t 0', Linux envia 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Login automático após WoL (PIN do Windows)",
    fieldSshAutoLoginDesc:
      "Faz login automaticamente no Windows usando seu PIN após Wake-on-LAN (ideal para Steam Remote Play)",
    fieldSshPinLabel: "PIN do Windows Hello",
    fieldSshPinDesc: "Enviado via SSH para desbloquear a tela de login do Windows",
    errPinRequired: "Insira seu PIN do Windows Hello para o login automático.",
    btnLoginPc: "🔓 Entrar (PIN)",
    btnLoggingIn: "Entrando...",
    toastLoginSuccessTitle: "Login no Windows concluído",
    toastLoginSuccessBody: "{name} desbloqueado via PIN.",
    toastLoginAlreadyTitle: "{name} desbloqueado",
    toastLoginAlreadyBody: "A sessão do Windows já está ativa.",
    toastLoginFailedTitle: "Falha no login do Windows",
    toastShutdownSentTitle: "Comando de desligamento enviado",
    toastShutdownSentBody: "Sinal de desligamento enviado para {name}.",
    toastShutdownFailedTitle: "Falha ao desligar",
    confirmShutdownTitle: "Desligar o PC?",
    confirmShutdownBody: "Tem certeza de que deseja desligar '{name}'?",
    confirmShutdownButton: "Desligar",
    btnDelete: "Excluir",
    btnCancel: "Cancelar",
    btnSave: "Salvar",
    btnSaving: "Salvando...",
  },
  pl: {
    vpnSectionTitle: "Połączenia VPN",
    noVpnsFound:
      "Nie znaleziono profili VPN w NetworkManager (nmcli) ani /etc/wireguard.",
    statusSwitching: "Przełączanie...",
    statusConnected: "Połączono",
    statusDisconnected: "Rozłączono",
    refreshStatus: "Odśwież status",
    wolSectionTitle: "Wake-on-LAN (Komputery)",
    noTargetsConfigured:
      "Brak skonfigurowanego profilu PC. Dodaj komputer, aby wybudzać go przez VPN lub sieć lokalną.",
    badgeOnline: "Online",
    badgeWaking: "Wybudzanie...",
    badgeOffline: "Offline",
    badgeReady: "Gotowy",
    vpnAutoStartHint: "Uruchamiany automatycznie",
    btnSendingWol: "Wysyłanie WoL...",
    btnStartVpnAndWake: "⚡ Włącz VPN i wybudź",
    btnWakePc: "⚡ Wybudź PC (WoL)",
    btnAddPc: "+ Dodaj nowy komputer",
    toastVpnConnected: "Połączenie nawiązane.",
    toastVpnDisconnected: "Połączenie zakończone.",
    toastVpnErrorTitle: "Błąd VPN",
    toastWolSentTitle: "Wysłano Wake-on-LAN",
    toastWolSentBody: "Wysłano Magic Packet do {name}.",
    toastWolFailedTitle: "Błąd Wake-on-LAN",
    toastPcOnlineTitle: "{name} jest online!",
    toastPcOnlineBody: "Odpowiedź z {ip}",
    modalTitleEdit: "Edytuj PC: {name}",
    modalTitleNew: "Dodaj nowy PC (Wake-on-LAN)",
    errMacRequired: "Podaj adres MAC komputera (np. AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Nie udało się zapisać profilu PC.",
    fieldPcNameLabel: "Nazwa komputera",
    fieldPcNameDesc: "Nazwa wyświetlana w menu szybkiego dostępu (np. Gaming PC)",
    fieldMacLabel: "Adres MAC (Wymagany)",
    fieldMacDesc: "Format: AA:BB:CC:DD:EE:FF lub AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Lokalny adres IP komputera",
    fieldIpDesc: "Używany do statusu ping, unicast WoL przez VPN oraz broadcastu podsieci",
    fieldVpnLabel: "Powiązany VPN",
    fieldVpnDesc: "Łączy się automatycznie przed wysłaniem pakietu wybudzającego",
    fieldVpnNone: "Brak stałego VPN (użyj obecnej sieci)",
    fieldWakeTriggerLabel: "Wyzwalacz Auto-Wake Routera / ARP",
    fieldWakeTriggerDesc:
      "Wysyła dodatkowe pakiety ping i TCP, aby odświeżyć tablicę ARP routera lub wywołać automatyczne wybudzanie",
    fieldBroadcastLabel: "Własny adres Broadcast IP (Opcjonalnie)",
    fieldBroadcastDesc: "Pozostaw puste dla automatycznego obliczenia z adresu IP",
    fieldPortLabel: "Port UDP",
    fieldPortDesc: "Domyślnie 9 (wysyła na porty 9, 7 oraz ten port)",
    fieldRouterPasswordLabel: "Hasło routera dla WoL przez VPN (Opcjonalnie, TR-064)",
    fieldRouterPasswordDesc:
      "Zalecane dla mobilnego VPN: zleca routerowi wysłanie pakietu WoL Layer-2 bezpośrednio w sieci domowej",
    fieldRouterUserLabel: "Użytkownik routera (Opcjonalnie)",
    fieldRouterUserDesc: "Pozostaw puste dla automatycznego wykrycia domyślnego użytkownika",
    fieldRouterIpLabel: "Adres IP routera (Opcjonalnie)",
    fieldRouterIpDesc: "Pozostaw puste dla automatycznego wykrycia bramy",
    btnShutdownPc: "⏻ Wyłącz",
    btnShuttingDown: "Wyłączanie...",
    modalSectionSsh: "Zdalne wyłączanie przez SSH (Opcjonalnie)",
    fieldSshEnableLabel: "Włącz wyłączanie przez SSH",
    fieldSshEnableDesc: "Pokazuje przycisk wyłączania w menu, gdy ten komputer jest online",
    fieldSshUserLabel: "Użytkownik SSH",
    fieldSshUserDesc: "Nazwa użytkownika na komputerze (np. konto Windows)",
    fieldSshPasswordLabel: "Hasło SSH (Opcjonalnie)",
    fieldSshPasswordDesc: "Pozostaw puste, jeśli używasz uwierzytelniania kluczem SSH",
    fieldSshPortLabel: "Port SSH",
    fieldSshPortDesc: "Domyślnie 22",
    fieldSshOsLabel: "System operacyjny komputera",
    fieldSshOsDesc: "Windows wysyła 'shutdown /s /t 0', Linux wysyła 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Auto-logowanie po WoL (PIN Windows)",
    fieldSshAutoLoginDesc:
      "Automatycznie loguje użytkownika Windows kodem PIN po wybudzeniu (idealne dla Steam Remote Play)",
    fieldSshPinLabel: "Kod PIN Windows Hello",
    fieldSshPinDesc: "Wysyłany przez SSH w celu odblokowania ekranu logowania Windows",
    errPinRequired: "Podaj kod PIN Windows Hello dla automatycznego logowania.",
    btnLoginPc: "🔓 Zaloguj (PIN)",
    btnLoggingIn: "Logowanie...",
    toastLoginSuccessTitle: "Zalogowano do Windows",
    toastLoginSuccessBody: "Odblokowano {name} za pomocą kodu PIN.",
    toastLoginAlreadyTitle: "{name} odblokowany",
    toastLoginAlreadyBody: "Sesja Windows jest już zalogowana.",
    toastLoginFailedTitle: "Błąd logowania Windows",
    toastShutdownSentTitle: "Wysłano polecenie wyłączenia",
    toastShutdownSentBody: "Sygnał wyłączenia wysłany do {name}.",
    toastShutdownFailedTitle: "Błąd wyłączania",
    confirmShutdownTitle: "Wyłączyć komputer?",
    confirmShutdownBody: "Czy na pewno chcesz wyłączyć '{name}'?",
    confirmShutdownButton: "Wyłącz",
    btnDelete: "Usuń",
    btnCancel: "Anuluj",
    btnSave: "Zapisz",
    btnSaving: "Zapisywanie...",
  },
  ru: {
    vpnSectionTitle: "VPN-подключения",
    noVpnsFound:
      "Профили VPN не найдены в NetworkManager (nmcli) или /etc/wireguard.",
    statusSwitching: "Переключение...",
    statusConnected: "Подключено",
    statusDisconnected: "Отключено",
    refreshStatus: "Обновить статус",
    wolSectionTitle: "Wake-on-LAN (ПК)",
    noTargetsConfigured:
      "Профиль ПК ещё не настроен. Добавьте свой ПК для пробуждения через VPN или локальную сеть.",
    badgeOnline: "В сети",
    badgeWaking: "Запуск...",
    badgeOffline: "Не в сети",
    badgeReady: "Готов",
    vpnAutoStartHint: "Запускается автоматически",
    btnSendingWol: "Отправка WoL...",
    btnStartVpnAndWake: "⚡ Включить VPN и разбудить",
    btnWakePc: "⚡ Разбудить ПК (WoL)",
    btnAddPc: "+ Добавить новый ПК",
    toastVpnConnected: "Соединение установлено.",
    toastVpnDisconnected: "Соединение разорвано.",
    toastVpnErrorTitle: "Ошибка VPN",
    toastWolSentTitle: "Wake-on-LAN отправлен",
    toastWolSentBody: "Magic Packet отправлен на {name}.",
    toastWolFailedTitle: "Ошибка Wake-on-LAN",
    toastPcOnlineTitle: "{name} в сети!",
    toastPcOnlineBody: "Ответ от {ip}",
    modalTitleEdit: "Изменить ПК: {name}",
    modalTitleNew: "Добавить ПК (Wake-on-LAN)",
    errMacRequired: "Введите MAC-адрес компьютера (например, AA:BB:CC:DD:EE:FF).",
    errSaveFailed: "Не удалось сохранить профиль ПК.",
    fieldPcNameLabel: "Имя ПК",
    fieldPcNameDesc: "Отображаемое имя в меню быстрого доступа (например, Gaming PC)",
    fieldMacLabel: "MAC-адрес (Обязательно)",
    fieldMacDesc: "Формат: AA:BB:CC:DD:EE:FF или AA-BB-CC-DD-EE-FF",
    fieldIpLabel: "Локальный IP-адрес ПК",
    fieldIpDesc: "Используется для проверки пинга, unicast WoL через VPN и широковещания",
    fieldVpnLabel: "Связанный VPN",
    fieldVpnDesc: "Автоматически подключается перед отправкой сигнала пробуждения",
    fieldVpnNone: "Без фиксированного VPN (текущая сеть)",
    fieldWakeTriggerLabel: "Триггер Auto-Wake роутера / ARP",
    fieldWakeTriggerDesc:
      "Отправляет дополнительные ping и TCP-пакеты для обновления ARP-кэша роутера или автопробуждения при обращении",
    fieldBroadcastLabel: "Пользовательский Broadcast IP (Необязательно)",
    fieldBroadcastDesc: "Оставьте пустым для автоматического расчёта из IP-адреса ПК",
    fieldPortLabel: "Порт UDP",
    fieldPortDesc: "По умолчанию 9 (отправляет на порты 9, 7 и указанный порт)",
    fieldRouterPasswordLabel: "Пароль роутера для VPN WoL (Необязательно, TR-064)",
    fieldRouterPasswordDesc:
      "Рекомендуется для мобильного VPN: роутер сам отправит Layer-2 WoL-пакет внутри домашней сети",
    fieldRouterUserLabel: "Пользователь роутера (Необязательно)",
    fieldRouterUserDesc: "Оставьте пустым для автоопределения пользователя по умолчанию",
    fieldRouterIpLabel: "IP-адрес роутера (Необязательно)",
    fieldRouterIpDesc: "Оставьте пустым для автоопределения шлюза",
    btnShutdownPc: "⏻ Выключить",
    btnShuttingDown: "Выключение...",
    modalSectionSsh: "Удалённое выключение через SSH (Необязательно)",
    fieldSshEnableLabel: "Включить выключение через SSH",
    fieldSshEnableDesc: "Показывает кнопку выключения в меню, когда этот ПК в сети",
    fieldSshUserLabel: "Имя пользователя SSH",
    fieldSshUserDesc: "Имя пользователя на ПК (например, учётная запись Windows)",
    fieldSshPasswordLabel: "Пароль SSH (Необязательно)",
    fieldSshPasswordDesc: "Оставьте пустым при использовании SSH-ключа",
    fieldSshPortLabel: "Порт SSH",
    fieldSshPortDesc: "По умолчанию 22",
    fieldSshOsLabel: "Операционная система ПК",
    fieldSshOsDesc: "Windows отправляет 'shutdown /s /t 0', Linux отправляет 'systemctl poweroff'",
    fieldSshAutoLoginLabel: "Автовход после WoL (PIN-код Windows)",
    fieldSshAutoLoginDesc:
      "Автоматически входит в Windows с помощью PIN-кода после пробуждения (идеально для Steam Remote Play)",
    fieldSshPinLabel: "PIN-код Windows Hello",
    fieldSshPinDesc: "Отправляется по SSH для разблокировки экрана входа Windows",
    errPinRequired: "Введите PIN-код Windows Hello для автоматического входа.",
    btnLoginPc: "🔓 Войти (PIN)",
    btnLoggingIn: "Вход...",
    toastLoginSuccessTitle: "Вход в Windows выполнен",
    toastLoginSuccessBody: "{name} разблокирован с помощью PIN-кода.",
    toastLoginAlreadyTitle: "{name} уже разблокирован",
    toastLoginAlreadyBody: "Сеанс Windows уже активен.",
    toastLoginFailedTitle: "Ошибка входа в Windows",
    toastShutdownSentTitle: "Команда выключения отправлена",
    toastShutdownSentBody: "Сигнал выключения отправлен на {name}.",
    toastShutdownFailedTitle: "Ошибка выключения",
    confirmShutdownTitle: "Выключить ПК?",
    confirmShutdownBody: "Вы уверены, что хотите выключить '{name}'?",
    confirmShutdownButton: "Выключить",
    btnDelete: "Удалить",
    btnCancel: "Отмена",
    btnSave: "Сохранить",
    btnSaving: "Сохранение...",
  },
};

const steamLangMap = {
  english: "en",
  german: "de",
  french: "fr",
  spanish: "es",
  latam: "es",
  italian: "it",
  portuguese: "pt",
  brazilian: "pt",
  polish: "pl",
  russian: "ru",
};

function detectLocale() {
  try {
    const steamLocales = window?.LocalizationManager?.m_rgLocalesToUse;
    if (Array.isArray(steamLocales) && steamLocales.length > 0) {
      const first = String(steamLocales[0]).toLowerCase();
      if (steamLangMap[first]) {
        return steamLangMap[first];
      }
      const prefix = first.slice(0, 2);
      if (prefix in translations) {
        return prefix;
      }
    }
  } catch {
    // ignore
  }

  try {
    const navLangs =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || "en"];
    for (const raw of navLangs) {
      const code = String(raw || "")
        .toLowerCase()
        .split(/[-_]/)[0];
      if (code in translations) {
        return code;
      }
    }
  } catch {
    // ignore
  }

  return "en";
}

function getTranslations() {
  return translations[detectLocale()] || translations.en;
}

function formatString(template, params) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

// Backend API Callables
const getInitialState = callable("get_initial_state");
const setVpnState = callable("set_vpn_state");
const saveWolTarget = callable("save_wol_target");
const deleteWolTarget = callable("delete_wol_target");
const pingTarget = callable("ping_target");
const sendWol = callable("send_wol");
const shutdownTarget = callable("shutdown_target");
const loginTarget = callable("login_target");

const PLUGIN_BUTTON_STYLES = `
  .vpn-wol-btn {
    min-width: 0 !important;
    box-sizing: border-box !important;
    transition: background-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease !important;
  }
  .vpn-wol-btn-primary {
    background-color: rgba(26, 159, 255, 0.26) !important;
    color: #70c4ff !important;
    border: 1px solid rgba(26, 159, 255, 0.55) !important;
  }
  .vpn-wol-btn-success {
    background-color: rgba(46, 204, 113, 0.22) !important;
    color: #7bed9f !important;
    border: 1px solid rgba(46, 204, 113, 0.5) !important;
  }
  .vpn-wol-btn-danger {
    background-color: rgba(220, 53, 69, 0.25) !important;
    color: #ff9ea5 !important;
    border: 1px solid rgba(220, 53, 69, 0.55) !important;
  }
  .vpn-wol-btn.gpfocus,
  .vpn-wol-btn:focus,
  .vpn-wol-btn:hover {
    background-color: #ffffff !important;
    color: #0e141b !important;
    border-color: #ffffff !important;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5) !important;
  }
  .vpn-wol-btn-primary.gpfocus,
  .vpn-wol-btn-primary:focus {
    box-shadow: 0 0 0 2px #1a9fff, 0 0 10px rgba(26, 159, 255, 0.5) !important;
  }
  .vpn-wol-btn-success.gpfocus,
  .vpn-wol-btn-success:focus {
    box-shadow: 0 0 0 2px #2ecc71, 0 0 10px rgba(46, 204, 113, 0.5) !important;
  }
  .vpn-wol-btn-danger.gpfocus,
  .vpn-wol-btn-danger:focus {
    box-shadow: 0 0 0 2px #ff4d4f, 0 0 10px rgba(220, 53, 69, 0.55) !important;
  }
  .vpn-wol-password-field input,
  .vpn-wol-password-field input[type="text"],
  .vpn-wol-password-field input[type="password"] {
    -webkit-text-security: disc !important;
    text-security: disc !important;
  }
`;

const ConfirmShutdownModal = ({ closeModal, targetName, onConfirm }) => {
  const t = SP_REACT.useMemo(() => getTranslations(), []);
  return SP_JSX.jsx(DFL.ModalRoot, {
    onCancel: closeModal,
    closeModal: closeModal,
    children: SP_JSX.jsxs("div", {
      style: { display: "flex", flexDirection: "column", gap: "12px", padding: "8px 4px" },
      children: [
        SP_JSX.jsx("style", { children: PLUGIN_BUTTON_STYLES }),
        SP_JSX.jsx("h2", {
          style: { margin: "0", fontSize: "18px", color: "#ffffff" },
          children: t.confirmShutdownTitle,
        }),
        SP_JSX.jsx("div", {
          style: { fontSize: "13px", color: "#b0b8c0", lineHeight: 1.5 },
          children: formatString(t.confirmShutdownBody, { name: targetName }),
        }),
        SP_JSX.jsxs(DFL.Focusable, {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "8px",
          },
          children: [
            SP_JSX.jsx(DFL.DialogButton, {
              className: "vpn-wol-btn",
              style: { flex: "1" },
              onClick: () => closeModal?.(),
              children: t.btnCancel,
            }),
            SP_JSX.jsx(DFL.DialogButton, {
              className: "vpn-wol-btn vpn-wol-btn-danger",
              style: {
                fontWeight: 600,
                flex: "1.2",
              },
              onClick: () => {
                closeModal?.();
                onConfirm();
              },
              children: t.confirmShutdownButton,
            }),
          ],
        }),
      ],
    }),
  });
};

// Target Configuration Modal
const TargetModal = ({ closeModal, existingTarget, vpns, onSave, onDelete }) => {
  const t = SP_REACT.useMemo(() => getTranslations(), []);

  const [name, setName] = SP_REACT.useState(existingTarget?.name ?? "Gaming PC");
  const [mac, setMac] = SP_REACT.useState(existingTarget?.mac ?? "");
  const [ip, setIp] = SP_REACT.useState(existingTarget?.ip ?? "");
  const [broadcastIp, setBroadcastIp] = SP_REACT.useState(
    existingTarget?.broadcast_ip ?? ""
  );
  const [port, setPort] = SP_REACT.useState(String(existingTarget?.port ?? 9));
  const [vpnId, setVpnId] = SP_REACT.useState(existingTarget?.vpn_id ?? "");
  const [wakeTrigger, setWakeTrigger] = SP_REACT.useState(
    existingTarget?.wake_trigger ?? existingTarget?.fritzbox_trigger ?? true
  );
  const [routerPassword, setRouterPassword] = SP_REACT.useState(
    existingTarget?.router_password ?? ""
  );
  const [routerUser, setRouterUser] = SP_REACT.useState(
    existingTarget?.router_user ?? ""
  );
  const [routerIp, setRouterIp] = SP_REACT.useState(
    existingTarget?.router_ip ?? ""
  );
  const [sshEnabled, setSshEnabled] = SP_REACT.useState(
    existingTarget?.ssh_enabled ?? false
  );
  const [sshUser, setSshUser] = SP_REACT.useState(
    existingTarget?.ssh_user ?? ""
  );
  const [sshPassword, setSshPassword] = SP_REACT.useState(
    existingTarget?.ssh_password ?? ""
  );
  const [sshPort, setSshPort] = SP_REACT.useState(
    String(existingTarget?.ssh_port ?? 22)
  );
  const [sshOs, setSshOs] = SP_REACT.useState(
    existingTarget?.ssh_os ?? "windows"
  );
  const [sshAutoLogin, setSshAutoLogin] = SP_REACT.useState(
    existingTarget?.ssh_auto_login ?? false
  );
  const [sshPin, setSshPin] = SP_REACT.useState(
    existingTarget?.ssh_pin ?? ""
  );
  const [errorMsg, setErrorMsg] = SP_REACT.useState("");
  const [saving, setSaving] = SP_REACT.useState(false);
  const modalRef = SP_REACT.useRef(null);

  SP_REACT.useEffect(() => {
    const root = modalRef.current;
    if (!root) return;
    const inputs = root.querySelectorAll(".vpn-wol-password-field input");
    inputs.forEach((inp) => {
      try {
        inp.type = "password";
        inp.style.setProperty("-webkit-text-security", "disc", "important");
      } catch {
        // ignore
      }
    });
  }, [sshEnabled, sshOs, sshAutoLogin, routerPassword, sshPassword, sshPin]);

  const vpnOptions = [
    { data: "", label: t.fieldVpnNone },
    ...vpns.map((v) => ({
      data: v.id,
      label: `${v.name} (${v.backend})`,
    })),
  ];

  const handleSave = async () => {
    setErrorMsg("");
    if (!mac.trim()) {
      setErrorMsg(t.errMacRequired);
      return;
    }
    if (sshEnabled && sshOs === "windows" && sshAutoLogin && !sshPin.trim()) {
      setErrorMsg(t.errPinRequired);
      return;
    }
    setSaving(true);
    try {
      const res = await onSave({
        id: existingTarget?.id,
        name: name.trim() || "PC",
        mac: mac.trim(),
        ip: ip.trim(),
        broadcast_ip: broadcastIp.trim(),
        port: parseInt(port, 10) || 9,
        vpn_id: vpnId,
        wake_trigger: wakeTrigger,
        router_password: routerPassword,
        router_user: routerUser.trim(),
        router_ip: routerIp.trim(),
        ssh_enabled: sshEnabled,
        ssh_user: sshUser.trim(),
        ssh_password: sshPassword,
        ssh_port: parseInt(sshPort, 10) || 22,
        ssh_os: sshOs || "windows",
        ssh_auto_login: sshOs === "windows" ? sshAutoLogin : false,
        ssh_pin: sshPin,
      });
      if (res.success) {
        closeModal?.();
      } else {
        setErrorMsg(res.error || t.errSaveFailed);
      }
    } catch (e) {
      setErrorMsg(String(e?.message || e || t.errSaveFailed));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTarget?.id || !onDelete) return;
    setSaving(true);
    try {
      await onDelete(existingTarget.id);
      closeModal?.();
    } finally {
      setSaving(false);
    }
  };

  return SP_JSX.jsx(DFL.ModalRoot, {
    onCancel: closeModal,
    closeModal: closeModal,
    children: SP_JSX.jsxs("div", {
      ref: modalRef,
      style: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px" },
      children: [
        SP_JSX.jsx("style", { children: PLUGIN_BUTTON_STYLES }),
        SP_JSX.jsx("h2", {
          style: { margin: "0 0 6px 0", fontSize: "18px", color: "#ffffff" },
          children: existingTarget
            ? formatString(t.modalTitleEdit, { name: existingTarget.name })
            : t.modalTitleNew,
        }),
        errorMsg
          ? SP_JSX.jsx("div", {
              style: {
                backgroundColor: "rgba(220, 53, 69, 0.25)",
                border: "1px solid #dc3545",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#ff858f",
                fontSize: "13px",
              },
              children: errorMsg,
            })
          : null,
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldPcNameLabel,
          value: name,
          onChange: (e) => setName(e.target.value),
          description: t.fieldPcNameDesc,
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldMacLabel,
          value: mac,
          onChange: (e) => setMac(e.target.value),
          description: t.fieldMacDesc,
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldIpLabel,
          value: ip,
          onChange: (e) => setIp(e.target.value),
          description: t.fieldIpDesc,
        }),
        SP_JSX.jsx(DFL.DropdownItem, {
          label: t.fieldVpnLabel,
          description: t.fieldVpnDesc,
          rgOptions: vpnOptions,
          selectedOption: vpnId,
          onChange: (opt) => setVpnId(String(opt.data ?? "")),
        }),
        SP_JSX.jsx("div", {
          className: "vpn-wol-password-field",
          children: SP_JSX.jsx(DFL.TextField, {
            label: t.fieldRouterPasswordLabel,
            value: routerPassword,
            bIsPassword: true,
            type: "password",
            onChange: (e) => setRouterPassword(e.target.value),
            description: t.fieldRouterPasswordDesc,
          }),
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldRouterUserLabel,
          value: routerUser,
          onChange: (e) => setRouterUser(e.target.value),
          description: t.fieldRouterUserDesc,
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldRouterIpLabel,
          value: routerIp,
          onChange: (e) => setRouterIp(e.target.value),
          description: t.fieldRouterIpDesc,
        }),
        SP_JSX.jsx(DFL.ToggleField, {
          label: t.fieldWakeTriggerLabel,
          description: t.fieldWakeTriggerDesc,
          checked: wakeTrigger,
          onChange: (val) => setWakeTrigger(val),
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldBroadcastLabel,
          value: broadcastIp,
          onChange: (e) => setBroadcastIp(e.target.value),
          description: t.fieldBroadcastDesc,
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: t.fieldPortLabel,
          value: port,
          mustBeNumeric: true,
          onChange: (e) => setPort(e.target.value),
          description: t.fieldPortDesc,
        }),
        SP_JSX.jsx(DFL.ToggleField, {
          label: t.fieldSshEnableLabel,
          description: t.fieldSshEnableDesc,
          checked: sshEnabled,
          onChange: (val) => setSshEnabled(val),
        }),
        sshEnabled
          ? SP_JSX.jsxs(SP_REACT.Fragment, {
              children: [
                SP_JSX.jsx(DFL.TextField, {
                  label: t.fieldSshUserLabel,
                  value: sshUser,
                  onChange: (e) => setSshUser(e.target.value),
                  description: t.fieldSshUserDesc,
                }),
                SP_JSX.jsx("div", {
                  className: "vpn-wol-password-field",
                  children: SP_JSX.jsx(DFL.TextField, {
                    label: t.fieldSshPasswordLabel,
                    value: sshPassword,
                    bIsPassword: true,
                    type: "password",
                    onChange: (e) => setSshPassword(e.target.value),
                    description: t.fieldSshPasswordDesc,
                  }),
                }),
                SP_JSX.jsx(DFL.DropdownItem, {
                  label: t.fieldSshOsLabel,
                  description: t.fieldSshOsDesc,
                  rgOptions: [
                    { data: "windows", label: "Windows (shutdown /s /t 0)" },
                    { data: "linux", label: "Linux (systemctl poweroff)" },
                  ],
                  selectedOption: sshOs,
                  onChange: (opt) => setSshOs(String(opt.data ?? "windows")),
                }),
                SP_JSX.jsx(DFL.TextField, {
                  label: t.fieldSshPortLabel,
                  value: sshPort,
                  mustBeNumeric: true,
                  onChange: (e) => setSshPort(e.target.value),
                  description: t.fieldSshPortDesc,
                }),
                sshOs === "windows"
                  ? SP_JSX.jsxs(SP_REACT.Fragment, {
                      children: [
                        SP_JSX.jsx(DFL.ToggleField, {
                          label: t.fieldSshAutoLoginLabel,
                          description: t.fieldSshAutoLoginDesc,
                          checked: sshAutoLogin,
                          onChange: (val) => setSshAutoLogin(val),
                        }),
                        sshAutoLogin
                          ? SP_JSX.jsx("div", {
                              className: "vpn-wol-password-field",
                              children: SP_JSX.jsx(DFL.TextField, {
                                label: t.fieldSshPinLabel,
                                value: sshPin,
                                bIsPassword: true,
                                type: "password",
                                onChange: (e) => setSshPin(e.target.value),
                                description: t.fieldSshPinDesc,
                              }),
                            })
                          : null,
                      ],
                    })
                  : null,
              ],
            })
          : null,
        SP_JSX.jsxs(DFL.Focusable, {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "10px",
            marginTop: "12px",
          },
          children: [
            existingTarget && onDelete
              ? SP_JSX.jsx(DFL.DialogButton, {
                  className: "vpn-wol-btn vpn-wol-btn-danger",
                  style: {
                    flex: "1",
                  },
                  disabled: saving,
                  onClick: handleDelete,
                  children: t.btnDelete,
                })
              : null,
            SP_JSX.jsx(DFL.DialogButton, {
              className: "vpn-wol-btn",
              style: { flex: "1" },
              disabled: saving,
              onClick: () => closeModal?.(),
              children: t.btnCancel,
            }),
            SP_JSX.jsx(DFL.DialogButton, {
              className: "vpn-wol-btn vpn-wol-btn-primary",
              style: {
                fontWeight: 600,
                flex: "1.5",
              },
              disabled: saving,
              onClick: handleSave,
              children: saving ? t.btnSaving : t.btnSave,
            }),
          ],
        }),
      ],
    }),
  });
};

const PluginIcon = () =>
  SP_JSX.jsxs("svg", {
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      SP_JSX.jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
      SP_JSX.jsx("path", { d: "M12 8v4" }),
      SP_JSX.jsx("circle", { cx: "12", cy: "15", r: "1" }),
    ],
  });

const Content = () => {
  const t = SP_REACT.useMemo(() => getTranslations(), []);
  const isVisible = useQuickAccessVisible ? useQuickAccessVisible() : true;

  const [vpns, setVpns] = SP_REACT.useState([]);
  const [targets, setTargets] = SP_REACT.useState([]);
  const [pingStatuses, setPingStatuses] = SP_REACT.useState({});
  const [loading, setLoading] = SP_REACT.useState(true);
  const [switchingVpnId, setSwitchingVpnId] = SP_REACT.useState(null);
  const [wakingTargetIds, setWakingTargetIds] = SP_REACT.useState({});
  const [loggingInTargetIds, setLoggingInTargetIds] = SP_REACT.useState({});
  const [shuttingDownTargetIds, setShuttingDownTargetIds] = SP_REACT.useState({});

  const mountedRef = SP_REACT.useRef(true);
  SP_REACT.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshState = SP_REACT.useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const state = await getInitialState();
      if (!mountedRef.current) return;
      setVpns(state.vpns || []);
      setTargets(state.targets || []);
      setPingStatuses(state.ping_status || {});
    } catch (e) {
      console.error("[VPN-WoL] Failed to refresh state:", e);
    } finally {
      if (mountedRef.current && showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  SP_REACT.useEffect(() => {
    refreshState(true);
  }, [refreshState]);

  SP_REACT.useEffect(() => {
    if (!isVisible) return;
    refreshState(false);
    const interval = setInterval(() => {
      refreshState(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, refreshState]);

  const handleToggleVpn = async (vpn, enable) => {
    setSwitchingVpnId(vpn.id);
    try {
      const res = await setVpnState(vpn.id, enable);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: `VPN: ${vpn.name}`,
          body: enable ? t.toastVpnConnected : t.toastVpnDisconnected,
        });
        setTimeout(() => {
          if (mountedRef.current) refreshState(false);
        }, 800);
      } else {
        toaster.toast({
          title: `${t.toastVpnErrorTitle} (${vpn.name})`,
          body: res.error || "Error",
        });
      }
    } catch (e) {
      toaster.toast({
        title: `${t.toastVpnErrorTitle} (${vpn.name})`,
        body: String(e?.message || e),
      });
    } finally {
      if (mountedRef.current) {
        setSwitchingVpnId(null);
      }
    }
  };

  const handleLoginTarget = SP_REACT.useCallback(
    async (target, silentAlreadyUnlocked = false) => {
      setLoggingInTargetIds((prev) => ({ ...prev, [target.id]: true }));
      try {
        const res = await loginTarget(target.id);
        if (res.success) {
          if (res.already_unlocked) {
            if (!silentAlreadyUnlocked) {
              toaster.toast({
                title: formatString(t.toastLoginAlreadyTitle, { name: target.name }),
                body: t.toastLoginAlreadyBody,
              });
            }
          } else {
            toaster.toast({
              title: t.toastLoginSuccessTitle,
              body: formatString(t.toastLoginSuccessBody, { name: target.name }),
            });
          }
        } else {
          toaster.toast({
            title: t.toastLoginFailedTitle,
            body: res.error || "Error",
          });
        }
      } catch (e) {
        toaster.toast({
          title: t.toastLoginFailedTitle,
          body: String(e?.message || e),
        });
      } finally {
        if (mountedRef.current) {
          setLoggingInTargetIds((prev) => ({ ...prev, [target.id]: false }));
        }
      }
    },
    [t]
  );

  const watchHostWakeup = SP_REACT.useCallback(
    async (target) => {
      if (!target.ip) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
        return;
      }
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        if (!mountedRef.current) return;
        try {
          const p = await pingTarget(target.ip);
          if (!mountedRef.current) return;
          setPingStatuses((prev) => ({ ...prev, [target.id]: p }));
          if (p.online) {
            setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
            toaster.toast({
              title: formatString(t.toastPcOnlineTitle, { name: target.name }),
              body: `${formatString(t.toastPcOnlineBody, { ip: target.ip })}${
                p.latency_ms !== null ? ` (${p.latency_ms} ms)` : ""
              }`,
            });
            if (
              target.ssh_enabled &&
              target.ssh_auto_login &&
              target.ssh_pin &&
              (target.ssh_os ?? "windows") === "windows"
            ) {
              handleLoginTarget(target, true);
            }
            return;
          }
        } catch {
          // ignore transient ping errors while booting
        }
      }
      if (mountedRef.current) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
      }
    },
    [t, handleLoginTarget]
  );

  const handleWakeTarget = async (target) => {
    setWakingTargetIds((prev) => ({ ...prev, [target.id]: true }));
    try {
      const res = await sendWol(target.id, true);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: t.toastWolSentTitle,
          body: formatString(t.toastWolSentBody, { name: target.name }),
        });
        watchHostWakeup(target);
      } else {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
        toaster.toast({
          title: t.toastWolFailedTitle,
          body: res.error || "Error",
        });
      }
    } catch (e) {
      if (mountedRef.current) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
      }
      toaster.toast({
        title: t.toastWolFailedTitle,
        body: String(e?.message || e),
      });
    }
  };

  const handleShutdownTarget = (target) => {
    DFL.showModal(
      SP_JSX.jsx(ConfirmShutdownModal, {
        targetName: target.name,
        onConfirm: async () => {
          setShuttingDownTargetIds((prev) => ({ ...prev, [target.id]: true }));
          try {
            const res = await shutdownTarget(target.id);
            if (res.success) {
              toaster.toast({
                title: t.toastShutdownSentTitle,
                body: formatString(t.toastShutdownSentBody, { name: target.name }),
              });
              setTimeout(() => {
                if (mountedRef.current) refreshState(false);
              }, 3000);
            } else {
              toaster.toast({
                title: t.toastShutdownFailedTitle,
                body: res.error || "Error",
              });
            }
          } catch (e) {
            toaster.toast({
              title: t.toastShutdownFailedTitle,
              body: String(e?.message || e),
            });
          } finally {
            if (mountedRef.current) {
              setShuttingDownTargetIds((prev) => ({ ...prev, [target.id]: false }));
            }
          }
        },
      })
    );
  };

  const openTargetModal = (existing) => {
    DFL.showModal(
      SP_JSX.jsx(TargetModal, {
        existingTarget: existing,
        vpns: vpns,
        onSave: async (targetData) => {
          const res = await saveWolTarget(targetData);
          if (res.success && mountedRef.current) {
            setTargets(res.targets || []);
            setTimeout(() => {
              if (mountedRef.current) refreshState(false);
            }, 300);
          }
          return { success: res.success, error: res.error };
        },
        onDelete: existing
          ? async (targetId) => {
              const res = await deleteWolTarget(targetId);
              if (mountedRef.current) {
                setTargets(res.targets || []);
              }
            }
          : undefined,
      })
    );
  };

  return SP_JSX.jsxs("div", {
    children: [
      SP_JSX.jsx("style", { children: PLUGIN_BUTTON_STYLES }),
      SP_JSX.jsxs(DFL.PanelSection, {
        title: t.vpnSectionTitle,
        spinner: loading,
        children: [
          vpns.length === 0 && !loading
            ? SP_JSX.jsx(DFL.PanelSectionRow, {
                children: SP_JSX.jsx("div", {
                  style: { fontSize: "12px", color: "#969696", padding: "4px 0" },
                  children: t.noVpnsFound,
                }),
              })
            : vpns.map((vpn) => {
                const isSwitching = switchingVpnId === vpn.id;
                const dotColor = isSwitching
                  ? "#f39c12"
                  : vpn.active
                  ? "#2ecc71"
                  : "#7f8c8d";
                const statusText = isSwitching
                  ? t.statusSwitching
                  : vpn.active
                  ? `${t.statusConnected}${vpn.ip ? ` • ${vpn.ip}` : ""}${
                      vpn.interface ? ` (${vpn.interface})` : ""
                    }`
                  : `${t.statusDisconnected} • ${
                      vpn.backend === "nmcli" ? "NetworkManager" : "wg-quick"
                    }`;

                return SP_JSX.jsx(
                  DFL.PanelSectionRow,
                  {
                    children: SP_JSX.jsx(DFL.ToggleField, {
                      label: SP_JSX.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "8px" },
                        children: [
                          SP_JSX.jsx("span", {
                            style: {
                              display: "inline-block",
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              backgroundColor: dotColor,
                              boxShadow: vpn.active ? `0 0 6px ${dotColor}` : "none",
                            },
                          }),
                          SP_JSX.jsx("span", {
                            style: { fontWeight: 600 },
                            children: vpn.name,
                          }),
                        ],
                      }),
                      description: statusText,
                      checked: vpn.active,
                      disabled: isSwitching,
                      onChange: (checked) => handleToggleVpn(vpn, checked),
                    }),
                  },
                  vpn.id
                );
              }),
          SP_JSX.jsx(DFL.PanelSectionRow, {
            children: SP_JSX.jsx(DFL.ButtonItem, {
              layout: "below",
              onClick: () => refreshState(true),
              disabled: loading || switchingVpnId !== null,
              children: t.refreshStatus,
            }),
          }),
        ],
      }),
      SP_JSX.jsxs(DFL.PanelSection, {
        title: t.wolSectionTitle,
        children: [
          targets.length === 0
            ? SP_JSX.jsx(DFL.PanelSectionRow, {
                children: SP_JSX.jsx("div", {
                  style: { fontSize: "12px", color: "#969696", padding: "4px 0" },
                  children: t.noTargetsConfigured,
                }),
              })
            : targets.map((target) => {
                const ping = pingStatuses[target.id];
                const isOnline = Boolean(ping?.online);
                const isWaking = Boolean(wakingTargetIds[target.id]);
                const linkedVpn = target.vpn_id
                  ? vpns.find((v) => v.id === target.vpn_id || v.name === target.vpn_id)
                  : undefined;
                const needsVpnActivation = Boolean(linkedVpn && !linkedVpn.active);

                const badgeColor = isOnline
                  ? "#2ecc71"
                  : isWaking
                  ? "#f39c12"
                  : "#95a5a6";
                const badgeText = isOnline
                  ? `${t.badgeOnline}${
                      ping?.latency_ms != null ? ` (${ping.latency_ms} ms)` : ""
                    }`
                  : isWaking
                  ? t.badgeWaking
                  : target.ip
                  ? t.badgeOffline
                  : t.badgeReady;

                return SP_JSX.jsx(
                  DFL.PanelSectionRow,
                  {
                    children: SP_JSX.jsxs("div", {
                      style: {
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                        border: isOnline
                          ? "1px solid rgba(46, 204, 113, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      },
                      children: [
                        SP_JSX.jsxs("div", {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                            cursor: "pointer",
                          },
                          onClick: () => openTargetModal(target),
                          children: [
                            SP_JSX.jsx("span", {
                              style: {
                                fontWeight: 700,
                                fontSize: "15px",
                                color: "#ffffff",
                              },
                              children: target.name,
                            }),
                            SP_JSX.jsxs("span", {
                              style: {
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: badgeColor,
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              },
                              children: [
                                SP_JSX.jsx("span", {
                                  style: {
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    backgroundColor: badgeColor,
                                  },
                                }),
                                badgeText,
                              ],
                            }),
                          ],
                        }),
                        SP_JSX.jsxs("div", {
                          style: {
                            fontSize: "11px",
                            color: "#b0b8c0",
                            marginBottom: "8px",
                            lineHeight: 1.4,
                          },
                          children: [
                            SP_JSX.jsxs("div", {
                              children: [
                                target.ip ? `IP: ${target.ip} • ` : "",
                                `MAC: ${target.mac}`,
                              ],
                            }),
                            linkedVpn
                              ? SP_JSX.jsxs("div", {
                                  style: {
                                    color: linkedVpn.active ? "#7bed9f" : "#eccc68",
                                  },
                                  children: [
                                    `VPN: ${linkedVpn.name} (`,
                                    linkedVpn.active
                                      ? t.statusConnected
                                      : t.vpnAutoStartHint,
                                    ")",
                                  ],
                                  })
                              : null,
                          ],
                        }),
                        SP_JSX.jsxs("div", {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            width: "100%",
                          },
                          children: [
                            SP_JSX.jsxs(DFL.Focusable, {
                              style: {
                                display: "flex",
                                flexDirection: "row",
                                gap: "6px",
                                width: "100%",
                              },
                              children: [
                                SP_JSX.jsx(DFL.DialogButton, {
                                  className: "vpn-wol-btn vpn-wol-btn-primary",
                                  style: {
                                    flex: "1",
                                    padding: "8px 10px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                  disabled: isWaking,
                                  onClick: () => handleWakeTarget(target),
                                  children: isWaking
                                    ? t.btnSendingWol
                                    : needsVpnActivation
                                    ? t.btnStartVpnAndWake
                                    : t.btnWakePc,
                                }),
                                SP_JSX.jsx(DFL.DialogButton, {
                                  className: "vpn-wol-btn",
                                  style: {
                                    width: "40px",
                                    minWidth: "40px",
                                    maxWidth: "40px",
                                    padding: "8px 0",
                                    fontSize: "14px",
                                  },
                                  onClick: () => openTargetModal(target),
                                  children: "✎",
                                }),
                              ],
                            }),
                            target.ssh_enabled &&
                            isOnline &&
                            target.ssh_auto_login &&
                            target.ssh_pin &&
                            (target.ssh_os ?? "windows") === "windows"
                              ? SP_JSX.jsx(DFL.DialogButton, {
                                  className: "vpn-wol-btn vpn-wol-btn-success",
                                  style: {
                                    width: "100%",
                                    padding: "8px 10px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                  disabled: Boolean(loggingInTargetIds[target.id]),
                                  onClick: () => handleLoginTarget(target, false),
                                  children: loggingInTargetIds[target.id]
                                    ? t.btnLoggingIn
                                    : t.btnLoginPc,
                                })
                              : null,
                            target.ssh_enabled && isOnline
                              ? SP_JSX.jsx(DFL.DialogButton, {
                                  className: "vpn-wol-btn vpn-wol-btn-danger",
                                  style: {
                                    width: "100%",
                                    padding: "8px 10px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                  disabled: Boolean(shuttingDownTargetIds[target.id]),
                                  onClick: () => handleShutdownTarget(target),
                                  children: shuttingDownTargetIds[target.id]
                                    ? t.btnShuttingDown
                                    : t.btnShutdownPc,
                                })
                              : null,
                          ],
                        }),
                      ],
                    }),
                  },
                  target.id
                );
              }),
          SP_JSX.jsx(DFL.PanelSectionRow, {
            children: SP_JSX.jsx(DFL.ButtonItem, {
              layout: "below",
              onClick: () => openTargetModal(undefined),
              children: t.btnAddPc,
            }),
          }),
        ],
      }),
    ],
  });
};

var index = definePlugin(() => {
  return {
    name: "VPN & Wake-on-LAN",
    titleView: SP_JSX.jsx("div", {
      className: DFL.staticClasses.Title,
      children: "VPN & Wake-on-LAN",
    }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(PluginIcon, {}),
  };
});

export { index as default };
