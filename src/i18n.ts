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
