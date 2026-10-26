export type SupportedLocale = "en" | "de" | "fr" | "es" | "it" | "pt" | "pl" | "ru";

export interface Translations {
  vpnSectionTitle: string;
  noVpnsFound: string;
  statusSwitching: string;
  statusConnected: string;
  statusDisconnected: string;
  refreshStatus: string;
  wolSectionTitle: string;
  noTargetsConfigured: string;
  badgeOnline: string;
  badgeWaking: string;
  badgeOffline: string;
  badgeReady: string;
  vpnAutoStartHint: string;
  btnSendingWol: string;
  btnStartVpnAndWake: string;
  btnWakePc: string;
  btnAddPc: string;
  toastVpnConnected: string;
  toastVpnDisconnected: string;
  toastVpnErrorTitle: string;
  toastWolSentTitle: string;
  toastWolSentBody: string;
  toastWolFailedTitle: string;
  toastPcOnlineTitle: string;
  toastPcOnlineBody: string;
  modalTitleEdit: string;
  modalTitleNew: string;
  errMacRequired: string;
  errSaveFailed: string;
  fieldPcNameLabel: string;
  fieldPcNameDesc: string;
  fieldMacLabel: string;
  fieldMacDesc: string;
  fieldIpLabel: string;
  fieldIpDesc: string;
  fieldVpnLabel: string;
  fieldVpnDesc: string;
  fieldVpnNone: string;
  fieldWakeTriggerLabel: string;
  fieldWakeTriggerDesc: string;
  fieldBroadcastLabel: string;
  fieldBroadcastDesc: string;
  fieldPortLabel: string;
  fieldPortDesc: string;
  fieldRouterPasswordLabel: string;
  fieldRouterPasswordDesc: string;
  fieldRouterUserLabel: string;
  fieldRouterUserDesc: string;
  fieldRouterIpLabel: string;
  fieldRouterIpDesc: string;
  btnShutdownPc: string;
  btnShuttingDown: string;
  modalSectionSsh: string;
  fieldSshEnableLabel: string;
  fieldSshEnableDesc: string;
  fieldSshUserLabel: string;
  fieldSshUserDesc: string;
  fieldSshPasswordLabel: string;
  fieldSshPasswordDesc: string;
  fieldSshPortLabel: string;
  fieldSshPortDesc: string;
  fieldSshOsLabel: string;
  fieldSshOsDesc: string;
  fieldSshAutoLoginLabel: string;
  fieldSshAutoLoginDesc: string;
  fieldSshPinLabel: string;
  fieldSshPinDesc: string;
  errPinRequired: string;
  btnLoginPc: string;
  btnLoggingIn: string;
  toastLoginSuccessTitle: string;
  toastLoginSuccessBody: string;
  toastLoginAlreadyTitle: string;
  toastLoginAlreadyBody: string;
  toastLoginFailedTitle: string;
  toastShutdownSentTitle: string;
  toastShutdownSentBody: string;
  toastShutdownFailedTitle: string;
  confirmShutdownTitle: string;
  confirmShutdownBody: string;
  confirmShutdownButton: string;
  btnDelete: string;
  btnCancel: string;
  btnSave: string;
  btnSaving: string;
}

const translations: Record<SupportedLocale, Translations> = {
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

const steamLangMap: Record<string, SupportedLocale> = {
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

export function detectLocale(): SupportedLocale {
  try {
    const win = window as any;
    const steamLocales: string[] | undefined =
      win?.LocalizationManager?.m_rgLocalesToUse;
    if ( Array.isArray(steamLocales) && steamLocales.length > 0 ) {
      const first = String(steamLocales[0]).toLowerCase();
      if (steamLangMap[first]) {
        return steamLangMap[first];
      }
      const prefix = first.slice(0, 2) as SupportedLocale;
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
        .split(/[-_]/)[0] as SupportedLocale;
      if (code in translations) {
        return code;
      }
    }
  } catch {
    // ignore
  }

  return "en";
}

export function getTranslations(): Translations {
  return translations[detectLocale()] || translations.en;
}

export function formatString(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}
