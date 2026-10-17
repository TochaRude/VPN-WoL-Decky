const manifest = {
  name: "VPN & Wake-on-LAN",
  author: "VPN-WoL",
  flags: ["root"],
  api_version: 1,
  publish: {
    tags: ["vpn", "wireguard", "wol", "wake-on-lan", "network", "root"],
    description:
      "Manage and toggle VPN connections (NetworkManager & WireGuard) and wake up PCs via Wake-on-LAN over VPN or local network.",
    image: "https://opengraph.githubassets.com/1/SteamDeckHomebrew/decky-plugin-template",
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
  const [errorMsg, setErrorMsg] = SP_REACT.useState("");
  const [saving, setSaving] = SP_REACT.useState(false);

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
      style: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px" },
      children: [
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
                  style: {
                    backgroundColor: "rgba(220, 53, 69, 0.35)",
                    color: "#ff9ea5",
                    flex: "1",
                  },
                  disabled: saving,
                  onClick: handleDelete,
                  children: t.btnDelete,
                })
              : null,
            SP_JSX.jsx(DFL.DialogButton, {
              style: { flex: "1" },
              disabled: saving,
              onClick: () => closeModal?.(),
              children: t.btnCancel,
            }),
            SP_JSX.jsx(DFL.DialogButton, {
              style: {
                backgroundColor: "#1a9fff",
                color: "#ffffff",
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

  const watchHostWakeup = SP_REACT.useCallback(
    async (target) => {
      if (!target.ip) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
        return;
      }
      for (let attempt = 0; attempt < 20; attempt++) {
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
    [t]
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
                          },
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
                        SP_JSX.jsxs(DFL.Focusable, {
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                          },
                          children: [
                            SP_JSX.jsx(DFL.DialogButton, {
                              style: {
                                flex: "1",
                                padding: "8px 10px",
                                fontSize: "13px",
                                fontWeight: 600,
                                backgroundColor: needsVpnActivation
                                  ? "#2980b9"
                                  : "#1a9fff",
                                color: "#ffffff",
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
                              style: {
                                width: "auto",
                                minWidth: "42px",
                                padding: "8px 12px",
                                fontSize: "13px",
                              },
                              onClick: () => openTargetModal(target),
                              children: "✎",
                            }),
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
