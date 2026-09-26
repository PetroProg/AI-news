(function() {
    // Application State
    const state = {
      lang: 'ru',
      currentTab: 'news',
      searchDeviceQuery: '',
      deviceCategoryFilter: 'all',
      newsCategoryFilter: 'all',
      vpnConnected: true,
      selectedDns: 'pihole',
      dnsFilters: {
        adblock: true,
        malware: true,
        doh: true,
        parental: false
      },
      dnsStats: {
        totalQueries: 14890,
        blockedQueries: 3412,
        threatsBlocked: 27
      }
    };

        // Dictionary for Multilingual Support
    const i18n = {
      ru: {
        appName: "HomeGuard",
        gatewayStatus: "В сети",
        tabNews: "Новости",
        tabDevices: "Мои устройства",
        tabVpn: "VPN & Сеть",
        testAttackBtn: "Тест атаки",
        aiServerBadge: "Сервер ИИ HomeGuard • Поток в реальном времени",
        aiServerTitle: "Актуальные события и новости",
        aiServerDesc: "Статьи, автоматически структурированные и обработанные искусственным интеллектом.",
        catAll: "Все",
        catAi: "ИИ & Tech",
        catGaming: "Игры & CS:GO",
        catScience: "Наука",
        catLifestyle: "Тренды",
        catSecurity: "Безопасность",
        readOfficialSource: "Читать в источнике",
        aiSummaryLabel: "Резюме нейросети (AI):",
        netProtection: "Защита Сети",
        netProtectionSub: "Все экраны активны",
        attacksBlocked: "Угроз заблокировано",
        attacksBlockedSub: "0 вторжений",
        internetSpeed: "Скорость Сети",
        internetSpeedSub: "Оптоволокно (8 мс)",
        remoteAccess: "Удаленный Доступ",
        remoteAccessSub: "WireGuard активен",
        devicesOverviewTitle: "Подключенные устройства",
        statTotal: "Всего :",
        statActive: "Активно :",
        statPaused: "На паузе :",
        scanNetworkBtn: "Сканировать сеть",
        searchPlaceholder: "Поиск по имени, IP...",
        catDevAll: "Все",
        catDevComp: "Компьютеры",
        catDevMob: "Смартфоны",
        catDevMedia: "ТВ & Консоли",
        catDevIot: "Умный дом",
        catDevGuest: "Гостевые",
        btnPauseInternet: "Отключить интернет",
        btnResumeInternet: "Возобновить",
        statusOnline: "В сети",
        statusPaused: "Интернет отключен",
        btnConfigure: "Управление",
        trafficToday: "Трафик сегодня :",
        modalDeviceTitle: "Управление устройством",
        modalDeviceDesc: "Настройки доступа и приоритета для этого члена семьи.",
        deviceNameLabel: "Имя устройства :",
        deviceRoomLabel: "Комната / Расположение :",
        qosLabel: "Приоритет подключения (QoS) :",
        qosHigh: "Высокий (Онлайн-игры, 4K видео без задержек)",
        qosNormal: "Обычный (Веб-серфинг, соцсети)",
        qosLow: "Низкий (Фоновые загрузки)",
        parentalLabel: "Родительский контроль (фильтрация контента)",
        pauseToggleLabel: "Временно заблокировать доступ к интернету",
        saveBtn: "Сохранить",
        radarTitle: "Радар роутера",
        radarScanning: "Поиск новых Wi-Fi устройств...",
        radarFoundTitle: "Обнаружено новое устройство!",
        radarAddBtn: "Разрешить и добавить в домашнюю сеть",
        vpnSectionBadge: "Удаленный доступ",
        vpnSectionTitle: "Безопасное подключение к дому",
        vpnDesc: "Подключайтесь к домашней сети из любой точки мира (кафе, 5G, путешествия).",
        vpnStatusConnected: "Подключено к дому",
        vpnStatusDisconnected: "Отключено",
        vpnBtnDisconnect: "ОТКЛЮЧИТЬ VPN",
        vpnBtnConnect: "ПОДКЛЮЧИТЬСЯ К ДОМУ (VPN)",
        virtualIpLabel: "Виртуальный IP :",
        pingLabel: "Пинг до дома :",
        encryptionLabel: "Шифрование :",
        qrCodeBtn: "Показать QR-код для смартфона",
        chartTitle: "Скорость трафика в реальном времени (Мбит/с)",
        chartLive: "ПРЯМОЙ ЭФИР",
        dnsSectionBadge: "DNS-фильтр и защита",
        dnsSectionTitle: "Интеллектуальный домашний щит",
        dnsDesc: "Блокирует рекламу, трекеры и подозрительные сайты для ВСЕХ устройств без установки приложений.",
        dnsProviderLabel: "Активный DNS-провайдер :",
        shieldAdblockTitle: "Блокировщик рекламы",
        shieldAdblockDesc: "Удаляет навязчивые баннеры, всплывающие окна и рекламу в видео",
        shieldMalwareTitle: "Защита от вирусов и фишинга",
        shieldMalwareDesc: "Блокирует поддельные банковские сайты и вредоносные ссылки",
        shieldDohTitle: "Шифрование DNS (DoH)",
        shieldDohDesc: "Защищает историю посещений от отслеживания провайдером",
        shieldParentalTitle: "Семейный режим / Родительский контроль",
        shieldParentalDesc: "Фильтрует контент для взрослых и включает безопасный поиск",
        statQueries: "Запросов :",
        statBlocked: "Рекламы заблокировано :",
        statThreats: "Угроз отбито :",
        dnsLogTitle: "Журнал DNS-запросов в реальном времени",
        dnsLogFilterAll: "Все запросы",
        dnsLogFilterBlocked: "Только заблокированные",
        dnsLogFilterAllowed: "Только разрешенные",
        toastAttackTitle: "⚠️ Угроза нейтрализована!",
        toastAttackDesc: "HomeGuard заблокировал подозрительную попытку соединения.",
        toastResetTitle: "Параметры сброшены",
        toastResetDesc: "Значения возвращены к исходным настройкам.",
        toastPauseOn: "Интернет приостановлен",
        toastPauseOff: "Доступ к интернету возобновлен",
        toastVpnOn: "VPN подключен к домашней сети",
        toastVpnOff: "VPN отключен",
        toastSaved: "Изменения успешно сохранены"
      },
      en: {
        appName: "HomeGuard",
        gatewayStatus: "Online",
        tabNews: "News & Feed",
        tabDevices: "My Devices",
        tabVpn: "VPN & Security",
        testAttackBtn: "Attack Test",
        aiServerBadge: "HomeGuard AI Server • Real-time Stream",
        aiServerTitle: "Curated News & Web Trends",
        aiServerDesc: "Articles automatically summarized by AI across your favorite categories.",
        catAll: "All",
        catAi: "AI & Tech",
        catGaming: "Gaming",
        catScience: "Science",
        catLifestyle: "Trends",
        catSecurity: "Security",
        readOfficialSource: "Read official source",
        aiSummaryLabel: "AI Summary:",
        netProtection: "Network Protection",
        netProtectionSub: "All shields active",
        attacksBlocked: "Threats Blocked",
        attacksBlockedSub: "0 intrusion",
        internetSpeed: "Internet Speed",
        internetSpeedSub: "Fiber optical (8 ms)",
        remoteAccess: "Remote Access",
        remoteAccessSub: "WireGuard ready",
        devicesOverviewTitle: "Connected Devices",
        statTotal: "Total:",
        statActive: "Active:",
        statPaused: "Paused:",
        scanNetworkBtn: "Scan network",
        searchPlaceholder: "Search by name, IP...",
        catDevAll: "All",
        catDevComp: "Computers",
        catDevMob: "Smartphones",
        catDevMedia: "TV & Consoles",
        catDevIot: "Smart Home",
        catDevGuest: "Guests",
        btnPauseInternet: "Pause Internet",
        btnResumeInternet: "Resume",
        statusOnline: "Online",
        statusPaused: "Internet paused",
        btnConfigure: "Manage",
        trafficToday: "Today's traffic:",
        modalDeviceTitle: "Manage Device",
        modalDeviceDesc: "Configure Internet priority and safety rules for this device.",
        deviceNameLabel: "Device Name:",
        deviceRoomLabel: "Room / Location:",
        qosLabel: "Speed Priority (QoS):",
        qosHigh: "High (Lag-free gaming, 4K streaming)",
        qosNormal: "Normal (Web browsing, social media)",
        qosLow: "Low (Background downloads)",
        parentalLabel: "Parental filter (block mature content)",
        pauseToggleLabel: "Temporarily pause Internet for this device",
        saveBtn: "Save Changes",
        radarTitle: "Router Radar",
        radarScanning: "Searching for new Wi-Fi devices...",
        radarFoundTitle: "New device detected!",
        radarAddBtn: "Authorize & connect to home",
        vpnSectionBadge: "Remote Access",
        vpnSectionTitle: "Secure Tunnel to Home",
        vpnDesc: "Connect directly to your home network securely from anywhere (café, 5G roaming, hotel).",
        vpnStatusConnected: "Connected to home",
        vpnStatusDisconnected: "Disconnected",
        vpnBtnDisconnect: "DISCONNECT REMOTE VPN",
        vpnBtnConnect: "CONNECT TO HOME (VPN)",
        virtualIpLabel: "Virtual IP:",
        pingLabel: "Home Ping:",
        encryptionLabel: "Encryption:",
        qrCodeBtn: "Show QR Code for phone",
        chartTitle: "Real-time Traffic Speed (Mb/s)",
        chartLive: "LIVE STREAM",
        dnsSectionBadge: "DNS Filter & Threat Shield",
        dnsSectionTitle: "Smart Home Shield",
        dnsDesc: "Block ads, trackers and phishing scams on all home devices without installing apps.",
        dnsProviderLabel: "Active DNS Provider:",
        shieldAdblockTitle: "Ad & Tracker Blocker",
        shieldAdblockDesc: "Removes annoying banners, pop-ups and video ads",
        shieldMalwareTitle: "Scam & Malware Protection",
        shieldMalwareDesc: "Blocks fake banking phishing links and infected domains",
        shieldDohTitle: "Encrypted DNS (DoH)",
        shieldDohDesc: "Prevents internet providers from logging your web activity",
        shieldParentalTitle: "Family & Parental Control",
        shieldParentalDesc: "Filters adult domains and forces SafeSearch",
        statQueries: "Queries:",
        statBlocked: "Ads blocked:",
        statThreats: "Threats stopped:",
        dnsLogTitle: "Live DNS Query Activity",
        dnsLogFilterAll: "All queries",
        dnsLogFilterBlocked: "Blocked only",
        dnsLogFilterAllowed: "Allowed only",
        toastAttackTitle: "⚠️ Threat Neutralized!",
        toastAttackDesc: "HomeGuard blocked an unauthorized suspicious connection.",
        toastResetTitle: "Parameters Reset",
        toastResetDesc: "Demo settings have been restored.",
        toastPauseOn: "Internet access paused",
        toastPauseOff: "Internet access restored",
        toastVpnOn: "VPN connected to home",
        toastVpnOff: "VPN disconnected",
        toastSaved: "Settings saved successfully"
      },
      fr: {
        appName: "HomeGuard",
        gatewayStatus: "En ligne",
        tabNews: "Actualités",
        tabDevices: "Mes Appareils",
        tabVpn: "VPN & Sécurité",
        testAttackBtn: "Test d'attaque",
        aiServerBadge: "Serveur IA HomeGuard • Flux en temps réel",
        aiServerTitle: "Actualités & Tendances du Web",
        aiServerDesc: "Articles résumés automatiquement par l'IA dans vos domaines préférés.",
        catAll: "Toutes",
        catAi: "IA & Tech",
        catGaming: "Jeux Vidéo",
        catScience: "Sciences",
        catLifestyle: "Tendances",
        catSecurity: "Sécurité",
        readOfficialSource: "Lire la source officielle",
        aiSummaryLabel: "Résumé par IA :",
        netProtection: "Protection Réseau",
        netProtectionSub: "Tous les boucliers actifs",
        attacksBlocked: "Menaces Bloquées",
        attacksBlockedSub: "0 intrusion",
        internetSpeed: "Débit Internet",
        internetSpeedSub: "Fibre optique (8 ms)",
        remoteAccess: "Accès à distance",
        remoteAccessSub: "WireGuard prêt",
        devicesOverviewTitle: "Appareils connectés",
        statTotal: "Total :",
        statActive: "Actifs :",
        statPaused: "En pause :",
        scanNetworkBtn: "Scanner le réseau",
        searchPlaceholder: "Rechercher par nom, IP...",
        catDevAll: "Tous",
        catDevComp: "Ordinateurs",
        catDevMob: "Smartphones",
        catDevMedia: "TV & Consoles",
        catDevIot: "Maison connectée",
        catDevGuest: "Invités",
        btnPauseInternet: "Couper Internet",
        btnResumeInternet: "Réactiver",
        statusOnline: "En ligne",
        statusPaused: "Internet coupé",
        btnConfigure: "Gérer",
        trafficToday: "Trafic aujourd'hui :",
        modalDeviceTitle: "Gérer cet appareil",
        modalDeviceDesc: "Paramètres d'accès et de priorité pour ce membre de la famille.",
        deviceNameLabel: "Nom de l'appareil :",
        deviceRoomLabel: "Pièce / Emplacement :",
        qosLabel: "Priorité de la connexion (QoS) :",
        qosHigh: "Haute (Jeux en ligne, streaming 4K sans lag)",
        qosNormal: "Normale (Navigation web, réseaux sociaux)",
        qosLow: "Basse (Téléchargements en arrière-plan)",
        parentalLabel: "Contrôle parental (bloquer contenu sensible)",
        pauseToggleLabel: "Couper temporairement Internet pour cet appareil",
        saveBtn: "Enregistrer",
        radarTitle: "Radar du routeur",
        radarScanning: "Recherche des nouveaux appareils Wi-Fi...",
        radarFoundTitle: "Nouvel appareil détecté !",
        radarAddBtn: "Autoriser et ajouter à la maison",
        vpnSectionBadge: "Accès à distance",
        vpnSectionTitle: "Connexion sécurisée à la maison",
        vpnDesc: "Connectez-vous à votre réseau domestique depuis n'importe où (café, 5G, vacances).",
        vpnStatusConnected: "Connecté à la maison",
        vpnStatusDisconnected: "Déconnecté",
        vpnBtnDisconnect: "DÉCONNECTER LE VPN",
        vpnBtnConnect: "SE CONNECTER À LA MAISON",
        virtualIpLabel: "IP Virtuelle :",
        pingLabel: "Ping maison :",
        encryptionLabel: "Chiffrement :",
        qrCodeBtn: "Afficher le QR code pour mon téléphone",
        chartTitle: "Vitesse du trafic en direct (Mb/s)",
        chartLive: "FLUX EN DIRECT",
        dnsSectionBadge: "Filtre DNS & Protection",
        dnsSectionTitle: "Bouclier intelligent de la maison",
        dnsDesc: "Bloque les pubs et les sites suspects pour TOUS vos appareils sans rien installer.",
        dnsProviderLabel: "Fournisseur DNS actif :",
        shieldAdblockTitle: "Bloqueur de publicités",
        shieldAdblockDesc: "Supprime les bannières, pop-ups et vidéos de pub",
        shieldMalwareTitle: "Protection contre les virus & arnaques",
        shieldMalwareDesc: "Bloque les faux sites bancaires et liens piégés",
        shieldDohTitle: "Chiffrement DNS (DoH)",
        shieldDohDesc: "Empêche votre opérateur de voir vos sites visités",
        shieldParentalTitle: "Mode Famille / Contrôle parental",
        shieldParentalDesc: "Filtre les contenus inappropriés pour les jeunes",
        statQueries: "Requêtes :",
        statBlocked: "Pubs bloquées :",
        statThreats: "Arnaques :",
        dnsLogTitle: "Journal des requêtes en direct",
        dnsLogFilterAll: "Toutes les requêtes",
        dnsLogFilterBlocked: "Bloquées uniquement",
        dnsLogFilterAllowed: "Autorisées uniquement",
        toastAttackTitle: "⚠️ Arnaque bloquée !",
        toastAttackDesc: "HomeGuard a neutralisé une tentative de connexion suspecte.",
        toastResetTitle: "Paramètres réinitialisés",
        toastResetDesc: "Les valeurs ont été remises à zéro.",
        toastPauseOn: "Internet mis en pause",
        toastPauseOff: "Internet réactivé",
        toastVpnOn: "VPN connecté à la maison",
        toastVpnOff: "VPN déconnecté",
        toastSaved: "Modifications enregistrées"
      }
    };

    function t(key) {
      const dict = i18n[state.lang] || i18n.ru || i18n.fr;
      return dict[key] || (i18n.ru && i18n.ru[key]) || key;
    }

    // AI News Database
    const newsArticles = [
      {
        id: 1,
        category: "ai",
        sourceName: "The Verge",
        sourceUrl: "https://www.theverge.com",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
        time: "10 min",
        titles: {
          fr: "Nouvelle génération d'IA vocale : les assistants deviennent ultra-réalistes",
          en: "Next-gen voice AI: assistants are becoming astonishingly human",
          de: "Neue Sprach-KI-Generation: Assistenten klingen verblüffend menschlich"
        },
        summaries: {
          fr: "Les derniers modèles multimodaux permettent désormais de converser avec une fluidité bluffante, sans aucun délai et avec la gestion des émotions.",
          en: "The latest multimodal models allow seamless real-time conversations without perceptible latency, expressing nuanced emotion.",
          de: "Neueste multimodale Modelle ermöglichen flüssige Echtzeitgespräche ohne Verzögerung – inklusive Erkennung von Emotionen."
        }
      },
      {
        id: 2,
        category: "gaming",
        sourceName: "IGN France",
        sourceUrl: "https://fr.ign.com",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        time: "45 min",
        titles: {
          fr: "GTA VI et le futur des mondes ouverts : les détails techniques dévoilés",
          en: "GTA VI & the future of open worlds: new technical breakthroughs revealed",
          de: "GTA VI & die Zukunft offener Welten: neue technische Details enthüllt"
        },
        summaries: {
          fr: "Une physique de foule révolutionnaire et une densité graphique jamais vue sur console de salon. Analyse de l'impact sur les réseaux.",
          en: "Revolutionary crowd physics and unprecedented visual fidelity on home consoles. Exploring next-gen multiplayer bandwidth.",
          de: "Revolutionäre Physik und enorme Grafikdichte auf Heimkonsolen. Was das für moderne Heimnetzwerke bedeutet."
        }
      },
      {
        id: 3,
        category: "science",
        sourceName: "Futura Sciences",
        sourceUrl: "https://www.futura-sciences.com",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        time: "2h",
        titles: {
          fr: "James Webb découvre une exoplanète potentiellement couverte d'océans",
          en: "James Webb Telescope spots an exoplanet that could be covered in oceans",
          de: "James-Webb-Teleskop entdeckt Exoplanet mit möglichem Ozean"
        },
        summaries: {
          fr: "L'analyse spectrale révèle des traces de vapeur d'eau et de molécules carbonées dans l'atmosphère d'une planète à 120 années-lumière.",
          en: "Atmospheric spectroscopy shows evidence of water vapor and carbon molecules on an exoplanet 120 light-years away.",
          de: "Spektralanalysen deuten auf Wasserdampf und Kohlenstoffmoleküle in der Atmosphäre eines 120 Lichtjahre entfernten Planeten hin."
        }
      },
      {
        id: 4,
        category: "lifestyle",
        sourceName: "Frandroid",
        sourceUrl: "https://www.frandroid.com",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
        time: "3h",
        titles: {
          fr: "Smartphones pliables 2026 : la fin des écrans rigides ?",
          en: "Foldable smartphones 2026: are rigid displays becoming obsolete?",
          de: "Faltbare Smartphones 2026: Werden klassische Displays überflüssig?"
        },
        summaries: {
          fr: "Pliure invisible, batterie 2 jours et étanchéité totale : les nouveaux modèles attirent massivement les 18-35 ans.",
          en: "Invisible creases, 2-day battery life, and true water resistance: foldables are rapidly winning over young users.",
          de: "Unsichtbare Falz, 2 Tage Akkulaufzeit und Wasserdichtigkeit: Klapphandys boomen bei der jüngeren Generation."
        }
      },
      {
        id: 5,
        category: "security",
        sourceName: "Le Monde Informatique",
        sourceUrl: "https://www.lemondeinformatique.fr",
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        time: "5h",
        titles: {
          fr: "Piratage de comptes Instagram et TikTok : comment blinder vos accès",
          en: "Instagram & TikTok account hijacking: how to lock down your logins",
          de: "Instagram- & TikTok-Hackwellen: So sichern Sie Ihre Accounts ab"
        },
        summaries: {
          fr: "Les attaques par hameçonnage ciblent les stories et les messages directs. L'activation du bouclier DNS bloque les faux liens en amont.",
          en: "Phishing campaigns targeting DMs are on the rise. Combined DNS protection stops these attacks automatically before you click.",
          de: "Gezielte Phishing-Angriffe über Direktnachrichten nehmen zu. Wie DNS-Filter Betrugsversuche proaktiv stoppen."
        }
      }
    ];

    // Devices Database
    const devicesList = [
      { id: 1, name: "MacBook de Lucas", category: "computers", icon: "laptop", ip: "192.168.1.102", mac: "F4:D4:88:51:7A:1C", connection: "Wi-Fi 6", dataToday: "14.2 GB", paused: false, qos: "high", parental: false, vendor: "Apple", location: "Bureau" },
      { id: 2, name: "iPhone 15 de Léa", category: "mobile", icon: "smartphone", ip: "192.168.1.105", mac: "BC:D1:1F:90:3E:44", connection: "Wi-Fi 6", dataToday: "3.8 GB", paused: false, qos: "normal", parental: false, vendor: "Apple", location: "Chambre" },
      { id: 3, name: "PlayStation 5", category: "media", icon: "gamepad", ip: "192.168.1.115", mac: "00:D9:D1:3F:89:12", connection: "Ethernet 1 Gb/s", dataToday: "42.1 GB", paused: false, qos: "high", parental: false, vendor: "Sony", location: "Salon" },
      { id: 4, name: "Smart TV Salon (4K)", category: "media", icon: "tv", ip: "192.168.1.110", mac: "48:44:F7:62:D8:AA", connection: "Wi-Fi 5 GHz", dataToday: "18.4 GB", paused: false, qos: "normal", parental: true, vendor: "Samsung", location: "Salon" },
      { id: 5, name: "Nintendo Switch OLED", category: "media", icon: "gamepad", ip: "192.168.1.120", mac: "74:DE:2B:99:14:02", connection: "Wi-Fi 5 GHz", dataToday: "5.2 GB", paused: false, qos: "high", parental: false, vendor: "Nintendo", location: "Salon" },
      { id: 6, name: "Aspirateur Roborock", category: "iot", icon: "bot", ip: "192.168.1.140", mac: "50:EC:50:88:99:A1", connection: "Wi-Fi 2.4 GHz", dataToday: "120 MB", paused: false, qos: "low", parental: false, vendor: "Roborock", location: "Couloir" },
      { id: 7, name: "Lumières Philips Hue", category: "iot", icon: "hub", ip: "192.168.1.142", mac: "00:17:88:6A:B4:90", connection: "Hub LAN", dataToday: "45 MB", paused: false, qos: "low", parental: false, vendor: "Philips", location: "Entrée" },
      { id: 8, name: "Caméra Extérieure", category: "iot", icon: "camera", ip: "192.168.1.148", mac: "8C:85:80:41:23:EE", connection: "Wi-Fi 2.4 GHz", dataToday: "7.6 GB", paused: false, qos: "normal", parental: false, vendor: "Eufy", location: "Jardin" },
      { id: 9, name: "Smartphone Invité", category: "guest", icon: "smartphone", ip: "192.168.2.55", mac: "70:BB:E9:71:02:5A", connection: "Wi-Fi Invité", dataToday: "890 MB", paused: false, qos: "low", parental: true, vendor: "OnePlus", location: "Salon" }
    ];

    // DNS Log Database
    const dnsLogList = [
      { id: 1, domain: "gateway.icloud.com", client: "iPhone 15 de Léa", time: "12:30", status: "allowed", reason: "Service Cloud Apple" },
      { id: 2, domain: "telemetry.samsung.com", client: "Smart TV Salon", time: "12:28", status: "blocked", reason: "Traceur publicitaire" },
      { id: 3, domain: "api.roborock.com", client: "Aspirateur Roborock", time: "12:25", status: "allowed", reason: "Mise à jour statut" },
      { id: 4, domain: "ads.tiktokcdn.com", client: "iPhone 15 de Léa", time: "12:22", status: "blocked", reason: "Publicité mobile" },
      { id: 5, domain: "secure-banque-verify.top", client: "Smartphone Invité", time: "12:18", status: "threat", reason: "Faux site / Phishing" },
      { id: 6, domain: "prod.telemetry.playstation.net", client: "PlayStation 5", time: "12:10", status: "allowed", reason: "PlayStation Network" }
    ];

    state.articles = [...newsArticles];
    state.devices = [...devicesList];
    state.dnsQueries = [...dnsLogList];

    // Standalone SVG Icons helper
    function getDeviceIcon(type) {
      if (type === 'laptop') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"/></svg>';
      }
      if (type === 'smartphone') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>';
      }
      if (type === 'tv') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"/></svg>';
      }
      if (type === 'gamepad') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a5 5 0 01-5.84 0M6.5 10.5h.01M9 10.5h.01M15 10.5h.01M17.5 10.5h.01M6.75 6.75h10.5a3.75 3.75 0 013.75 3.75v3.75a3.75 3.75 0 01-3.75 3.75H6.75A3.75 3.75 0 013 14.25v-3.75a3.75 3.75 0 013.75-3.75z"/></svg>';
      }
      if (type === 'camera') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/></svg>';
      }
      return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>';
    }

    // Toast Notification
    function showToast(title, message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast glass-panel p-3.5 rounded-2xl flex items-start gap-3 shadow-2xl border';

      let borderColor = 'border-sky-500/40';
      let iconColor = 'text-sky-400';
      if (type === 'success') { borderColor = 'border-emerald-500/40'; iconColor = 'text-emerald-400'; }
      if (type === 'warning') { borderColor = 'border-amber-500/40'; iconColor = 'text-amber-400'; }
      if (type === 'danger') { borderColor = 'border-rose-500/40'; iconColor = 'text-rose-400'; }

      toast.classList.add(borderColor);
      toast.innerHTML = `
        <div class="mt-0.5 ${iconColor} shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <h5 class="text-sm font-bold text-white leading-snug">${title}</h5>
          <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</p>
        </div>
      `;

      container.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }

    // Set Language via Dropdown List
    function setLanguage(lang) {
      if (!i18n[lang]) return;
      state.lang = lang;

      const langSelect = document.getElementById('lang-select');
      if (langSelect) {
        langSelect.value = lang;
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key && t(key)) el.textContent = t(key);
      });

      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (key && t(key)) el.placeholder = t(key);
      });

      renderCategoryPills();
      renderNews();
      renderDevices();
      updateVpnUI();
      renderDnsLog();
      updateNetworkAnalytics();
    }

    // Tab Switching
    function switchTab(tabId) {
      state.currentTab = tabId;

      // Update Desktop & Mobile tab styles
      document.querySelectorAll('.nav-tab').forEach(tab => {
        const active = tab.dataset.tab === tabId;
        const isMobile = tab.classList.contains('mobile-tab');

        if (isMobile) {
          if (active) {
            tab.className = 'nav-tab mobile-tab flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-sky-400 bg-sky-500/15 font-bold';
          } else {
            tab.className = 'nav-tab mobile-tab flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-400 font-medium';
          }
        } else {
          // Desktop Nav Tab
          if (active) {
            tab.className = 'nav-tab desktop-tab px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm';
          } else {
            tab.className = 'nav-tab desktop-tab px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all text-slate-400 border border-transparent hover:text-white hover:bg-slate-800/40';
          }
        }
      });

      // Update Tab Content Sections
      document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `tab-${tabId}`) {
          content.classList.add('active');
          content.style.display = 'block';
        } else {
          content.classList.remove('active');
          content.style.display = 'none';
        }
      });

      // Show delete category button ONLY on news tab
      const delCategoryBtn = document.getElementById('delete-category-news-btn');
      if (delCategoryBtn) {
        delCategoryBtn.style.display = (tabId === 'news') ? 'inline-flex' : 'none';
      }

      if (tabId === 'vpn') {
        setTimeout(renderCanvasChart, 50);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

                // ==========================================
    // AI NEWS & DYNAMIC CATEGORIES LOGIC
    // ==========================================
    state.selectedLanguage = 'all';

    const THEMATIC_IMAGES = {
      csgo: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
      ],
      ukraine: [
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
      ],
      linux: [
        'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
      ],
      dev: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
      ],
      ai: [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
      ],
      security: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80'
      ],
      swiss: [
        'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
      ],
      tech: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80'
      ]
    };

    function cleanText(text) {
      if (!text) return '';
      return text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/\*\*|__/g, '')
        .replace(/\*|_/g, '')
        // Strip emojis, pictographs, flags (surrogate pairs) and symbols
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF\u2190-\u21FF\u2300-\u23FF\uFE00-\uFE0F\u200D\u200B-\u200F]/g, '')
        // Strip country code prefixes (FR, TR, UA, EU, etc.)
        .replace(/^(?:FR|TR|UA|EU|RU|DK|BR|US|DE|PL|KZ|NA|SA)\s+/i, '')
        .replace(/\b(?:eu|ua|fr|tr|ru|dk|br|us)\s+(vitality|navi|spirit|astralis|furia|faze|mouz|falcons|g2|virtus\.pro|heroic|liquid|complexity|mongolz|aurora|xantares|zywoo|s1mple|donk|m0nesy)\b/gi, '$1')
        .replace(/\s+это$/i, '')
        .replace(/^[ \t\-\:\,\.\!\?\|—–«»\"]+/, '')
        .replace(/[ \t\-\:\,\|—–«»\"]+$/, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function normalizeCategory(rawCat, item) {
      if (item) {
        const s = ((item.source || '') + ' ' + (item.source_url || '') + ' ' + (item.url || '')).toLowerCase();
        const t = (item.title || '').toLowerCase();
        if (s.includes('marca') || s.includes('primera') || s.includes('sportsru') || s.includes('fabrizio') || s.includes('terrikon') || s.includes('uefa') ||
            t.includes('месси') || t.includes('messi') || t.includes('барселона') || t.includes('barcelona') || t.includes('интер майами') || t.includes('ла лига') || t.includes('лига чемпионов') || t.includes('лига наций') || t.includes('лига европы')) {
          return 'Футбол';
        }
        if (s.includes('rtsinfo') || s.includes('rtsarchives') || s.includes('blick_media') || s.includes('20minutesonline') || s.includes('instagram')) {
          return 'Swiss';
        }
        if (s.includes('csgo') || s.includes('cs3') || s.includes('clashroyalepin') || s.includes('clashroyale') || s.includes('hltv') ||
            t.includes('cs2') || t.includes('cs:go') || t.includes('starladder') || t.includes('vitality') || t.includes('navi') || t.includes('s1mple') || t.includes('m0nesy') || t.includes('donk') || t.includes('clash royale') || t.includes('bcgame') || t.includes('fut')) {
          return 'CS2';
        }
        if (s.includes('novynaukr') || s.includes('novyna_ukr')) {
          return 'Украина';
        }
      }
      if (!rawCat) return 'IT';
      let c = cleanText(rawCat);
      c = c.replace(/^Категория\s*[\(:]?/i, '').replace(/[\)]+$/g, '').trim();

      const lower = c.toLowerCase();
      if (lower.includes('футбол') || lower.includes('football') || lower.includes('soccer') || lower.includes('laliga') || lower.includes('ла лига')) {
        return 'Футбол';
      }
      if (lower.includes('formula 1') || lower.includes('formula1') || lower.includes(' f1') || lower.startsWith('f1') || lower.includes('формула 1') || lower.includes('формула-1') || lower.includes('red bull')) {
        return 'F1';
      }
      if (lower.includes('swiss') || lower.includes('швейцар')) {
        return 'Swiss';
      }
      if (lower.includes('gaming') || lower.includes('игры') || lower.includes('sport') || lower.includes('киберспорт') || lower.includes('csgo') || lower.includes('navi') || lower.includes('vitality') || lower.includes('starladder') || lower.includes('cs2')) {
        return 'CS2';
      }
      if (lower.includes('украин') || lower.includes('україна') || lower.includes('ukraine') || lower.includes('novynaukr')) {
        return 'Украина';
      }

      const map = {
        'футбол': 'Футбол',
        'football': 'Футбол',
        'soccer': 'Футбол',
        'f1': 'F1',
        'formula 1': 'F1',
        'формула 1': 'F1',
        'swiss': 'Swiss',
        'швейцария': 'Swiss',
        'it': 'IT',
        'it & аналитика': 'IT',
        'it-аналитик': 'IT',
        'it аналитик': 'IT',
        'development': 'IT',
        'dev': 'IT',
        'programming': 'IT',
        'разработка': 'IT',
        'языки программирования': 'IT',
        'linux': 'DevOps & Linux',
        'linux & infrastructure': 'DevOps & Linux',
        'devops & linux': 'DevOps & Linux',
        'devops': 'DevOps & Linux',
        'gaming': 'CS2',
        'cs2': 'CS2',
        'игры & киберспорт': 'CS2',
        'игры и киберспорт': 'CS2',
        'ai': 'AI & Нейросети',
        'ai & нейросети': 'AI & Нейросети',
        'искусственный интеллект': 'AI & Нейросети',
        'нейросети': 'AI & Нейросети',
        'science': 'Наука',
        'lifestyle': 'Тренды & Стиль',
        'украина': 'Украина',
        'україна': 'Украина',
        'ukraine': 'Украина'
      };

      if (map[lower]) return map[lower];
      if (lower.includes('linux') || lower.includes('devops') || lower.includes('opennet') || lower.includes('инфраструктур') || lower.includes('сервер')) return 'DevOps & Linux';
      if (lower.includes('ai') || lower.includes('нейро') || lower.includes('интеллект')) return 'AI & Нейросети';
      if (lower.includes('аналитик') || lower.includes('dev') || lower.includes('программир') || lower.includes('разработ') || lower.includes('it')) return 'IT';
      return 'IT';
    }

    function getCategoryEmoji(catName) {
      const c = (catName || '').toUpperCase();
      if (c.includes('ФУТБОЛ') || c.includes('FOOTBALL') || c.includes('SOCCER')) return '⚽';
      if (c.includes('F1') || c.includes('FORMULA') || c.includes('ФОРМУЛА')) return '🏎️';
      if (c.includes('SWISS') || c.includes('ШВЕЙЦАР')) return '🇨🇭';
      if (c.includes('УКРАИН') || c.includes('УКРАЇН') || c.includes('UKRAINE')) return '🇺🇦';
      if (c.includes('CS') || c.includes('GAME') || c.includes('ИГР') || c.includes('КИБЕРСПОРТ')) return '🎮';
      if (c.includes('LINUX') || c.includes('DEVOPS') || c.includes('ИНФРАСТРУКТУРА') || c.includes('СЕРВЕР')) return '🐧';
      if (c.includes('AI') || c.includes('ИИ') || c.includes('ИНТЕЛЛЕКТ') || c.includes('НЕЙРО')) return '🤖';
      if (c.includes('АНАЛИТИК') || c.includes('DEV') || c.includes('ПРОГРАММ') || c.includes('IT')) return '💻';
      if (c.includes('БЕЗОПАС') || c.includes('SEC') || c.includes('УЯЗВИМ')) return '🛡️';
      if (c.includes('СЕТЬ') || c.includes('VPN')) return '🌐';
      if (c.includes('НАУК')) return '🔬';
      return '⚡';
    }

    function getArticleImage(article, index) {
      if (article.image_url) return article.image_url;
      if (article.raw_content) {
        const match = article.raw_content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) return match[1];
        const posterMatch = article.raw_content.match(/<video[^>]+poster=["']([^"']+)["']/i);
        if (posterMatch && posterMatch[1]) return posterMatch[1];
      }

      const text = ((article.title || '') + ' ' + (article.category || '') + ' ' + (article.source || '')).toLowerCase();
      let pool = THEMATIC_IMAGES.tech;

      if (text.includes('swiss') || text.includes('швейцар') || text.includes('lausanne') || text.includes('geneve') || text.includes('vaud') || text.includes('rts') || text.includes('blick')) {
        pool = THEMATIC_IMAGES.swiss;
      } else if (text.includes('cs') || text.includes('game') || text.includes('игр')) {
        pool = THEMATIC_IMAGES.csgo;
      } else if (text.includes('украин') || text.includes('україна') || text.includes('ukraine') || text.includes('novynaukr')) {
        pool = THEMATIC_IMAGES.ukraine;
      } else if (text.includes('linux') || text.includes('opennet') || text.includes('сервер')) {
        pool = THEMATIC_IMAGES.linux;
      } else if (text.includes('безопас') || text.includes('взлом') || text.includes('cve')) {
        pool = THEMATIC_IMAGES.security;
      } else if (text.includes('ai') || text.includes('ии') || text.includes('нейро')) {
        pool = THEMATIC_IMAGES.ai;
      } else if (text.includes('dev') || text.includes('rust') || text.includes('python') || text.includes('mojo') || text.includes('код')) {
        pool = THEMATIC_IMAGES.dev;
      }

      const hash = Math.abs((article.id || 0) + (article.title ? article.title.length : index) * 7);
      return pool[hash % pool.length];
    }

    window.filterByLanguage = function(lang) {
      state.selectedLanguage = lang || 'all';
      
      // Synchronize Dropdown Select
      const dropdown = document.getElementById('language-select-dropdown');
      if (dropdown && dropdown.value !== state.selectedLanguage) {
        dropdown.value = state.selectedLanguage;
      }

      // Update UI quick buttons
      document.querySelectorAll('.lang-filter-btn').forEach(btn => {
        const blang = btn.getAttribute('data-lang');
        if (blang === state.selectedLanguage) {
          btn.className = 'lang-filter-btn px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 text-white border border-sky-400 transition-all shadow-md';
        } else {
          btn.className = 'lang-filter-btn px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all';
        }
      });

      // Highlight active Aside Card if matching
      document.querySelectorAll('.aside-lang-card').forEach(card => {
        const clang = card.getAttribute('data-lang');
        if (clang && clang === state.selectedLanguage) {
          card.classList.add('border-sky-400', 'bg-sky-950/40', 'shadow-md', 'shadow-sky-500/10');
        } else {
          card.classList.remove('border-sky-400', 'bg-sky-950/40', 'shadow-md', 'shadow-sky-500/10');
        }
      });

      renderNews();
      renderCategoryPills();
    };

    window.switchAsideTab = function(tab) {
      const bTop10 = document.getElementById('aside-block-top10');
      const bDeep = document.getElementById('aside-block-deepdive');
      const bTasks = document.getElementById('aside-block-tasks');
      const btnTop10 = document.getElementById('aside-tab-top10');
      const btnDeep = document.getElementById('aside-tab-deepdive');
      const btnTasks = document.getElementById('aside-tab-tasks');

      if (!bTop10 || !bDeep) return;

      const activeClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all bg-sky-500 text-white shadow-md flex items-center justify-center gap-1.5';
      const inactiveClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all flex items-center justify-center gap-1.5';

      if (tab === 'deepdive') {
        bTop10.style.display = 'none';
        bDeep.style.display = 'block';
        if (bTasks) bTasks.style.display = 'none';
        if (btnTop10) btnTop10.className = inactiveClass;
        if (btnDeep) btnDeep.className = activeClass;
        if (btnTasks) btnTasks.className = inactiveClass;
      } else if (tab === 'tasks') {
        bTop10.style.display = 'none';
        bDeep.style.display = 'none';
        if (bTasks) bTasks.style.display = 'block';
        if (btnTop10) btnTop10.className = inactiveClass;
        if (btnDeep) btnDeep.className = inactiveClass;
        if (btnTasks) btnTasks.className = activeClass;
        renderITQuiz();
      } else { // 'top10'
        bTop10.style.display = 'block';
        bDeep.style.display = 'none';
        if (bTasks) bTasks.style.display = 'none';
        if (btnTop10) btnTop10.className = activeClass;
        if (btnDeep) btnDeep.className = inactiveClass;
        if (btnTasks) btnTasks.className = inactiveClass;
      }
    };

    function getUltraShortSummary(article) {
      if (article.key_points && Array.isArray(article.key_points) && article.key_points.length > 0) {
        const pt = String(article.key_points[0]).replace(/^[•\-\*\s\d\.\)]+/, '').trim();
        if (pt.length >= 8 && pt.length <= 120) {
          return pt;
        }
      }

      const rawSummary = (article.summaries && article.summaries[state.lang]) || 
                         article.summary || 
                         article.short_summary || 
                         '';
      
      if (rawSummary) {
        const cleaned = cleanText(rawSummary).replace(/^[•\-\*\s\d\.\)]+/, '').trim();
        const firstSentence = cleaned.split(/[.!?]\s+/)[0].trim();
        if (firstSentence.length >= 10 && firstSentence.length <= 110) {
          return firstSentence;
        }
        const words = cleaned.split(/\s+/);
        if (words.length > 12) {
          return words.slice(0, 12).join(' ') + '...';
        }
        if (cleaned.length > 0) {
          return cleaned.slice(0, 90) + (cleaned.length > 90 ? '...' : '');
        }
      }

      if (article.why_it_matters) {
        const wClean = cleanText(article.why_it_matters).replace(/^[•\-\*\s\d\.\)]+/, '').trim();
        const wWords = wClean.split(/\s+/);
        if (wWords.length <= 12) return wClean;
        return wWords.slice(0, 12).join(' ') + '...';
      }

      return cleanText((article.titles && article.titles[state.lang]) || article.title || 'Ключевое событие');
    }

    function renderAllDigestAside(digestArticles) {
      const container = document.getElementById('all-digest-items');
      const badge = document.getElementById('all-digest-count-badge');
      if (!container) return;

      if (badge) {
        badge.textContent = `${digestArticles.length} событий`;
      }

      if (digestArticles.length === 0) {
        container.innerHTML = `
          <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400 text-xs">
            <span class="text-xl block mb-1">⚡</span>
            <span>Событий с оценкой 6.0–8.0 пока нет</span>
          </div>
        `;
        return;
      }

      container.innerHTML = digestArticles.map((article) => {
        const title = cleanText((article.titles && article.titles[state.lang]) || article.title || 'Новость');
        const sourceUrl = article.sourceUrl || article.url || article.original_url || '#';
        const sourceName = article.sourceName || article.source || 'Источник';
        const category = article._displayCategory || normalizeCategory(article.category || 'Технологии');
        const score = article.importance_score ? Number(article.importance_score).toFixed(1) : '6.5';
        const shortSummary = getUltraShortSummary(article);
        const timeStr = article.published_at 
          ? (() => {
              const d = new Date(article.published_at);
              const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
              const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
              const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
              return `${capitalizedWeekday}, ${time}`;
            })()
          : '';

        return `
          <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-all hover:bg-slate-900/60 group space-y-1.5">
            <div class="flex items-center justify-between gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <span>${getCategoryEmoji(category)}</span>
                <span class="truncate max-w-[110px]">${category}</span>
              </span>
              <div class="flex items-center gap-1.5 ml-auto">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ★ ${score}
                </span>
                ${timeStr ? `<span class="text-[10px] text-slate-400 font-mono">${timeStr}</span>` : ''}
              </div>
            </div>

            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors block leading-snug line-clamp-2">
              ${title}
            </a>

            <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-[11px] text-slate-300 leading-snug">
              <span class="text-amber-400 font-bold mr-1">⚡ В двух словах:</span>
              <span>${shortSummary}</span>
            </div>

            <div class="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/50">
              <span class="text-slate-400 truncate max-w-[140px]">${sourceName}</span>
              <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-300 hover:text-white flex items-center justify-center transition-all" title="Читать в источнике">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    // HLTV Ranking State & Handlers
    let hltvRankings = [];
    let selectedEsportsTag = 'all';

    async function loadHLTVRanking(force = false) {
      const statusEl = document.getElementById('hltv-updated-date');
      const container = document.getElementById('esports-teams-list');
      const refreshIcon = document.getElementById('hltv-refresh-icon');
      if (!container) return;

      if (refreshIcon && force) refreshIcon.classList.add('animate-spin');
      if (statusEl && force) statusEl.textContent = 'Обновление...';

      try {
        const resp = await fetch('/api/hltv/ranking' + (force ? '?force=true' : ''));
        if (!resp.ok) throw new Error('API error ' + resp.status);
        const data = await resp.json();
        hltvRankings = data.teams || [];

        if (statusEl) {
          statusEl.textContent = data.date ? `Valve: ${data.date}` : (data.updated_at || 'Актуально');
        }

        if (data.url) {
          document.querySelectorAll('.hltv-official-link').forEach(el => el.href = data.url);
        }

        renderHLTVRankings();
      } catch (err) {
        console.error('Failed to load HLTV ranking:', err);
        if (statusEl) statusEl.textContent = 'Срез: 20 Сентября 2026';
      } finally {
        if (refreshIcon) refreshIcon.classList.remove('animate-spin');
      }
    }

    function renderHLTVRankings() {
      const container = document.getElementById('esports-teams-list');
      if (!container) return;

      if (!hltvRankings || hltvRankings.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Загрузка рейтинга Valve...</div>`;
        return;
      }

      const maxPoints = Math.max(...hltvRankings.map(t => Number(t.points) || 1), 2100);

      container.innerHTML = hltvRankings.map((team, idx) => {
        const rank = team.rank || (idx + 1);
        const points = team.points || 0;
        const pct = Math.min(100, Math.round((points / maxPoints) * 100));

        let rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">#${rank}</span>`;
        if (rank === 1) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-500 text-slate-950 border border-amber-300 shadow-sm shadow-amber-500/50">🥇</span>`;
        } else if (rank === 2) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-300 text-slate-900 border border-white shadow-sm">🥈</span>`;
        } else if (rank === 3) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-700 text-amber-100 border border-amber-600 shadow-sm">🥉</span>`;
        }

        const logoHtml = team.logo
          ? `<img src="${team.logo}" alt="${team.name}" class="w-4 h-4 object-contain shrink-0" onerror="this.style.display='none'" />`
          : '';

        const regionHtml = team.region
          ? `<span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80 shrink-0">${team.region}</span>`
          : '';

        const isSelected = selectedEsportsTag && selectedEsportsTag.toLowerCase() === team.name.toLowerCase();
        const cardClass = isSelected
          ? 'bg-sky-500/25 border-sky-400 shadow-md shadow-sky-500/20'
          : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/60';

        return `
          <div onclick="filterEsportsByTeam('${team.name.replace(/'/g, "\\'")}')" 
               class="p-2.5 rounded-2xl border transition-all cursor-pointer group ${cardClass}">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                ${rankBadge}
                ${logoHtml}
                <span class="text-xs font-bold text-white group-hover:text-amber-300 truncate">${team.name}</span>
                ${regionHtml}
              </div>
              <span class="text-[11px] font-mono font-bold text-amber-400 shrink-0">${points} pts</span>
            </div>
            <div class="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ${rank <= 3 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-sky-400'}" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    window.filterEsportsByTeam = function(teamName) {
      if (selectedEsportsTag && selectedEsportsTag.toLowerCase() === teamName.toLowerCase()) {
        selectedEsportsTag = 'all';
      } else {
        selectedEsportsTag = teamName;
      }
      renderHLTVRankings();
      renderNews();
    };

    window.filterEsportsByTag = function(tag) {
      selectedEsportsTag = tag;
      renderHLTVRankings();
      renderNews();
    };

    let selectedUkraineTag = 'all';

    window.filterUkraineByTag = function(tag) {
      if (selectedUkraineTag && selectedUkraineTag.toLowerCase() === tag.toLowerCase() && tag !== 'all') {
        selectedUkraineTag = 'all';
      } else {
        selectedUkraineTag = tag;
      }

      // Update chip styling in aside
      document.querySelectorAll('.ukraine-chip').forEach(btn => {
        const chipTag = (btn.getAttribute('data-ukr-tag') || '').toLowerCase();
        if (chipTag === selectedUkraineTag.toLowerCase()) {
          btn.className = 'ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20';
        } else {
          btn.className = 'ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30';
        }
      });

      renderNews();
    };

    let lastUkraineSummaryFetch = 0;
    async function loadUkraineAttacksSummary(force = false) {
      const now = Date.now();
      if (!force && (now - lastUkraineSummaryFetch < 60000)) {
        return;
      }
      const refreshIcon = document.getElementById('ukraine-refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('animate-spin');

      try {
        const res = await fetch('/api/ukraine/attacks-summary?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          lastUkraineSummaryFetch = Date.now();

          const badgeEl = document.getElementById('attack-window-badge');
          const summaryEl = document.getElementById('attack-summary-text');
          const ballisticsEl = document.getElementById('attack-stat-ballistics');
          const dronesEl = document.getElementById('attack-stat-drones');
          const pvoEl = document.getElementById('attack-stat-pvo');
          const listEl = document.getElementById('ukraine-signals-list');

          if (badgeEl) {
            badgeEl.textContent = data.attack_window || 'За последние 24ч';
          }
          if (summaryEl) {
            summaryEl.textContent = data.summary_text || 'Оперативная обстановка стабильная.';
          }
          if (ballisticsEl) {
            const bCount = (data.stats && ((data.stats.ballistics_signals || 0) + (data.stats.missiles_signals || 0))) || 0;
            ballisticsEl.textContent = bCount;
          }
          if (dronesEl) {
            dronesEl.textContent = (data.stats && data.stats.drones_signals) || 0;
          }
          if (pvoEl) {
            pvoEl.textContent = (data.stats && data.stats.air_defense_signals) || 0;
          }

          if (listEl) {
            if (data.recent_signals && data.recent_signals.length > 0) {
              listEl.innerHTML = data.recent_signals.map(sig => {
                const sTitle = cleanText(sig.title || sig.summary || 'Оперативный сигнал');
                const sTime = sig.time || 'Сегодня';
                const sUrl = sig.url || 'https://t.me/NovynaUKR';
                return `
                  <a href="${sUrl}" target="_blank" rel="noopener noreferrer" class="block p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-sky-500/30 transition-all text-xs group">
                    <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span class="font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">${sTime}</span>
                      <span class="text-sky-400 group-hover:underline flex items-center gap-0.5">В канал ↗</span>
                    </div>
                    <div class="text-slate-200 line-clamp-2 leading-relaxed text-[11px] group-hover:text-white font-medium">${sTitle}</div>
                  </a>
                `;
              }).join('');
            } else {
              listEl.innerHTML = `
                <div class="p-3 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800/60">
                  <span>За последние 24 часа активных сигналов атак не зафиксировано</span>
                </div>
              `;
            }
          }
        }
      } catch (err) {
        console.warn('Ошибка загрузки сводки атак Украины:', err);
      } finally {
        if (refreshIcon) {
          setTimeout(() => refreshIcon.classList.remove('animate-spin'), 400);
        }
      }
    }
    window.loadUkraineAttacksSummary = loadUkraineAttacksSummary;
 
    // ==========================================
    // F1 2026 STANDINGS & RACES RESULTS LOGIC
    // ==========================================
    let f1ResultsData = null;
    let selectedF1Tag = 'all';
    let activeF1Tab = 'drivers';
    let lastF1ResultsFetch = 0;

    async function loadF1Results(force = false) {
      const statusEl = document.getElementById('f1-updated-date');
      const driversContainer = document.getElementById('f1-block-drivers');
      const racesContainer = document.getElementById('f1-block-races');
      const refreshIcon = document.getElementById('f1-refresh-icon');

      const now = Date.now();
      if (!force && f1ResultsData && (now - lastF1ResultsFetch < 60000)) {
        renderF1Results();
        return;
      }

      if (refreshIcon && force) refreshIcon.classList.add('animate-spin');
      if (statusEl && force) statusEl.textContent = 'Обновление...';

      try {
        const resp = await fetch('/api/f1/results' + (force ? '?force=true' : ''));
        if (!resp.ok) throw new Error('API error ' + resp.status);
        const data = await resp.json();
        f1ResultsData = data;
        lastF1ResultsFetch = Date.now();

        if (statusEl) {
          statusEl.textContent = data.season ? `Сезон ${data.season}` : '2026';
        }

        renderF1Results();
      } catch (err) {
        console.error('Failed to load F1 results:', err);
        if (driversContainer && !f1ResultsData) {
          driversContainer.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/40">Ошибка загрузки зачета пилотов</div>`;
        }
        if (racesContainer && !f1ResultsData) {
          racesContainer.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/40">Ошибка загрузки календаря гонок</div>`;
        }
      } finally {
        if (refreshIcon) {
          setTimeout(() => refreshIcon.classList.remove('animate-spin'), 300);
        }
      }
    }

    function renderF1Results() {
      if (!f1ResultsData) return;
      renderF1Drivers(f1ResultsData.drivers || []);
      renderF1Races(f1ResultsData.races || []);
    }

    function renderF1Drivers(drivers) {
      const container = document.getElementById('f1-block-drivers');
      if (!container) return;

      if (!drivers || drivers.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных о зачете пилотов</div>`;
        return;
      }

      container.innerHTML = drivers.map((d, idx) => {
        const pos = d.pos || (idx + 1);
        let rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">${pos}</span>`;
        if (pos == 1) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-500 text-slate-950 border border-amber-300 shadow-sm shadow-amber-500/50">🥇</span>`;
        } else if (pos == 2) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-300 text-slate-900 border border-white shadow-sm">🥈</span>`;
        } else if (pos == 3) {
          rankBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-700 text-amber-100 border border-amber-600 shadow-sm">🥉</span>`;
        }

        const isRedBull = (d.team || '').toLowerCase().includes('red bull');
        const isVerstappen = (d.driver || '').toLowerCase().includes('verstappen');
        const isFerrari = (d.team || '').toLowerCase().includes('ferrari');
        const isHamilton = (d.driver || '').toLowerCase().includes('hamilton');
        const isLeclerc = (d.driver || '').toLowerCase().includes('leclerc');

        let cardClass = 'bg-slate-950/60 border-slate-800/80 hover:border-red-500/50 hover:bg-slate-900/60';
        if (isRedBull || isVerstappen) {
          cardClass = 'bg-red-950/20 border-red-500/40 hover:border-red-400 shadow-sm shadow-red-500/10';
        } else if (isFerrari || isLeclerc || isHamilton) {
          cardClass = 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400';
        }

        const pts = (d.points !== undefined && d.points !== null) ? d.points : ((d.pts !== undefined && d.pts !== null) ? d.pts : 0);
        const driverName = cleanText(d.driver || 'Пилот');
        const teamName = cleanText(d.team || 'Команда');
        const nationality = d.nationality ? `<span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80 shrink-0">${d.nationality}</span>` : '';

        return `
          <div class="p-2.5 rounded-2xl border transition-all ${cardClass}">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                ${rankBadge}
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>${driverName}</span>
                    ${isVerstappen ? '<span class="text-[9px] bg-red-600/30 text-red-300 border border-red-500/40 px-1 rounded font-bold">1</span>' : ''}
                  </div>
                  <div class="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span>${teamName}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                ${nationality}
                <span class="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">${pts} PTS</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderF1Races(races) {
      const container = document.getElementById('f1-block-races');
      if (!container) return;

      if (!races || races.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных о гонках сезона 2026</div>`;
        return;
      }

      container.innerHTML = races.map((r, idx) => {
        const gpName = cleanText(r.grand_prix || 'Гран-при');
        const date = r.date || '';
        const winner = cleanText(r.winner || '—');
        const team = cleanText(r.team || '—');
        const laps = r.laps ? `${r.laps} кр.` : '';
        const time = r.time || '';

        const isRedBullWinner = (team || '').toLowerCase().includes('red bull');

        return `
          <div class="p-2.5 rounded-2xl border transition-all ${isRedBullWinner ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'}">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-bold text-white flex items-center gap-1">
                <span>🏁</span> <span class="truncate">${gpName}</span>
              </span>
              <span class="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">${date}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
              <div class="min-w-0">
                <span class="text-slate-400 text-[10px]">Победитель: </span>
                <span class="font-bold ${isRedBullWinner ? 'text-red-300' : 'text-slate-200'}">${winner}</span>
                <span class="text-slate-500 text-[10px]"> (${team})</span>
              </div>
              <div class="text-right shrink-0">
                <span class="font-mono text-[10px] text-emerald-400 font-semibold">${time || laps}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    window.switchF1Tab = function(tab) {
      activeF1Tab = tab;
      const bDrivers = document.getElementById('f1-block-drivers');
      const bRaces = document.getElementById('f1-block-races');
      const tabDrivers = document.getElementById('f1-tab-drivers');
      const tabRaces = document.getElementById('f1-tab-races');

      const activeClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all bg-red-600 text-white shadow-md flex items-center justify-center gap-1.5';
      const inactiveClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-1.5';

      if (tab === 'races') {
        if (bDrivers) bDrivers.style.display = 'none';
        if (bRaces) bRaces.style.display = 'block';
        if (tabDrivers) tabDrivers.className = inactiveClass;
        if (tabRaces) tabRaces.className = activeClass;
      } else {
        if (bDrivers) bDrivers.style.display = 'block';
        if (bRaces) bRaces.style.display = 'none';
        if (tabDrivers) tabDrivers.className = activeClass;
        if (tabRaces) tabRaces.className = inactiveClass;
      }
    };

    window.filterF1ByTag = function(tag) {
      if (selectedF1Tag && selectedF1Tag.toLowerCase() === tag.toLowerCase() && tag !== 'all') {
        selectedF1Tag = 'all';
      } else {
        selectedF1Tag = tag;
      }

      document.querySelectorAll('.f1-chip').forEach(btn => {
        const chipTag = (btn.getAttribute('data-f1-tag') || '').toLowerCase();
        if (chipTag === selectedF1Tag.toLowerCase()) {
          btn.className = 'f1-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-red-600 text-white border border-red-500 shadow-md shadow-red-600/30';
        } else {
          btn.className = 'f1-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30';
        }
      });

      renderNews();
    };

    window.loadF1Results = loadF1Results;

    // ==========================================
    // FOOTBALL TOURNAMENTS & RESULTS LOGIC (Terrikon)
    // ==========================================
    let footballResultsData = {};
    let selectedFootballTag = 'all';
    let activeFootballTournament = 'laliga';
    let activeFootballView = 'standings'; // 'standings' | 'matches'
    let lastFootballResultsFetch = {};

    async function loadFootballResults(force = false) {
      const tourn = activeFootballTournament || 'laliga';
      const statusEl = document.getElementById('football-updated-date');
      const headerTitle = document.getElementById('football-header-title');
      const badgeEl = document.getElementById('football-tournament-badge');
      const sourceLink = document.getElementById('football-source-link');
      const refreshIcon = document.getElementById('football-refresh-icon');

      const now = Date.now();
      const lastFetch = lastFootballResultsFetch[tourn] || 0;
      if (!force && footballResultsData[tourn] && (now - lastFetch < 60000)) {
        renderFootballContent();
        return;
      }

      if (refreshIcon && force) refreshIcon.classList.add('animate-spin');
      if (statusEl && force) statusEl.textContent = 'Обновление...';

      try {
        const resp = await fetch(`/api/football/results?tournament=${tourn}${force ? '&force=true' : ''}`);
        if (!resp.ok) throw new Error('API error ' + resp.status);
        const data = await resp.json();
        footballResultsData[tourn] = data;
        lastFootballResultsFetch[tourn] = Date.now();

        if (statusEl) {
          statusEl.textContent = 'Live';
        }
        if (headerTitle) {
          headerTitle.textContent = `${data.flag || '⚽'} ${data.title || 'Футбол'}`;
        }
        if (badgeEl) {
          badgeEl.textContent = data.title || 'Ла Лига';
        }
        if (sourceLink && data.url) {
          sourceLink.href = data.url;
        }

        renderFootballContent();
      } catch (err) {
        console.error('Failed to load football results:', err);
        const standingsContainer = document.getElementById('football-block-standings');
        const matchesContainer = document.getElementById('football-block-matches');
        if (standingsContainer && !footballResultsData[tourn]) {
          standingsContainer.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/40">Ошибка загрузки таблицы турнира</div>`;
        }
        if (matchesContainer && !footballResultsData[tourn]) {
          matchesContainer.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/40">Ошибка загрузки матчей</div>`;
        }
      } finally {
        if (refreshIcon) {
          setTimeout(() => refreshIcon.classList.remove('animate-spin'), 300);
        }
      }
    }

    let selectedNationsTier = 'all'; // 'all' | 'A' | 'B' | 'C' | 'D'

    function renderFootballContent() {
      const tourn = activeFootballTournament || 'laliga';
      const data = footballResultsData[tourn];
      if (!data) return;

      renderFootballStandings(data);
      renderFootballMatches(data.matches || []);
    }

    function renderFootballStandings(data) {
      const container = document.getElementById('football-block-standings');
      if (!container) return;

      // Check if tournament has group tables (Nations League or multi-group)
      if (data.groups && data.groups.length > 0) {
        let groupsToRender = data.groups;
        if (activeFootballTournament === 'nations' && selectedNationsTier !== 'all') {
          const tierLetter = selectedNationsTier.toUpperCase();
          groupsToRender = data.groups.filter(g => {
            const raw = (g.group || '').toUpperCase();
            // Match Russian or Latin letters A, B, C, D
            if (tierLetter === 'A') return /[АA][1-4]/.test(raw) || raw.includes(' А') || raw.includes(' A');
            if (tierLetter === 'B') return /[ВB][1-4]/.test(raw) || raw.includes(' В') || raw.includes(' B');
            if (tierLetter === 'C') return /[СC][1-4]/.test(raw) || raw.includes(' С') || raw.includes(' C');
            if (tierLetter === 'D') return /[DД][1-4]/.test(raw) || raw.includes(' D') || raw.includes(' Д');
            return true;
          });
        }

        if (groupsToRender.length === 0) {
          container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных для выбранной лиги</div>`;
          return;
        }

        container.innerHTML = groupsToRender.map(g => `
          <div class="space-y-1.5 mb-3.5">
            <div class="text-[11px] font-bold text-emerald-300 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center justify-between shadow-sm">
              <span class="flex items-center gap-1.5">
                <span>🏆</span>
                <span>${cleanText(g.group)}</span>
              </span>
              <span class="text-[9px] text-slate-400 font-mono">Очки</span>
            </div>
            ${renderStandingsList(g.standings)}
          </div>
        `).join('');
        return;
      }

      const standings = data.standings || [];
      if (standings.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных о турнирной таблице</div>`;
        return;
      }

      container.innerHTML = renderStandingsList(standings);
    }

    window.filterNationsTier = function(tier) {
      selectedNationsTier = tier;
      ['all', 'A', 'B', 'C', 'D'].forEach(t => {
        const btn = document.getElementById(`nations-tier-${t}`);
        if (!btn) return;
        if (t === tier) {
          btn.className = 'py-1 px-1.5 rounded-lg font-bold bg-emerald-600 text-white text-center shadow-sm';
        } else {
          btn.className = 'py-1 px-1.5 rounded-lg text-slate-400 hover:text-white text-center';
        }
      });

      // Automatically switch to standings view if user was on matches view
      switchFootballView('standings');
      renderFootballContent();
    };

    function renderStandingsList(standings) {
      return standings.map((item, idx) => {
        const pos = Number(item.pos || (idx + 1));
        let posBadge = `<span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">${pos}</span>`;
        if (pos === 1) {
          posBadge = `<span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono bg-amber-500 text-slate-950 border border-amber-300 shadow-sm shadow-amber-500/50">1</span>`;
        } else if (pos <= 4) {
          posBadge = `<span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">${pos}</span>`;
        }

        const isBarca = (item.team || '').toLowerCase().includes('барселона') || (item.team || '').toLowerCase().includes('barcelona');
        const cardClass = isBarca 
          ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400 shadow-sm shadow-rose-500/10' 
          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700';

        const teamName = cleanText(item.team || 'Команда');
        const games = item.games || '0';
        const win = item.win || '0';
        const draw = item.draw || '0';
        const loss = item.loss || '0';
        const goals = item.goals || '0-0';
        const pts = item.pts || '0';
        const iconImg = item.icon ? `<img src="${item.icon}" alt="" class="w-3.5 h-2.5 object-cover rounded-sm inline-block mr-1 opacity-80" onerror="this.style.display='none'">` : '';

        return `
          <div class="p-2 rounded-2xl border transition-all ${cardClass}">
            <div class="flex items-center justify-between gap-1.5">
              <div class="flex items-center gap-1.5 min-w-0">
                ${posBadge}
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white flex items-center gap-1 truncate">
                    ${iconImg}
                    <span class="truncate ${isBarca ? 'text-amber-300' : ''}">${teamName}</span>
                    ${isBarca ? '<span class="text-[9px] bg-rose-600/30 text-rose-300 border border-rose-500/40 px-1 rounded font-bold">FCB</span>' : ''}
                  </div>
                  <div class="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>И: ${games}</span>
                    <span>В: ${win}</span>
                    <span>Н: ${draw}</span>
                    <span>П: ${loss}</span>
                    <span>Разн: ${goals}</span>
                  </div>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">${pts} О</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderFootballMatches(matches) {
      const container = document.getElementById('football-block-matches');
      if (!container) return;

      if (!matches || matches.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных о последних матчах</div>`;
        return;
      }

      container.innerHTML = matches.map(m => {
        const home = cleanText(m.home || '—');
        const score = m.score || 'vs';
        const away = cleanText(m.away || '—');
        const date = m.date || '';

        const isBarcaMatch = (home + ' ' + away).toLowerCase().includes('барселона');
        const cardClass = isBarcaMatch 
          ? 'bg-rose-950/30 border-rose-500/50' 
          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700';

        return `
          <div class="p-2.5 rounded-2xl border transition-all ${cardClass}">
            <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span class="flex items-center gap-1 font-bold text-slate-300">
                <span>⚽</span> <span>Матч</span>
              </span>
              <span class="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">${date}</span>
            </div>
            <div class="flex items-center justify-between text-xs py-1">
              <div class="w-2/5 font-semibold text-right truncate ${home.toLowerCase().includes('барселона') ? 'text-amber-300 font-bold' : 'text-white'}">
                ${home}
              </div>
              <div class="w-1/5 text-center font-mono font-black text-xs text-emerald-400 bg-slate-900/80 py-0.5 px-1.5 rounded border border-slate-800 shrink-0">
                ${score}
              </div>
              <div class="w-2/5 font-semibold text-left truncate ${away.toLowerCase().includes('барселона') ? 'text-amber-300 font-bold' : 'text-white'}">
                ${away}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    window.switchFootballTournament = function(tourn) {
      activeFootballTournament = tourn;
      
      const tourns = ['laliga', 'cl', 'el', 'nations'];
      tourns.forEach(t => {
        const btn = document.getElementById(`football-tourn-${t}`);
        if (!btn) return;
        if (t === tourn) {
          btn.className = 'py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1';
        } else {
          btn.className = 'py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-1';
        }
      });

      const tierBar = document.getElementById('nations-tier-filter-bar');
      if (tierBar) {
        tierBar.style.display = (tourn === 'nations') ? 'grid' : 'none';
      }

      loadFootballResults();
    };

    window.switchFootballView = function(view) {
      activeFootballView = view;
      const bStandings = document.getElementById('football-block-standings');
      const bMatches = document.getElementById('football-block-matches');
      const tabStandings = document.getElementById('football-subtab-standings');
      const tabMatches = document.getElementById('football-subtab-matches');

      if (view === 'matches') {
        if (bStandings) bStandings.style.display = 'none';
        if (bMatches) bMatches.style.display = 'block';
        if (tabStandings) tabStandings.className = 'px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60';
        if (tabMatches) tabMatches.className = 'px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700';
      } else {
        if (bStandings) bStandings.style.display = 'block';
        if (bMatches) bMatches.style.display = 'none';
        if (tabStandings) tabStandings.className = 'px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700';
        if (tabMatches) tabMatches.className = 'px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60';
      }
    };

    window.filterFootballByTag = function(tag) {
      if (selectedFootballTag && selectedFootballTag.toLowerCase() === tag.toLowerCase() && tag !== 'all') {
        selectedFootballTag = 'all';
      } else {
        selectedFootballTag = tag;
      }

      document.querySelectorAll('.football-chip').forEach(btn => {
        const chipTag = (btn.getAttribute('data-football-tag') || '').toLowerCase();
        if (chipTag === selectedFootballTag.toLowerCase()) {
          btn.className = 'football-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-emerald-600 text-white border border-emerald-500 shadow-md shadow-emerald-600/30';
        } else {
          btn.className = 'football-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30';
        }
      });

      renderNews();
    };

    window.loadFootballResults = loadFootballResults;

    // ==========================================
    // DELETE CURRENT CATEGORY NEWS HANDLER
    // ==========================================
    function updateDeleteCategoryBtn() {
      const btn = document.getElementById('delete-category-news-btn');
      const textSpan = document.getElementById('delete-category-btn-text');
      if (!btn || !textSpan) return;

      const activeCat = state.newsCategoryFilter || 'all';
      const isAll = (activeCat === 'all' || activeCat === 'Все');
      
      if (isAll) {
        textSpan.textContent = 'Очистить все новости';
        btn.title = 'Удалить абсолютно все новости из базы данных';
      } else {
        textSpan.textContent = `Очистить «${activeCat}»`;
        btn.title = `Удалить все новости категории «${activeCat}» из базы данных`;
      }
    }

    async function deleteCurrentCategoryNews() {
      const activeCat = state.newsCategoryFilter || 'all';
      const isAll = (activeCat === 'all' || activeCat === 'Все');
      const catLabel = isAll ? 'ВСЕ новости' : `новости категории «${activeCat}»`;

      const confirmed = window.confirm(`Вы уверены, что хотите удалить ${catLabel} из базы данных?\nЭто действие необратимо.`);
      if (!confirmed) return;

      const btn = document.getElementById('delete-category-news-btn');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'pointer-events-none');
      }

      try {
        const encodedCat = encodeURIComponent(activeCat);
        const resp = await fetch(`/api/news/category/${encodedCat}`, {
          method: 'DELETE'
        });

        if (!resp.ok) {
          throw new Error(`Ошибка сервера: ${resp.status}`);
        }

        const data = await resp.json();
        const deletedCount = data.deleted_count || 0;

        showToast(
          'Удаление завершено',
          `Удалено новостей: ${deletedCount}`,
          'success'
        );

        // Reload live news from DB
        await loadLiveNews();
      } catch (err) {
        console.error('Ошибка при удалении новостей:', err);
        showToast('Ошибка удаления', err.message || 'Не удалось удалить новости', 'danger');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('opacity-50', 'pointer-events-none');
        }
      }
    }

    window.deleteCurrentCategoryNews = deleteCurrentCategoryNews;
    window.updateDeleteCategoryBtn = updateDeleteCategoryBtn;

    const AI_QUIZ_BANK = [
      {
        question: "В чем фундаментальная разница между Temperature и Top-P при генерации текста в LLM?",
        options: [
          "Temperature масштабирует логиты вероятностей всех токенов, а Top-P динамически отсекает кумулятивный хвост",
          "Temperature задает длину ответа, а Top-P отвечает за точность грамматики",
          "Temperature используется только для картинок, а Top-P — для текста",
          "Они делают абсолютно одно и то же разными математическими формулами"
        ],
        correct: 0,
        explanation: "Temperature делит логиты на T (сглаживая или делая пикообразным распределение). Top-P (nucleus sampling) суммирует вероятности сверху вниз и берет только минимальный набор токенов с суммой >= P."
      },
      {
        question: "Какой формат квантования обеспечивает лучшее соотношение скорость/качество для моделей 7B-14B на 8–12 ГБ VRAM в Ollama?",
        options: [
          "Q4_K_M (или Q5_K_M) в формате GGUF",
          "FP16 без квантования",
          "Q1_0 экстремальное сжатие",
          "INT8 классический симметричный"
        ],
        correct: 0,
        explanation: "Метод k-quants (Q4_K_M) использует смешанную разрядность: критические слои внимания и эмбеддингов квантуются точнее, сохраняя до 99% качества FP16 при падении потребления памяти в 3.5 раза."
      },
      {
        question: "Что дает технология LoRA (Low-Rank Adaptation) при дообучении нейросетей?",
        options: [
          "Замораживает исходные веса и обучает две низкоранговые матрицы A и B, снижая VRAM на 70-80%",
          "Автоматически переводит модель на русский язык без датасета",
          "Увеличивает контекстное окно модели в 10 раз",
          "Позволяет запускать модель вообще без видеокарты"
        ],
        correct: 0,
        explanation: "LoRA факторизует матрицу дельты весов W = W0 + B*A, где ранг r обычно от 8 до 64. Это позволяет обучать лишь доли процента от общего числа параметров."
      },
      {
        question: "Что такое RoPE (Rotary Position Embedding) в современных архитектурах LLM (Llama 3, Mistral, Qwen)?",
        options: [
          "Метод позиционного кодирования через поворот векторов внимания в комплексной плоскости",
          "Система защиты от промпт-инъекций и джейлбрейков",
          "Алгоритм сжатия KV-кэша на диске",
          "Формат упаковки весов для мобильных процессоров"
        ],
        correct: 0,
        explanation: "RoPE кодирует относительное расстояние между токенами поворотом векторного пространства Q и K, обеспечивая естественное затухание внимания с расстоянием и легкое масштабирование контекста."
      },
      {
        question: "Как в архитектуре MoE (Mixture of Experts) в моделях Mixtral и DeepSeek достигается высокая скорость?",
        options: [
          "Маршрутизатор (Router) активирует только 2 эксперта из 8 на каждый отдельный токен",
          "Модель одновременно запускается на 8 серверах параллельно",
          "Все вычисления переводятся в целочисленный 1-битный формат",
          "Эксперты включаются только при ошибке основной сети"
        ],
        correct: 0,
        explanation: "В MoE общие параметры модели огромны (например, 47B), но для обработки каждого токена роутер активирует лишь top-2 FFN-блока (около 13B активных параметров), кардинально экономя вычисления."
      }
    ];

    const LINUX_QUIZ_BANK = [
      {
        question: "Какой командой мгновенно найти и завершить процесс, слушающий TCP-порт 8080?",
        options: [
          "fuser -k 8080/tcp (или kill $(lsof -t -i:8080))",
          "netstat --kill 8080",
          "systemctl kill port 8080",
          "iptables -D INPUT 8080"
        ],
        correct: 0,
        explanation: "Утилита fuser с флагом -k отправляет сигнал SIGKILL процессам, использующим порт. kill $(lsof -t -i:8080) также отлично справляется."
      },
      {
        question: "Под в Kubernetes перешёл в статус CrashLoopBackOff. Какой командой быстрее всего посмотреть логи предыдущего упавшего контейнера?",
        options: [
          "kubectl logs <pod-name> --previous",
          "kubectl describe pod <pod-name> --logs",
          "kubectl get events --crash",
          "journalctl -u k8s-pod --last"
        ],
        correct: 0,
        explanation: "Флаг --previous (или -p) указывает kubectl извлечь логи контейнера до его последнего падения/рестарта, что критично для выявления причин OOMKilled или panic."
      },
      {
        question: "Как перезапустить systemd-сервис только в том случае, если он уже запущен (не запуская выключенный)?",
        options: [
          "systemctl try-restart <service>",
          "systemctl restart --if-running <service>",
          "systemctl reload-or-restart <service>",
          "service <service> conditional-restart"
        ],
        correct: 0,
        explanation: "Команда 'systemctl try-restart' (или 'condrestart') перезапускает юнит только если он активен. Для остановленных сервисов команда ничего не делает."
      },
      {
        question: "В Docker накопилось много dangling-образов, неиспользуемых сетей и остановленных контейнеров. Как очистить всё безопасной одной командой?",
        options: [
          "docker system prune -f",
          "docker clean --all",
          "docker rm -f $(docker ps -aq)",
          "rm -rf /var/lib/docker/overlay2"
        ],
        correct: 0,
        explanation: "docker system prune очищает остановленные контейнеры, неиспользуемые сети, dangling-образы и кэш сборки без удаления именованных томов данных."
      },
      {
        question: "Диск переполнен (100% full), но rm не освобождает место: df -h всё ещё показывает 0 доступных байт. В чём причина?",
        options: [
          "Файл удалён, но удерживается открытым запущенным процессом (проверить lsof +L1)",
          "Файловая система автоматически заблокировалась в read-only",
          "Закончились дескрипторы сокетов",
          "Требуется обязательный перезапуск ядра Linux"
        ],
        correct: 0,
        explanation: "В Linux удаление файла (unlink) уменьшает счётчик ссылок. Если файл открыт процессом, блоки диска не освободятся до закрытия дескриптора или перезапуска процесса: 'lsof +L1' покажет виновника."
      },
      {
        question: "Какая команда покажет размер файлов и папок в текущей директории с сортировкой по убыванию в читаемом виде?",
        options: [
          "du -sh * | sort -hr",
          "df -h --sort=size",
          "ls -l --sort-bytes",
          "find . -size +100M"
        ],
        correct: 0,
        explanation: "du -sh * суммирует размер каждого элемента в human-readable формате, а sort -hr корректно сортирует суффиксы K, M, G в порядке убывания."
      },
      {
        question: "Как проверить корректность конфигурационных файлов Nginx без перезагрузки и простоя веб-сервера?",
        options: [
          "nginx -t",
          "systemctl check nginx",
          "nginx --verify-config",
          "cat /etc/nginx/nginx.conf | test"
        ],
        correct: 0,
        explanation: "Команда 'nginx -t' проверяет синтаксис всех подключенных директив и выводит [ok] / [successful] либо точный номер строки с ошибкой."
      },
      {
        question: "Какая современная утилита в Linux заменяет устаревший netstat для быстрого просмотра слушающих сокетов?",
        options: [
          "ss -tulpn",
          "sockstat -a",
          "ip route show all",
          "portstat -l"
        ],
        correct: 0,
        explanation: "Утилита ss (Socket Statistics) читает данные напрямую из пространства ядра через netlink, работая в разы быстрее netstat."
      },
      {
        question: "Как просмотреть события ядра в реальном времени, включая OOM-killer и сбои драйверов?",
        options: [
          "dmesg -wH",
          "tail -f /proc/kcore",
          "journalctl --kernel --nowait",
          "sysctl -a | grep error"
        ],
        correct: 0,
        explanation: "dmesg с ключами -w (follow/watch) и -H (human-readable timestamps) выводит кольцевой буфер ядра в реальном времени с читаемыми датами."
      }
    ];

    const IT_QUIZ_BANK = [
      {
        lang: "Python",
        code: `def add_item(val, lst=[]):\n    lst.append(val)\n    return lst\n\nprint(add_item(1))\nprint(add_item(2))`,
        question: "Что напечатает данный код при выполнении?",
        options: [
          "[1] затем [1, 2]",
          "[1] затем [2]",
          "[1] затем [1]",
          "TypeError: mutable default argument"
        ],
        correct: 0,
        explanation: "Дефолтный аргумент lst=[] создаётся один раз при определении функции, а не при каждом вызове. Поэтому список сохраняет состояние между вызовами."
      },
      {
        lang: "JavaScript",
        code: `console.log([] + []);\nconsole.log([] + {});`,
        question: "Каков результат обоих выражений в консоли?",
        options: [
          '"" (пустая строка) и "[object Object]"',
          '"" и undefined',
          '[] и {}',
          'NaN и NaN'
        ],
        correct: 0,
        explanation: "Оператор + приводит операнды к примитивам. [].toString() даёт \"\", а {}.toString() даёт \"[object Object]\". Результаты: \"\" и \"[object Object]\"."
      },
      {
        lang: "Go",
        code: `s := []int{1, 2, 3}\nfor _, v := range s {\n    go func() { println(v) }()\n}`,
        question: "В классическом Go (до версии 1.22) что чаще всего выведет эта программа?",
        options: [
          "3 3 3 (значение последней итерации для всех горутин)",
          "1 2 3 строго по порядку",
          "3 2 1",
          "Ошибка компиляции: variable shadow"
        ],
        correct: 0,
        explanation: "До Go 1.22 переменная v замыкалась по ссылке на одну и ту же область памяти. К моменту старта горутин цикл уже заканчивался со значением 3."
      },
      {
        lang: "Rust",
        code: `let s1 = String::from("hello");\nlet s2 = s1;\nprintln!("{}", s1);`,
        question: "Что произойдет при компиляции данного кода?",
        options: [
          "Ошибка компиляции: use of moved value `s1`",
          "Напечатает hello",
          "Напечатает пустую строку",
          "Паника в рантайме: NullPointerException"
        ],
        correct: 0,
        explanation: "При присваивании let s2 = s1 владение (ownership) перемещается в s2. Тип String не реализует трейт Copy, поэтому s1 становится невалидным."
      },
      {
        lang: "C++",
        code: `int a = 5;\nint b = a++ + ++a;\nstd::cout << b;`,
        question: "Каково поведение данного выражения согласно стандартам C++?",
        options: [
          "Undefined Behavior (UB) из-за множественной модификации без точки следования",
          "Всегда строго 12",
          "Всегда строго 11",
          "Ошибка компиляции: duplicate increment"
        ],
        correct: 0,
        explanation: "Модификация одной и той же скалярной переменной дважды в одном выражении без промежуточной точки следования (sequence point) является классическим Undefined Behavior."
      },
      {
        lang: "Python",
        code: `a = [1, 2, 3]\nb = a\na += [4]\nprint(b)`,
        question: "Что выведет print(b)?",
        options: [
          "[1, 2, 3, 4]",
          "[1, 2, 3]",
          "None",
          "[4]"
        ],
        correct: 0,
        explanation: "Для списков оператор += вызывает in-place метод __iadd__ (аналог extend), изменяя существующий объект по ссылке. b ссылается на тот же список."
      }
    ];

    // In-memory pools of questions for the session
    const AI_QUIZ_POOL = [...AI_QUIZ_BANK];
    const LINUX_QUIZ_POOL = [...LINUX_QUIZ_BANK];
    const IT_QUIZ_POOL = [...IT_QUIZ_BANK];


    let aiQuizIndex = 0;
    let linuxQuizIndex = 0;
    let itQuizIndex = 0;

    let aiQuizScore = Number(localStorage.getItem('ai_quiz_score') || 0);
    let linuxQuizScore = Number(localStorage.getItem('linux_quiz_score') || 0);
    let itQuizScore = Number(localStorage.getItem('it_quiz_score') || 0);

    // Current displayed shuffled questions
    let currentAIShuffled = null;
    let currentLinuxShuffled = null;
    let currentITShuffled = null;

    let isFetchingAIQuiz = false;
    let isFetchingLinuxQuiz = false;
    let isFetchingITQuiz = false;

    function shuffleOptions(questionObj) {
      const items = questionObj.options.map((opt, originalIdx) => ({
        text: opt,
        isCorrect: originalIdx === questionObj.correct
      }));
      // Fisher-Yates shuffle
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return {
        question: questionObj.question,
        options: items.map(it => it.text),
        correctIdx: items.findIndex(it => it.isCorrect),
        explanation: questionObj.explanation,
        lang: questionObj.lang,
        code: questionObj.code,
        is_ai_generated: questionObj.is_ai_generated
      };
    }

    async function fetchNextDynamicQuiz(category) {
      try {
        const pool = category === 'ai' ? AI_QUIZ_POOL : (category === 'linux' ? LINUX_QUIZ_POOL : IT_QUIZ_POOL);
        const excludeList = pool.slice(-6).map(q => encodeURIComponent(q.question.slice(0, 40))).join(',');
        const res = await fetch(`/api/quiz/next?category=${category}&exclude=${excludeList}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.question && Array.isArray(data.options) && data.options.length === 4) {
          const exists = pool.some(item => item.question === data.question);
          if (!exists) {
            pool.push(data);
          }
          return data;
        }
      } catch (err) {
        console.warn(`Ошибка фонового запроса задачи [${category}]:`, err);
      }
      return null;
    }

    function renderAIQuiz() {
      const baseQ = AI_QUIZ_POOL[aiQuizIndex % AI_QUIZ_POOL.length];
      currentAIShuffled = shuffleOptions(baseQ);
      const q = currentAIShuffled;

      const qEl = document.getElementById('ai-quiz-question');
      const optEl = document.getElementById('ai-quiz-options');
      const fbEl = document.getElementById('ai-quiz-feedback');
      const scoreBadge = document.getElementById('ai-quiz-score-badge');

      if (!qEl || !optEl) return;
      if (scoreBadge) scoreBadge.textContent = `Очки: ${aiQuizScore}`;
      if (fbEl) fbEl.style.display = 'none';

      qEl.textContent = q.question;
      optEl.innerHTML = q.options.map((opt, idx) => `
        <button type="button" onclick="handleAIQuizAnswer(${idx})" class="ai-opt-btn w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-xs text-slate-200 transition-all cursor-pointer">
          <div class="flex items-start gap-2">
            <span class="font-mono text-purple-400 font-bold text-[11px] shrink-0">${String.fromCharCode(65 + idx)})</span>
            <span class="flex-1">${opt}</span>
          </div>
        </button>
      `).join('');
    }

    function handleAIQuizAnswer(selectedIdx) {
      if (!currentAIShuffled) return;
      const q = currentAIShuffled;
      const btns = document.querySelectorAll('.ai-opt-btn');
      const fbEl = document.getElementById('ai-quiz-feedback');
      const scoreBadge = document.getElementById('ai-quiz-score-badge');

      btns.forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-purple-950/40', 'cursor-pointer');
        if (idx === q.correctIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 transition-all';
        } else if (idx === selectedIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 transition-all';
        } else {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 text-xs text-slate-500 opacity-60';
        }
      });

      if (fbEl) {
        fbEl.style.display = 'block';
        if (selectedIdx === q.correctIdx) {
          aiQuizScore += 10;
          localStorage.setItem('ai_quiz_score', aiQuizScore);
          if (scoreBadge) scoreBadge.textContent = `Очки: ${aiQuizScore}`;
          fbEl.className = 'p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>🎉</span><span>Верно! (+10 очков)</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        } else {
          fbEl.className = 'p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>💡</span><span>Не совсем так</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        }
      }
    }

    async function nextAIQuiz() {
      const btn = document.querySelector('button[onclick="nextAIQuiz()"]');
      if (btn) btn.classList.add('opacity-50', 'animate-spin');

      if (!isFetchingAIQuiz) {
        isFetchingAIQuiz = true;
        try {
          const freshQ = await fetchNextDynamicQuiz('ai');
          if (freshQ) {
            aiQuizIndex = AI_QUIZ_POOL.length - 1;
          } else {
            aiQuizIndex++;
          }
        } finally {
          isFetchingAIQuiz = false;
        }
      } else {
        aiQuizIndex++;
      }

      if (btn) btn.classList.remove('opacity-50', 'animate-spin');
      renderAIQuiz();
    }

    function renderLinuxQuiz() {
      const baseQ = LINUX_QUIZ_POOL[linuxQuizIndex % LINUX_QUIZ_POOL.length];
      currentLinuxShuffled = shuffleOptions(baseQ);
      const q = currentLinuxShuffled;

      const qEl = document.getElementById('linux-quiz-question');
      const optEl = document.getElementById('linux-quiz-options');
      const fbEl = document.getElementById('linux-quiz-feedback');
      const scoreBadge = document.getElementById('linux-quiz-score-badge');

      if (!qEl || !optEl) return;
      if (scoreBadge) scoreBadge.textContent = `Очки: ${linuxQuizScore}`;
      if (fbEl) fbEl.style.display = 'none';

      qEl.textContent = q.question;
      optEl.innerHTML = q.options.map((opt, idx) => `
        <button type="button" onclick="handleLinuxQuizAnswer(${idx})" class="linux-opt-btn w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-200 transition-all cursor-pointer">
          <div class="flex items-start gap-2">
            <span class="font-mono text-emerald-400 font-bold text-[11px] shrink-0">${String.fromCharCode(65 + idx)})</span>
            <span class="flex-1 font-mono text-[11px]">${opt}</span>
          </div>
        </button>
      `).join('');
    }

    function handleLinuxQuizAnswer(selectedIdx) {
      if (!currentLinuxShuffled) return;
      const q = currentLinuxShuffled;
      const btns = document.querySelectorAll('.linux-opt-btn');
      const fbEl = document.getElementById('linux-quiz-feedback');
      const scoreBadge = document.getElementById('linux-quiz-score-badge');

      btns.forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-emerald-950/40', 'cursor-pointer');
        if (idx === q.correctIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 transition-all font-mono text-[11px]';
        } else if (idx === selectedIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 transition-all font-mono text-[11px]';
        } else {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 text-xs text-slate-500 opacity-60 font-mono text-[11px]';
        }
      });

      if (fbEl) {
        fbEl.style.display = 'block';
        if (selectedIdx === q.correctIdx) {
          linuxQuizScore += 10;
          localStorage.setItem('linux_quiz_score', linuxQuizScore);
          if (scoreBadge) scoreBadge.textContent = `Очки: ${linuxQuizScore}`;
          fbEl.className = 'p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>🎉</span><span>Верно! (+10 очков)</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        } else {
          fbEl.className = 'p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>💡</span><span>Разбор команды</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        }
      }
    }

    async function nextLinuxQuiz() {
      const btn = document.querySelector('button[onclick="nextLinuxQuiz()"]');
      if (btn) btn.classList.add('opacity-50', 'animate-spin');

      if (!isFetchingLinuxQuiz) {
        isFetchingLinuxQuiz = true;
        try {
          const freshQ = await fetchNextDynamicQuiz('linux');
          if (freshQ) {
            linuxQuizIndex = LINUX_QUIZ_POOL.length - 1;
          } else {
            linuxQuizIndex++;
          }
        } finally {
          isFetchingLinuxQuiz = false;
        }
      } else {
        linuxQuizIndex++;
      }

      if (btn) btn.classList.remove('opacity-50', 'animate-spin');
      renderLinuxQuiz();
    }

    function renderITQuiz() {
      const baseQ = IT_QUIZ_POOL[itQuizIndex % IT_QUIZ_POOL.length];
      currentITShuffled = shuffleOptions(baseQ);
      const q = currentITShuffled;

      const langTag = document.getElementById('it-quiz-lang-tag');
      const codeEl = document.getElementById('it-quiz-code');
      const qEl = document.getElementById('it-quiz-question');
      const optEl = document.getElementById('it-quiz-options');
      const fbEl = document.getElementById('it-quiz-feedback');
      const scoreBadge = document.getElementById('it-quiz-score-badge');

      if (!codeEl || !qEl || !optEl) return;
      if (scoreBadge) scoreBadge.textContent = `Очки: ${itQuizScore}`;
      if (fbEl) fbEl.style.display = 'none';

      const langName = baseQ.lang || q.lang || 'Code';
      if (langTag) {
        langTag.textContent = langName;
        if (langName === 'Python') langTag.className = 'px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
        else if (langName === 'JavaScript') langTag.className = 'px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
        else if (langName === 'Go') langTag.className = 'px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
        else if (langName === 'Rust') langTag.className = 'px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40';
        else langTag.className = 'px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40';
      }

      codeEl.textContent = baseQ.code || q.code || '';
      qEl.textContent = q.question;
      optEl.innerHTML = q.options.map((opt, idx) => `
        <button type="button" onclick="handleITQuizAnswer(${idx})" class="it-opt-btn w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-200 transition-all cursor-pointer">
          <div class="flex items-start gap-2">
            <span class="font-mono text-sky-400 font-bold text-[11px] shrink-0">${String.fromCharCode(65 + idx)})</span>
            <span class="flex-1 font-mono text-[11px]">${opt}</span>
          </div>
        </button>
      `).join('');
    }

    function handleITQuizAnswer(selectedIdx) {
      if (!currentITShuffled) return;
      const q = currentITShuffled;
      const btns = document.querySelectorAll('.it-opt-btn');
      const fbEl = document.getElementById('it-quiz-feedback');
      const scoreBadge = document.getElementById('it-quiz-score-badge');

      btns.forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-sky-950/40', 'cursor-pointer');
        if (idx === q.correctIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 transition-all font-mono text-[11px]';
        } else if (idx === selectedIdx) {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 transition-all font-mono text-[11px]';
        } else {
          btn.className = 'w-full text-left p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 text-xs text-slate-500 opacity-60 font-mono text-[11px]';
        }
      });

      if (fbEl) {
        fbEl.style.display = 'block';
        if (selectedIdx === q.correctIdx) {
          itQuizScore += 10;
          localStorage.setItem('it_quiz_score', itQuizScore);
          if (scoreBadge) scoreBadge.textContent = `Очки: ${itQuizScore}`;
          fbEl.className = 'p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>🎉</span><span>Верно! (+10 очков)</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        } else {
          fbEl.className = 'p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-1';
          fbEl.innerHTML = `<div class="font-bold flex items-center gap-1.5"><span>💡</span><span>Разбор кода</span></div><div class="text-[11px] text-slate-300">${q.explanation}</div>`;
        }
      }
    }

    async function nextITQuiz() {
      const btn = document.querySelector('button[onclick="nextITQuiz()"]');
      if (btn) btn.classList.add('opacity-50', 'animate-spin');

      if (!isFetchingITQuiz) {
        isFetchingITQuiz = true;
        try {
          const freshQ = await fetchNextDynamicQuiz('it');
          if (freshQ) {
            itQuizIndex = IT_QUIZ_POOL.length - 1;
          } else {
            itQuizIndex++;
          }
        } finally {
          isFetchingITQuiz = false;
        }
      } else {
        itQuizIndex++;
      }

      if (btn) btn.classList.remove('opacity-50', 'animate-spin');
      renderITQuiz();
    }

    window.renderAIQuiz = renderAIQuiz;
    window.handleAIQuizAnswer = handleAIQuizAnswer;
    window.nextAIQuiz = nextAIQuiz;
    window.renderLinuxQuiz = renderLinuxQuiz;
    window.handleLinuxQuizAnswer = handleLinuxQuizAnswer;
    window.nextLinuxQuiz = nextLinuxQuiz;
    window.renderITQuiz = renderITQuiz;
    window.handleITQuizAnswer = handleITQuizAnswer;
    window.nextITQuiz = nextITQuiz;


    window.setDynamicCategory = function(cat) {
      state.newsCategoryFilter = (cat === 'all' || cat === 'Все') ? 'all' : cat;
      const isAll = (state.newsCategoryFilter === 'all' || state.newsCategoryFilter === 'Все' || !state.newsCategoryFilter);
      
      const isIT = !isAll && 
                   (state.newsCategoryFilter === 'IT' || 
                    state.newsCategoryFilter === 'IT & Аналитика' || 
                    state.newsCategoryFilter.toLowerCase() === 'it' ||
                    state.newsCategoryFilter.toLowerCase() === 'it & аналитика' ||
                    state.newsCategoryFilter.toLowerCase() === 'development' ||
                    state.newsCategoryFilter.toLowerCase() === 'programming' ||
                    state.newsCategoryFilter.toLowerCase() === 'разработка' ||
                    state.newsCategoryFilter.toLowerCase() === 'языки программирования');

      const isGaming = !isAll && 
                       (state.newsCategoryFilter === 'CS2' || 
                        state.newsCategoryFilter === 'Игры & Киберспорт' || 
                        state.newsCategoryFilter.toLowerCase().includes('игры') || 
                        state.newsCategoryFilter.toLowerCase().includes('киберспорт') || 
                        state.newsCategoryFilter.toLowerCase().includes('gaming') || 
                        state.newsCategoryFilter.toLowerCase().includes('cs'));

      const isUkraine = !isAll && 
                        (state.newsCategoryFilter === 'Украина' || 
                         state.newsCategoryFilter.toLowerCase().includes('украин') || 
                         state.newsCategoryFilter.toLowerCase().includes('україна') || 
                         state.newsCategoryFilter.toLowerCase().includes('ukraine'));

      const isAI = !isAll && 
                   (state.newsCategoryFilter === 'AI & Нейросети' || 
                    state.newsCategoryFilter.toLowerCase().includes('ai') || 
                    state.newsCategoryFilter.toLowerCase().includes('нейро'));

      const isLinux = !isAll && 
                      (state.newsCategoryFilter === 'DevOps & Linux' || 
                       state.newsCategoryFilter.toLowerCase().includes('devops') || 
                       state.newsCategoryFilter.toLowerCase().includes('linux'));

      const isF1 = !isAll && 
                   (state.newsCategoryFilter === 'F1' || 
                    state.newsCategoryFilter.toLowerCase() === 'f1' ||
                    state.newsCategoryFilter.toLowerCase().includes('формула') ||
                    state.newsCategoryFilter.toLowerCase().includes('formula'));

      const isFootball = !isAll && 
                         (state.newsCategoryFilter === 'Футбол' || 
                          state.newsCategoryFilter.toLowerCase() === 'футбол' ||
                          state.newsCategoryFilter.toLowerCase() === 'football' ||
                          state.newsCategoryFilter.toLowerCase().includes('футбол') ||
                          state.newsCategoryFilter.toLowerCase().includes('football'));

      const itAside = document.getElementById('programming-analytics-aside');
      const digestAside = document.getElementById('all-digest-aside');
      const esportsAside = document.getElementById('esports-hltv-aside');
      const ukraineAside = document.getElementById('ukraine-attacks-aside');
      const aiAside = document.getElementById('ai-models-aside');
      const linuxAside = document.getElementById('devops-linux-aside');
      const f1Aside = document.getElementById('f1-results-aside');
      const footballAside = document.getElementById('football-results-aside');
      const langBar = document.getElementById('language-selection-bar');
      const mainCol = document.getElementById('news-main-column');

      if (itAside) itAside.style.display = isIT ? 'block' : 'none';
      if (digestAside) digestAside.style.display = isAll ? 'block' : 'none';
      if (esportsAside) esportsAside.style.display = isGaming ? 'block' : 'none';
      if (ukraineAside) ukraineAside.style.display = isUkraine ? 'block' : 'none';
      if (aiAside) aiAside.style.display = isAI ? 'block' : 'none';
      if (linuxAside) linuxAside.style.display = isLinux ? 'block' : 'none';
      if (f1Aside) f1Aside.style.display = isF1 ? 'block' : 'none';
      if (footballAside) footballAside.style.display = isFootball ? 'block' : 'none';

      if (langBar) {
        langBar.style.display = isIT ? 'flex' : 'none';
      }
      if (mainCol) {
        if (isIT || isAll || isGaming || isUkraine || isAI || isLinux || isF1 || isFootball) {
          mainCol.className = 'order-2 lg:order-1 lg:col-span-7 xl:col-span-8 space-y-6 w-full';
        } else {
          mainCol.className = 'order-2 lg:order-1 lg:col-span-12 space-y-6 w-full';
        }
      }

      if (isGaming) {
        loadHLTVRanking();
      }
      if (isUkraine) {
        loadUkraineAttacksSummary();
      }
      if (isAI) {
        renderAIQuiz();
      }
      if (isLinux) {
        renderLinuxQuiz();
      }
      if (isIT) {
        renderITQuiz();
      }
      if (isF1) {
        loadF1Results();
      }
      if (isFootball) {
        loadFootballResults();
      }

      // If switching away from IT, reset language filter
      if (!isIT && state.selectedLanguage && state.selectedLanguage !== 'all') {
        state.selectedLanguage = 'all';
        const dropdown = document.getElementById('language-select-dropdown');
        if (dropdown) dropdown.value = 'all';
      }
      if (!isGaming && selectedEsportsTag !== 'all') {
        selectedEsportsTag = 'all';
      }
      if (!isUkraine && selectedUkraineTag !== 'all') {
        selectedUkraineTag = 'all';
      }
      if (!isF1 && selectedF1Tag !== 'all') {
        selectedF1Tag = 'all';
      }
      if (!isFootball && selectedFootballTag !== 'all') {
        selectedFootballTag = 'all';
      }

      renderCategoryPills();
      renderNews();
      updateDeleteCategoryBtn();
    };

    function isArticleEligibleForDisplay(item, targetCategory, targetLang) {
      // Completely exclude security / cybersecurity articles and unwanted general tech
      const rawCat = (item.category || '').toLowerCase();
      const itemCat = (item._displayCategory || normalizeCategory(item.category, item)).toLowerCase();
      const rawTitle = (item.title || '').toLowerCase();
      if (itemCat.includes('безопас') || itemCat.includes('cybersec') || itemCat.includes('security') ||
          rawCat.includes('безопас') || rawCat.includes('cybersec') || rawCat.includes('security') ||
          rawTitle.includes('уязвим') || rawTitle.includes('cve-') ||
          itemCat.includes('общие') || itemCat.includes('технологии') || itemCat.includes('general tech') || itemCat.includes('technology')) {
        return false;
      }
      if (targetCategory && (targetCategory.toLowerCase().includes('безопас') || targetCategory.toLowerCase().includes('security') || targetCategory.toLowerCase().includes('cybersec') || targetCategory.toLowerCase().includes('общие') || targetCategory.toLowerCase().includes('general tech'))) {
        return false;
      }

      const score = item.importance_score ? Number(item.importance_score) : 0;

      // Strict user constraint: News below 5.1 are not interesting
      if (score < 5.1) {
        return false;
      }

      // Safeguard: Never display untranslated Ukrainian content in the news feed
      const rawSummary = (item.summaries && item.summaries[state.lang]) || item.summary || '';
      if (/[ієїґІЄЇҐ]/.test(item.title || '') || /[ієїґІЄЇҐ]/.test(rawSummary)) {
        return false;
      }

      // Require a valid AI summary
      const hasSummary = Boolean((item.summaries && item.summaries[state.lang]) || item.summary);
      if (!hasSummary) {
        return false;
      }

      const isAll = (!targetCategory || targetCategory === 'all' || targetCategory === 'Все');

      // 1. "Все" category: only score >= 8.0 in the main feed (suppress operational micro-alerts)
      if (isAll) {
        if (item.is_operational_alert) return false;
        return score >= 8.0;
      }

      const targetCatLower = targetCategory.toLowerCase();

      // 2. Must match target category
      if (itemCat !== targetCatLower) {
        return false;
      }

      // 3. Strict Source Filter & Minimum Quality for Games & CS2:
      // Only allow: t.me/newcsgo, t.me/cs3news, t.me/ClashRoyalePin, https://www.hltv.org/
      const isGamingCategory = targetCatLower === 'cs2' || targetCatLower.includes('игры') || targetCatLower.includes('киберспорт') || targetCatLower.includes('gaming');
      if (isGamingCategory) {
        // Enforce minimum score of 7.0 (filter out low-effort posts, memes, and sarcasm)
        if (score < 7.0) return false;

        const sourceCombined = ((item.source || '') + ' ' + (item.source_url || '') + ' ' + (item.url || '')).toLowerCase();
        const isAllowedChannel = ['newcsgo', 'cs3news', 'clashroyalepin', 'clashroyale', 'hltv'].some(s => sourceCombined.includes(s));
        if (!isAllowedChannel) {
          return false;
        }

        // Sub-filter by team or priority tag
        if (selectedEsportsTag && selectedEsportsTag !== 'all') {
          const fullText = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.why_it_matters || '') + ' ' + (item.source || '')).toLowerCase();
          const tag = selectedEsportsTag.toLowerCase();
          if (tag === 's1mple' || tag === 'simple') {
            if (!fullText.includes('s1mple') && !fullText.includes('simple')) return false;
          } else if (tag === 'bcgame') {
            if (!fullText.includes('bcgame') && !fullText.includes('bc.game')) return false;
          } else if (tag === 'navi') {
            if (!fullText.includes('navi') && !fullText.includes('natus vincere') && !fullText.includes('нави')) return false;
          } else if (tag === 'fut') {
            if (!fullText.includes('fut')) return false;
          } else {
            if (!fullText.includes(tag)) return false;
          }
        }
      }

      // 4. Strict Quality Filter for IT:
      const isProgCategory = (targetCatLower === 'it' ||
                              targetCatLower === 'it & аналитика' ||
                              targetCatLower === 'development' ||
                              targetCatLower === 'programming' ||
                              targetCatLower.includes('программир') ||
                              (targetCatLower.includes('аналитик') && !targetCatLower.includes('linux'))) &&
                             !targetCatLower.includes('devops') && !targetCatLower.includes('linux');
      if (isProgCategory) {
        // Exclude any gaming item that somehow reached here
        const isGamingItem = ['csgo', 'cs3', 'clashroyalepin', 'clashroyale', 'hltv'].some(s => ((item.source || '') + ' ' + (item.url || '')).toLowerCase().includes(s)) ||
                             ['cs2', 'cs:go', 'vitality', 'starladder', 'navi', 's1mple'].some(k => (item.title || '').toLowerCase().includes(k));
        if (isGamingItem) return false;

        if (score < 7.0) return false;
        const hasSummary = Boolean((item.summaries && item.summaries[state.lang]) || item.summary);
        if (!hasSummary) return false;

        // Language Sub-Filter
        if (targetLang && targetLang !== 'all') {
          const fullText = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.why_it_matters || '') + ' ' + (item.source || '')).toLowerCase();
          const target = targetLang.toLowerCase();
          
          if (target === 'python' && !fullText.includes('python') && !fullText.includes('питон') && !fullText.includes('fastapi') && !fullText.includes('django')) return false;
          if (target === 'rust' && !fullText.includes('rust') && !fullText.includes('раст') && !fullText.includes('cargo') && !fullText.includes('crates')) return false;
          if (target === 'go' && !fullText.includes('golang') && !fullText.includes(' go ') && !fullText.includes(' go,') && !fullText.includes('kubernetes') && !fullText.includes('docker')) return false;
          if (target === 'c++' && !fullText.includes('c++') && !fullText.includes('cpp') && !fullText.includes('си++')) return false;
          if (target === 'typescript' && !fullText.includes('typescript') && !fullText.includes('javascript') && !fullText.includes('ts') && !fullText.includes('js') && !fullText.includes('react') && !fullText.includes('node')) return false;
          if (target === 'mojo' && !fullText.includes('mojo')) return false;
          if (target === 'zig' && !fullText.includes('zig')) return false;
          if (target === 'java' && !fullText.includes('java') && !fullText.includes('spring')) return false;
          if (target === 'c#' && !fullText.includes('c#') && !fullText.includes('csharp') && !fullText.includes('.net') && !fullText.includes('dotnet') && !fullText.includes('unity')) return false;
          if ((target === 'c' || target === 'c ') && !fullText.includes(' c ') && !fullText.includes('ядро') && !fullText.includes('linux') && !fullText.includes('kernel') && !fullText.includes('embedded')) return false;
          if (target === 'php' && !fullText.includes('php') && !fullText.includes('laravel') && !fullText.includes('symfony') && !fullText.includes('wordpress')) return false;
          if (target === 'kotlin' && !fullText.includes('kotlin') && !fullText.includes('swift') && !fullText.includes('android') && !fullText.includes('ios')) return false;
        }
      }

      // 5. Strict Quality Filter & Tag Filter for Ukraine:
      const isUkraineCategory = targetCatLower === 'украина' || targetCatLower.includes('украин') || targetCatLower.includes('україна') || targetCatLower.includes('ukraine');
      if (isUkraineCategory) {
        // Suppress micro-alerts: do not show tactical drone/alert spams in main news feed (they are in the Attacks Aside)
        if (item.is_operational_alert && score < 6.0) {
          return false;
        }

        // Sub-filter by tag
        if (selectedUkraineTag && selectedUkraineTag !== 'all') {
          const fullText = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.why_it_matters || '') + ' ' + (item.source || '')).toLowerCase();
          const tag = selectedUkraineTag.toLowerCase();
          if (tag === 'дніпро' || tag === 'днепр') {
            if (!fullText.includes('дніпр') && !fullText.includes('днепр')) return false;
          } else if (tag === 'oon_nato') {
            if (!fullText.includes('оон') && !fullText.includes('нато') && !fullText.includes('nato')) return false;
          } else if (tag === 'tck') {
            if (!fullText.includes('тцк') && !fullText.includes('военкомат') && !fullText.includes('мобілізац') && !fullText.includes('мобилизац')) return false;
          } else if (tag === 'energy') {
            if (!fullText.includes('энерг') && !fullText.includes('енерг') && !fullText.includes('свет') && !fullText.includes('світл') && !fullText.includes('блэкаут') && !fullText.includes('блекаут') && !fullText.includes('дтек') && !fullText.includes('дтэк') && !fullText.includes('укрэнерго') && !fullText.includes('укренерго')) return false;
          } else if (tag === 'pvo') {
            if (!fullText.includes('пво') && !fullText.includes('збито') && !fullText.includes('сбито') && !fullText.includes('сбиты') && !fullText.includes('повітряних сил') && !fullText.includes('воздушных сил')) return false;
          } else {
            if (!fullText.includes(tag)) return false;
          }
        }
      }

      // 6. F1 Filter: Priority keywords Red Bull, Max Verstappen, Charles Leclerc, Hamilton, Champion
      const isF1Category = targetCatLower === 'f1' || targetCatLower.includes('формула') || targetCatLower.includes('formula');
      if (isF1Category) {
        const fullText = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.why_it_matters || '') + ' ' + (item.source || '')).toLowerCase();

        // Sub-filter by specific driver/team chip if selected
        if (selectedF1Tag && selectedF1Tag !== 'all') {
          const tag = selectedF1Tag.toLowerCase();
          if (tag === 'red bull') {
            if (!fullText.includes('red bull') && !fullText.includes('ред булл') && !fullText.includes('ред булл') && !fullText.includes('rb')) return false;
          } else if (tag === 'verstappen') {
            if (!fullText.includes('verstappen') && !fullText.includes('ферстаппен') && !fullText.includes('макс')) return false;
          } else if (tag === 'leclerc') {
            if (!fullText.includes('leclerc') && !fullText.includes('леклер')) return false;
          } else if (tag === 'hamilton') {
            if (!fullText.includes('hamilton') && !fullText.includes('хэмилтон') && !fullText.includes('хемилтон')) return false;
          } else if (tag === 'champion') {
            if (!fullText.includes('champion') && !fullText.includes('чемпион') && !fullText.includes('титул') && !fullText.includes('зачет') && !fullText.includes('кубок')) return false;
          } else {
            if (!fullText.includes(tag)) return false;
          }
        } else {
          // Default F1 feed: user requested focus on Red Bull, Verstappen, Leclerc, Hamilton, Champion
          const hasPriorityKeywords = ['red bull', 'ред булл', 'verstappen', 'ферстаппен', 'leclerc', 'леклер', 'hamilton', 'хэмилтон', 'хемилтон', 'champion', 'чемпион', 'титул', 'f1', 'formula 1', 'формула'].some(k => fullText.includes(k));
          if (!hasPriorityKeywords) return false;
        }
      }

      // 7. Football Filter: Priority keywords Месси, Барселона, Испания, Интер Майами
      const isFootballCategory = targetCatLower === 'футбол' || targetCatLower.includes('футбол') || targetCatLower.includes('football');
      if (isFootballCategory) {
        const fullText = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.why_it_matters || '') + ' ' + (item.source || '')).toLowerCase();

        // Sub-filter by specific tag chip if selected
        if (selectedFootballTag && selectedFootballTag !== 'all') {
          const tag = selectedFootballTag.toLowerCase();
          if (tag === 'месси' || tag === 'messi') {
            if (!fullText.includes('месси') && !fullText.includes('messi')) return false;
          } else if (tag === 'барселона' || tag === 'barcelona') {
            if (!fullText.includes('барселона') && !fullText.includes('barcelona') && !fullText.includes('барса') && !fullText.includes('barca')) return false;
          } else if (tag === 'испания' || tag === 'spain') {
            if (!fullText.includes('испани') && !fullText.includes('spain') && !fullText.includes('ла лига') && !fullText.includes('laliga')) return false;
          } else if (tag === 'интер майами' || tag === 'inter miami') {
            if (!fullText.includes('интер майами') && !fullText.includes('inter miami') && !fullText.includes('майами')) return false;
          } else {
            if (!fullText.includes(tag)) return false;
          }
        }
      }

      return true;
    }

    function renderCategoryPills() {
      const container = document.getElementById('category-pills-container');
      if (!container) return;

      state.articles.forEach(a => {
        a._displayCategory = normalizeCategory(a.category, a);
      });

      const catCounts = {};
      const distinctCats = Array.from(new Set(state.articles.map(a => a._displayCategory)));

      distinctCats.forEach(cat => {
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes('безопас') || lowerCat.includes('security') || lowerCat.includes('cybersec') ||
            lowerCat.includes('общие') || lowerCat.includes('general tech') || lowerCat.includes('technology')) {
          return;
        }
        const langParam = (state.newsCategoryFilter && state.newsCategoryFilter.toLowerCase() === cat.toLowerCase())
          ? state.selectedLanguage
          : 'all';
        const visibleCount = state.articles.filter(a => isArticleEligibleForDisplay(a, cat, langParam)).length;
        if (visibleCount > 0) {
          catCounts[cat] = visibleCount;
        }
      });

      const topAllCount = state.articles.filter(a => isArticleEligibleForDisplay(a, 'all')).length;

      // Always guarantee essential categories are present even if article count is 0
      const essentialCats = ['Футбол', 'F1', 'IT', 'CS2', 'Украина', 'Swiss', 'AI & Нейросети', 'DevOps & Linux'];
      essentialCats.forEach(ec => {
        if (catCounts[ec] === undefined) {
          catCounts[ec] = 0;
        }
      });

      const sortedCategories = Object.keys(catCounts).sort((a, b) => {
        const countDiff = (catCounts[b] || 0) - (catCounts[a] || 0);
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b);
      });
      const categories = ['Все', ...sortedCategories];

      container.innerHTML = categories.map(cat => {
        const isAll = (cat === 'Все');
        const count = isAll ? topAllCount : (catCounts[cat] || 0);
        const isActive = (isAll && (state.newsCategoryFilter === 'all' || !state.newsCategoryFilter || state.newsCategoryFilter === 'Все')) ||
                         (!isAll && state.newsCategoryFilter && state.newsCategoryFilter.toLowerCase() === cat.toLowerCase());
        const emoji = isAll ? '📂' : getCategoryEmoji(cat);

        const activeClass = isActive
          ? 'bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/25 border-sky-400'
          : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/80 font-medium';

        return `
          <button type="button" data-category="${isAll ? 'all' : cat}" onclick="setDynamicCategory('${isAll ? 'all' : cat.replace(/'/g, "\\'")}')" class="news-cat-pill px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all shrink-0 border ${activeClass}">
            <span>${emoji}</span>
            <span>${cat}</span>
            <span class="news-cat-pill-count text-[10px] opacity-75 bg-black/30 px-1.5 py-0.5 rounded-md font-mono">${count}</span>
          </button>
        `;
      }).join('');
    }

    async function loadLiveNews() {
      try {
        const response = await fetch('/api/news?limit=250');
        if (response.ok) {
          const liveArticles = await response.json();
          if (liveArticles && liveArticles.length > 0) {
            state.articles = liveArticles;
            state.articles.forEach(a => {
              a._displayCategory = normalizeCategory(a.category, a);
            });
            renderCategoryPills();
            renderNews();
          }
        }
      } catch (err) {
        console.warn('API /api/news недоступен, используются демо-данные:', err);
      }
    }

    // Media (Image & Video) Zoom / Lightbox Modal Handlers
    let isImageScaledUp = false;

    function openMediaZoom(type, src, title, poster) {
      const modal = document.getElementById('image-zoom-modal');
      const img = document.getElementById('zoom-modal-img');
      const vid = document.getElementById('zoom-modal-video');
      const caption = document.getElementById('zoom-modal-caption');
      const origBtn = document.getElementById('zoom-open-original-btn');
      const scaleBtn = document.getElementById('zoom-toggle-scale-btn');
      const scaleIndicator = document.getElementById('zoom-scale-indicator');
      const typeText = document.getElementById('zoom-type-text');
      const iconImg = document.getElementById('zoom-type-icon-img');
      const iconVid = document.getElementById('zoom-type-icon-video');
      const viewport = document.getElementById('zoom-viewport');
      if (!modal) return;

      if (type === 'video') {
        if (img) {
          img.src = '';
          img.classList.add('hidden');
        }
        if (vid) {
          vid.src = src;
          if (poster) vid.poster = poster;
          vid.classList.remove('hidden');
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
        if (typeText) typeText.textContent = 'Просмотр видео';
        if (iconImg) iconImg.classList.add('hidden');
        if (iconVid) iconVid.classList.remove('hidden');
        if (scaleBtn) scaleBtn.classList.add('hidden');
        if (scaleIndicator) scaleIndicator.classList.add('hidden');
      } else {
        if (vid) {
          vid.pause();
          vid.src = '';
          vid.classList.add('hidden');
        }
        if (img) {
          img.src = src;
          img.alt = title || '';
          img.classList.remove('hidden');
          img.className = 'max-h-[72vh] max-w-full object-contain rounded-lg transition-transform duration-200 cursor-pointer';
        }
        if (typeText) typeText.textContent = 'Просмотр изображения';
        if (iconImg) iconImg.classList.remove('hidden');
        if (iconVid) iconVid.classList.add('hidden');
        if (scaleBtn) scaleBtn.classList.remove('hidden');
        if (scaleIndicator) {
          scaleIndicator.classList.remove('hidden');
          scaleIndicator.textContent = '100%';
        }
      }

      if (caption) caption.textContent = title || '';
      if (origBtn) origBtn.href = src;

      isImageScaledUp = false;
      if (viewport) {
        viewport.className = 'relative w-full max-h-[78vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl flex items-center justify-center p-2 cursor-pointer';
        viewport.scrollTop = 0;
        viewport.scrollLeft = 0;
      }
      const toggleLabel = document.getElementById('zoom-toggle-label');
      if (toggleLabel) toggleLabel.textContent = 'Увеличить';

      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      void modal.offsetWidth;
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';
    }

    function openImageZoom(src, title) {
      openMediaZoom('image', src, title);
    }

    function openVideoZoom(src, title, poster) {
      openMediaZoom('video', src, title, poster);
    }

    function closeImageZoom(e) {
      if (e && e.target && e.target.closest && (e.target.closest('#zoom-viewport') || e.target.closest('button') || e.target.closest('a'))) {
        return;
      }
      const modal = document.getElementById('image-zoom-modal');
      if (!modal) return;
      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        const img = document.getElementById('zoom-modal-img');
        if (img) img.src = '';
        const vid = document.getElementById('zoom-modal-video');
        if (vid) {
          vid.pause();
          vid.src = '';
        }
      }, 250);
      document.body.style.overflow = '';
    }

    function toggleZoomScale() {
      const img = document.getElementById('zoom-modal-img');
      const vid = document.getElementById('zoom-modal-video');
      if (vid && !vid.classList.contains('hidden')) {
        if (vid.requestFullscreen) {
          vid.requestFullscreen().catch(() => {});
        } else if (vid.webkitRequestFullscreen) {
          vid.webkitRequestFullscreen();
        }
        return;
      }
      const viewport = document.getElementById('zoom-viewport');
      const scaleIndicator = document.getElementById('zoom-scale-indicator');
      const toggleLabel = document.getElementById('zoom-toggle-label');
      if (!img || !viewport) return;

      isImageScaledUp = !isImageScaledUp;
      if (isImageScaledUp) {
        img.className = 'max-h-none max-w-none w-[170%] md:w-[200%] object-contain rounded-lg transition-all duration-300 cursor-pointer shadow-2xl';
        viewport.className = 'relative w-full max-h-[78vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl p-4 cursor-pointer block';
        if (scaleIndicator) scaleIndicator.textContent = '200% (Крупно)';
        if (toggleLabel) toggleLabel.textContent = 'Уменьшить';
      } else {
        img.className = 'max-h-[72vh] max-w-full object-contain rounded-lg transition-all duration-200 cursor-pointer';
        viewport.className = 'relative w-full max-h-[78vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl flex items-center justify-center p-2 cursor-pointer';
        if (scaleIndicator) scaleIndicator.textContent = '100%';
        if (toggleLabel) toggleLabel.textContent = 'Увеличить';
      }
    }

    function toggleMobileAside(asideId) {
      const aside = document.getElementById(asideId);
      if (!aside) return;
      aside.classList.toggle('is-collapsed');
      const btnText = aside.querySelector('.aside-toggle-text');
      if (btnText) {
        btnText.textContent = aside.classList.contains('is-collapsed') ? 'Развернуть' : 'Свернуть';
      }
    }

    window.openMediaZoom = openMediaZoom;
    window.openImageZoom = openImageZoom;
    window.openVideoZoom = openVideoZoom;
    window.closeImageZoom = closeImageZoom;
    window.loadHLTVRanking = loadHLTVRanking;
    window.toggleZoomScale = toggleZoomScale;
    window.toggleMobileAside = toggleMobileAside;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const zoomModal = document.getElementById('image-zoom-modal');
        if (zoomModal && !zoomModal.classList.contains('hidden') && zoomModal.style.display !== 'none') {
          closeImageZoom();
        }
      }
    });

    function formatShortSummary(text) {
      if (!text) return 'Краткое резюме формируется.';
      const clean = cleanText(text).trim();
      const sentences = clean.match(/(?:[^.!?]|\d\.\d)+[.!?]+(?:\s|$)/g);
      if (sentences && sentences.length > 0) {
        return sentences.slice(0, 3).join('').trim();
      }
      if (clean.length > 220) {
        return clean.slice(0, 220).replace(/\s+[^\s]*$/, '') + '...';
      }
      return clean;
    }

    function renderNews() {
      const container = document.getElementById('news-container');
      if (!container) return;
      container.innerHTML = '';

      const isAll = (state.newsCategoryFilter === 'all' || state.newsCategoryFilter === 'Все' || !state.newsCategoryFilter);

      // In "Все" tab: gather and render the express digest aside (6.0 <= score < 8.0)
      if (isAll) {
        const digestArticles = state.articles.filter(item => {
          const rawCat = (item.category || '').toLowerCase();
          const itemCat = (item._displayCategory || normalizeCategory(item.category, item)).toLowerCase();
          const rawTitle = (item.title || '').toLowerCase();
          if (itemCat.includes('безопас') || itemCat.includes('cybersec') || itemCat.includes('security') ||
              rawCat.includes('безопас') || rawCat.includes('cybersec') || rawCat.includes('security') ||
              rawTitle.includes('уязвим') || rawTitle.includes('cve-')) {
            return false;
          }
          if (item.is_operational_alert) {
            return false;
          }
          const score = item.importance_score ? Number(item.importance_score) : 5.0;
          return score >= 6.0 && score < 8.0;
        });
        renderAllDigestAside(digestArticles);
      }

      const filtered = state.articles.filter(item => 
        isArticleEligibleForDisplay(item, state.newsCategoryFilter, state.selectedLanguage)
      );

      // Sort: Chronological by publication time (latest news first)
      filtered.sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bDate - aDate;
      });

      // Synchronize active category pill count badge directly with displayed cards
      const activePillBadge = document.querySelector('.news-cat-pill.border-sky-400 .news-cat-pill-count');
      if (activePillBadge) {
        activePillBadge.textContent = filtered.length;
      }

      if (filtered.length === 0) {
        let msg = 'В этой выборке пока нет новостей.';
        const catName = state.newsCategoryFilter || 'Все';
        const catLower = catName.toLowerCase();

        if (isAll) {
          msg = 'В категории «Все» отображаются главные события с наивысшей важностью (оценка ≥ 8.0). Менее критичные события (6.0–8.0) собраны в экспресс-дайджесте справа.';
        } else if (catLower === 'f1' || catLower.includes('формул') || catLower.includes('formula')) {
          msg = 'В категории «F1» новости отбираются по ключевым темам (Red Bull, Verstappen, Leclerc, Hamilton, Champion). Свежие результаты гонок и зачет пилотов 2026 доступны в панели справа.';
        } else if (catLower === 'it' || catLower.includes('it & аналитика') || catLower.includes('development') || catLower.includes('programming')) {
          msg = 'В этой выборке нет новостей (для IT & Аналитики действует строгий фильтр: оценка ≥ 7.0)';
        } else if (catLower === 'cs2' || catLower.includes('игры') || catLower.includes('gaming')) {
          msg = 'В категории «CS2» действует фильтр качества (оценка ≥ 7.0). Актуальный рейтинг HLTV доступен в панели справа.';
        } else if (catLower.includes('украин') || catLower.includes('ukraine')) {
          msg = 'В категории «Украина» отображаются проверенные новости. Оперативная сводка атак и ПВО доступна в панели справа.';
        }

        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-3xl p-6 border border-slate-800">
            <span class="text-3xl block mb-2">🏎️</span>
            <p class="text-sm font-semibold text-slate-300 max-w-xl mx-auto leading-relaxed">${msg}</p>
            <button type="button" onclick="filterByLanguage('all'); setDynamicCategory('all');" class="mt-3 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all">
              Показать все новости
            </button>
          </div>
        `;
        return;
      }

      filtered.forEach((article, index) => {
        const title = cleanText((article.titles && article.titles[state.lang]) || article.title || 'Новость');
        const sourceUrl = article.sourceUrl || article.url || article.original_url || '#';
        const sourceName = article.sourceName || article.source || 'Инфо-поток';
        const category = article._displayCategory || normalizeCategory(article.category || 'Технологии', article);
        const score = article.importance_score ? Number(article.importance_score).toFixed(1) : '5.0';
        const summary = cleanText((article.summaries && article.summaries[state.lang]) || article.summary || '');
        const whyItMatters = cleanText(article.why_it_matters || '');
        const image = getArticleImage(article, index);
        const videoSrc = article.video_url || (article.raw_content && (article.raw_content.match(/<video[^>]+src=["']([^"']+)["']/) || [])[1]) || '';
        const hasVideo = Boolean(videoSrc);

        const timeStr = article.published_at 
          ? (() => {
              const d = new Date(article.published_at);
              const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
              const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
              const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
              return `${capitalizedWeekday}, ${time}`;
            })()
          : 'Сегодня';

        const isPriority = article.is_priority || 
          ['simple', 's1mple', 'navi', 'bcgame', 'bc.game', 'fut'].some(kw => 
            ((article.title || '') + ' ' + (article.summary || '') + ' ' + (article.why_it_matters || '')).toLowerCase().includes(kw)
          ) ||
          (['дніпро', 'днепр', 'оон', 'нато', 'nato', 'тцк'].some(kw =>
            ((article.title || '') + ' ' + (article.summary || '') + ' ' + (article.why_it_matters || '')).toLowerCase().includes(kw)
          ) && (category === 'Украина' || ((article.source || '') + (article.url || '')).toLowerCase().includes('novynaukr')));

        const priorityBadge = isPriority
          ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/30 backdrop-blur-md text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-500/25 flex items-center gap-1 animate-pulse">⭐ Приоритет</span>`
          : '';

        const isHighQuality = Number(score) >= 7.0;
        const scoreBadge = isHighQuality
          ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/25 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-lg flex items-center gap-1">🔥 ${score}/10</span>`
          : `<span class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-800/80 backdrop-blur-md text-slate-300 border border-slate-700/50 shadow-md">${score}/10</span>`;

        const diagramBadge = article.has_diagram
          ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-500/25 backdrop-blur-md text-purple-300 border border-purple-500/40 shadow-lg flex items-center gap-1 animate-pulse">📊 Диаграмма / График</span>`
          : '';

        const borderClass = isPriority
          ? 'border-amber-500/40 hover:border-amber-400/60 shadow-amber-500/10'
          : 'border-slate-800/80 hover:border-sky-500/30';

        const card = document.createElement('div');
        card.className = `news-card glass-panel glass-panel-hover rounded-2xl md:rounded-3xl overflow-hidden border ${borderClass} flex flex-col group transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/5 md:hover:-translate-y-1`;

        const isPractice = article.is_practice ||
          (category === 'AI & Нейросети' || category === 'DevOps & Linux') &&
          (['задач', 'практик', 'квиз', 'решени', 'туториал', 'шпаргалк', 'совет', 'лайфхак', 'interview', 'cheat', 'quiz', 'challenge', 'shorts', 'youtube.com'].some(kw =>
            ((article.title || '') + ' ' + (article.summary || '') + ' ' + (article.why_it_matters || '') + ' ' + (article.source || '') + ' ' + (article.url || '')).toLowerCase().includes(kw)
          ));

        const practiceBadge = isPractice
          ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/25 backdrop-blur-md text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex items-center gap-1">🧠 Практика</span>`
          : '';

        const mobilePriorityBadge = isPriority ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/30 text-amber-300 shrink-0">⭐</span>` : '';
        const mobilePracticeBadge = isPractice ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/25 text-emerald-300 shrink-0">🧠</span>` : '';
        const mobileScoreBadge = isHighQuality 
          ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/25 text-amber-300 shrink-0 font-mono">🔥${score}</span>` 
          : `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400 shrink-0 font-mono">${score}</span>`;

        const mobileHeaderMarkup = `
          <div class="news-card-mobile-header">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="text-xs shrink-0">${getCategoryEmoji(category)}</span>
              <span class="text-[10px] font-mono text-slate-400 shrink-0">${timeStr}</span>
              ${mobilePriorityBadge}
              ${mobilePracticeBadge}
              ${mobileScoreBadge}
              <span class="text-xs font-semibold text-white truncate flex-1 leading-snug">${title}</span>
            </div>
            <div class="news-card-expand-icon text-slate-400 shrink-0 p-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        `;

        const mediaMarkup = hasVideo ? `
          <div class="relative w-full aspect-video overflow-hidden bg-black group/video">
            <video 
              src="${videoSrc}" 
              poster="${image}" 
              class="w-full h-full object-cover rounded-t-2xl md:rounded-t-3xl" 
              controls 
              preload="metadata" 
              playsinline>
            </video>
            
            <div class="absolute top-3 left-3 flex items-center gap-2 flex-wrap pointer-events-none z-10">
              <span class="px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-sky-300 border border-sky-500/30 shadow-lg flex items-center gap-1.5">
                <span>${getCategoryEmoji(category)}</span>
                <span>${category}</span>
              </span>
              <button type="button" class="btn-open-video-zoom px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/50 shadow-lg flex items-center gap-1 cursor-pointer pointer-events-auto transition-colors" title="Приблизить видео">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span>ВИДЕО</span>
              </button>
              ${priorityBadge}
              ${practiceBadge}
              ${scoreBadge}
            </div>

            <!-- Top Right Zoom Button for Video -->
            <div class="absolute top-3 right-3 z-10">
              <button type="button" class="btn-open-video-zoom px-2.5 py-1 rounded-xl bg-slate-950/85 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-400/30 hover:border-sky-300 shadow-xl flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer" title="Приблизить видео">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
                <span>Увеличить</span>
              </button>
            </div>

            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-none z-10">
              <span class="font-semibold text-white flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50">
                ${sourceName}
              </span>
              <span class="text-slate-400 text-[11px] bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800">${timeStr}</span>
            </div>
          </div>
        ` : `
          <div class="relative w-full aspect-video overflow-hidden bg-slate-950 cursor-pointer group/img card-media-preview" title="Нажмите, чтобы приблизить фото">
            <img src="${image}" alt="${title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90 group-hover/img:opacity-100 cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
            
            <!-- Hover Zoom Pill Button -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 pointer-events-none bg-slate-950/30 backdrop-blur-[1px]">
              <span class="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-sky-300 border border-sky-400/40 shadow-2xl flex items-center gap-1.5 text-xs font-semibold transform scale-90 group-hover/img:scale-100 transition-transform cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/></svg>
                <span>Увеличить фото</span>
              </span>
            </div>

            <div class="absolute top-3 left-3 flex items-center gap-2 flex-wrap pointer-events-none">
              <span class="px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-sky-300 border border-sky-500/30 shadow-lg flex items-center gap-1.5">
                <span>${getCategoryEmoji(category)}</span>
                <span>${category}</span>
              </span>
              ${priorityBadge}
              ${practiceBadge}
              ${scoreBadge}
              ${diagramBadge}
            </div>

            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
              <span class="font-semibold text-white flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50">
                ${sourceName}
              </span>
              <span class="text-slate-400 text-[11px] bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800">${timeStr}</span>
            </div>
          </div>
        `;

        card.innerHTML = `
          ${mobileHeaderMarkup}

          <div class="news-card-body">
            ${mediaMarkup}

            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="flex-1 flex flex-col">
                <h3 class="text-base sm:text-lg font-bold text-white font-heading group-hover:text-sky-300 transition-colors leading-snug">
                  ${title}
                </h3>
                
                <div class="mt-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/70 text-xs text-slate-300 leading-relaxed flex-1">
                  <span class="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <span>🤖</span> <span>Резюме нейросети:</span>
                  </span>
                  <p class="text-slate-300 leading-relaxed">${formatShortSummary(summary)}</p>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                <span class="text-[11px] text-slate-500 font-medium">News AI Engine</span>
                <div class="flex items-center gap-2">
                  <button type="button" class="btn-delete-article p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-200 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer" data-id="${article.id}" title="Удалить новость">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                  </button>
                  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-semibold flex items-center justify-center transition-all" title="Читать в источнике">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        const deleteBtn = card.querySelector('.btn-delete-article');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = article.id;
            const articleTitle = article.title || 'Новость';
            if (!confirm(`Вы уверены, что хотите удалить эту новость из базы данных?\n\n«${articleTitle.slice(0, 60)}...»`)) {
              return;
            }
            deleteBtn.disabled = true;
            deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
            try {
              const resp = await fetch(`/api/news/${id}`, { method: 'DELETE' });
              if (resp.ok) {
                card.style.transition = 'all 0.35s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.92)';
                setTimeout(() => {
                  card.remove();
                  state.articles = state.articles.filter(a => a.id !== id);
                  renderCategoryPills();
                  if (typeof showToast === 'function') {
                    showToast('Новость удалена', 'Запись стерта из базы данных', 'info');
                  }
                }, 350);
              } else {
                const errData = await resp.json().catch(() => ({}));
                alert('Ошибка при удалении: ' + (errData.detail || 'Не удалось удалить новость'));
                deleteBtn.disabled = false;
                deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
              }
            } catch (err) {
              console.error('Delete error:', err);
              alert('Ошибка соединения с сервером');
              deleteBtn.disabled = false;
              deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
          });
        }

        const mediaEl = card.querySelector('.card-media-preview');
        if (mediaEl) {
          mediaEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentImg = mediaEl.querySelector('img');
            const currentSrc = (currentImg && currentImg.src) ? currentImg.src : image;
            openImageZoom(currentSrc, title);
          });
        }

        const videoZoomBtns = card.querySelectorAll('.btn-open-video-zoom');
        videoZoomBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openVideoZoom(videoSrc, title, image);
          });
        });

        const mobileHeader = card.querySelector('.news-card-mobile-header');
        if (mobileHeader) {
          mobileHeader.addEventListener('click', (e) => {
            e.preventDefault();
            card.classList.toggle('is-expanded');
          });
        }

        container.appendChild(card);
      });
    }

    // Render Devices
    function updateNetworkAnalytics() {
      const p = document.getElementById('metric-protection');
      const a = document.getElementById('metric-attacks');
      const s = document.getElementById('metric-speed');
      const r = document.getElementById('metric-remote');

      if (p) p.textContent = "99.8%";
      if (a) a.textContent = state.dnsStats.threatsBlocked + " " + (state.lang === 'fr' ? 'menaces' : state.lang === 'de' ? 'Bedrohungen' : 'threats');
      if (s) s.textContent = "500 Mb/s";
      if (r) r.textContent = state.vpnConnected ? "WireGuard" : "Off";
    }

    function renderDevices() {
      const container = document.getElementById('devices-container');
      if (!container) return;

      const total = state.devices.length;
      const paused = state.devices.filter(d => d.paused).length;
      const active = total - paused;

      const stTotal = document.getElementById('stat-total-devices');
      const stAct = document.getElementById('stat-active-devices');
      const stPau = document.getElementById('stat-paused-devices');

      if (stTotal) stTotal.textContent = total;
      if (stAct) stAct.textContent = active;
      if (stPau) stPau.textContent = paused;

      updateNetworkAnalytics();

      const filtered = state.devices.filter(d => {
        const matchQuery = d.name.toLowerCase().includes(state.searchDeviceQuery.toLowerCase()) ||
                           d.ip.includes(state.searchDeviceQuery) ||
                           d.location.toLowerCase().includes(state.searchDeviceQuery.toLowerCase());
        const matchCat = state.deviceCategoryFilter === 'all' || d.category === state.deviceCategoryFilter;
        return matchQuery && matchCat;
      });

      container.innerHTML = '';

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-10 text-center text-slate-400 glass-panel rounded-3xl p-6">
            <p class="text-sm font-semibold text-slate-300">Aucun appareil trouvé</p>
          </div>
        `;
        return;
      }

      filtered.forEach(device => {
        const card = document.createElement('div');
        card.className = `glass-panel rounded-3xl p-5 border transition-all ${device.paused ? 'border-rose-500/40 bg-rose-950/15' : 'border-slate-800'}`;

        card.innerHTML = `
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${device.paused ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'}">
                ${getDeviceIcon(device.icon)}
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-white text-sm sm:text-base leading-snug truncate">${device.name}</h4>
                <p class="text-[11px] text-slate-400 truncate">${device.vendor} • ${device.location}</p>
              </div>
            </div>

            <!-- Quick Internet Cut/Resume Button -->
            <button type="button" class="toggle-pause-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${device.paused ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-white'}" data-id="${device.id}">
              ${device.paused 
                ? '<svg class="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>' 
                : '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'}
              <span>${device.paused ? t('btnResumeInternet') : t('btnPauseInternet')}</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="badge-status px-2.5 py-1 rounded-full text-xs font-semibold ${device.paused ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'}">
              <span class="w-2 h-2 rounded-full mr-1.5 ${device.paused ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}"></span>
              ${device.paused ? t('statusPaused') : t('statusOnline')}
            </span>

            <span class="badge-status px-2.5 py-1 rounded-full text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              ${device.connection}
            </span>

            ${device.parental ? '<span class="badge-status px-2 py-0.5 rounded-full text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30">Parental</span>' : ''}
            ${device.qos === 'high' ? '<span class="badge-status px-2 py-0.5 rounded-full text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30">⚡ QoS</span>' : ''}
          </div>

          <div class="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs mb-3">
            <div>
              <span class="text-slate-500 block text-[10px]">IP :</span>
              <span class="font-mono text-slate-200 font-medium">${device.ip}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-500 block text-[10px]">${t('trafficToday')}</span>
              <span class="font-bold text-sky-300">${device.dataToday}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] font-mono text-slate-500">${device.mac}</span>
            <button type="button" class="inspect-device-btn px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1 transition-all" data-id="${device.id}">
              <span>${t('btnConfigure')}</span>
            </button>
          </div>
        `;

        container.appendChild(card);
      });

      // Attach Pause Button Events
      container.querySelectorAll('.toggle-pause-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          const dev = state.devices.find(d => d.id === id);
          if (!dev) return;
          dev.paused = !dev.paused;
          renderDevices();
          showToast(dev.paused ? t('toastPauseOn') : t('toastPauseOff'), dev.name, dev.paused ? "warning" : "success");
        };
      });

      // Attach Inspect Button Events
      container.querySelectorAll('.inspect-device-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          openDeviceModal(id);
        };
      });
    }

    // Device Inspector Modal
    let activeEditId = null;
    function openDeviceModal(id) {
      const dev = state.devices.find(d => d.id === id);
      if (!dev) return;
      activeEditId = id;

      document.getElementById('modal-device-name').value = dev.name;
      document.getElementById('modal-device-ip').textContent = dev.ip;
      document.getElementById('modal-device-mac').textContent = dev.mac;
      document.getElementById('modal-device-vendor').textContent = dev.vendor;
      document.getElementById('modal-device-connection').textContent = dev.connection;
      document.getElementById('modal-device-location').value = dev.location;
      document.getElementById('modal-device-qos').value = dev.qos;
      document.getElementById('modal-device-parental').checked = dev.parental;
      document.getElementById('modal-device-pause-toggle').checked = dev.paused;

      const modal = document.getElementById('device-modal');
      modal.style.display = 'flex';
    }

    // Save Device Modal
    document.getElementById('save-device-settings').onclick = () => {
      if (!activeEditId) return;
      const dev = state.devices.find(d => d.id === activeEditId);
      if (!dev) return;

      dev.name = document.getElementById('modal-device-name').value;
      dev.location = document.getElementById('modal-device-location').value;
      dev.qos = document.getElementById('modal-device-qos').value;
      dev.parental = document.getElementById('modal-device-parental').checked;
      dev.paused = document.getElementById('modal-device-pause-toggle').checked;

      const modal = document.getElementById('device-modal');
      modal.style.display = 'none';

      renderDevices();
      showToast(t('toastSaved'), dev.name, "success");
    };

    document.getElementById('close-device-modal').onclick = () => {
      const modal = document.getElementById('device-modal');
      modal.style.display = 'none';
    };

    // VPN Section UI
    function updateVpnUI() {
      const btn = document.getElementById('vpn-main-toggle');
      const pill = document.getElementById('vpn-status-pill');
      const txt = document.getElementById('vpn-status-text');
      const ip = document.getElementById('vpn-virtual-ip');
      const ping = document.getElementById('vpn-ping');

      if (state.vpnConnected) {
        btn.innerHTML = `
          <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="font-bold text-white">${t('vpnBtnDisconnect')}</span>
        `;
        btn.className = 'w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/30 border border-emerald-400/40 transition-all';

        pill.className = 'badge-status px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5';
        pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ' + t('vpnStatusConnected');

        txt.textContent = state.lang === 'fr' 
          ? "Votre tunnel sécurisé vers la maison est actif. Accédez à vos disques et caméras comme si vous étiez dans votre salon."
          : state.lang === 'de'
          ? "Ihr sicherer Heimtunnel ist aktiv. Voller Zugriff auf Heimdaten wie auf der heimischen Couch."
          : "Your secure tunnel to home is active. Access your local storage and cameras just like on your home couch.";

        ip.textContent = "10.8.0.2 / 24";
        ping.textContent = "12 ms";
      } else {
        btn.innerHTML = `
          <svg class="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"/></svg>
          <span class="font-bold text-white">${t('vpnBtnConnect')}</span>
        `;
        btn.className = 'w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-sky-900/30 border border-sky-400/40 transition-all';

        pill.className = 'badge-status px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5';
        pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-500"></span> ' + t('vpnStatusDisconnected');

        txt.textContent = state.lang === 'fr'
          ? "Le tunnel distant est désactivé. Vos appareils locaux ne sont pas accessibles depuis l'extérieur."
          : state.lang === 'de'
          ? "Der Fernzugriff ist deaktiviert. Heimgeräte sind von außen nicht erreichbar."
          : "Remote tunnel is disconnected. Local home devices are not accessible from outside.";

        ip.textContent = "—";
        ping.textContent = "—";
      }

      updateNetworkAnalytics();
      renderCanvasChart();
    }

    document.getElementById('vpn-main-toggle').onclick = () => {
      state.vpnConnected = !state.vpnConnected;
      updateVpnUI();
      showToast(state.vpnConnected ? t('toastVpnOn') : t('toastVpnOff'), state.vpnConnected ? "WireGuard 10.8.0.2" : "", state.vpnConnected ? "success" : "info");
    };

    // QR Code Modal
    document.getElementById('show-qr-btn').onclick = () => {
      const q = document.getElementById('qr-modal');
      q.style.display = 'flex';
    };
    document.getElementById('close-qr-modal').onclick = () => {
      const q = document.getElementById('qr-modal');
      q.style.display = 'none';
    };

    // Radar Modal
    document.getElementById('scan-network-btn').onclick = () => {
      const r = document.getElementById('radar-scan-modal');
      const f = document.getElementById('radar-found-box');
      r.style.display = 'flex';
      f.style.display = 'none';

      document.getElementById('radar-status-text').textContent = t('radarScanning');

      setTimeout(() => {
        f.style.display = 'block';
        document.getElementById('radar-status-text').textContent = t('radarFoundTitle');
      }, 2000);
    };

    document.getElementById('close-radar-modal').onclick = () => {
      const r = document.getElementById('radar-scan-modal');
      r.style.display = 'none';
    };

    document.getElementById('add-discovered-device-btn').onclick = () => {
      state.devices.push({
        id: Date.now(),
        name: "Capteur Aqara Zigbee",
        category: "iot",
        icon: "hub",
        ip: "192.168.1.189",
        mac: "54:EF:44:A1:09:BB",
        connection: "Wi-Fi 2.4 GHz",
        dataToday: "2.4 MB",
        paused: false,
        qos: "normal",
        parental: false,
        vendor: "Aqara",
        location: "Entrée"
      });

      const r = document.getElementById('radar-scan-modal');
      r.style.display = 'none';

      renderDevices();
      showToast(t('toastSaved'), "Capteur Aqara Zigbee", "success");
    };

    // Standalone Canvas Traffic Chart
    let chartPoints = [35, 52, 78, 110, 85, 62, 94, 120, 95, 88];
    function renderCanvasChart() {
      const canvas = document.getElementById('vpn-traffic-chart');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (!state.vpnConnected) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VPN Déconnecté', w / 2, h / 2);
        return;
      }

      // Draw Gradient Area & Line
      const pts = chartPoints;
      const step = w / (pts.length - 1);

      ctx.beginPath();
      ctx.moveTo(0, h - (pts[0] / 150) * h);

      for (let i = 1; i < pts.length; i++) {
        const x = i * step;
        const y = h - (pts[i] / 150) * h;
        const prevX = (i - 1) * step;
        const prevY = h - (pts[i - 1] / 150) * h;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3 * (window.devicePixelRatio || 1);
      ctx.stroke();

      // Fill Gradient
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    window.addEventListener('resize', renderCanvasChart);

    // Pulse live chart values
    setInterval(() => {
      if (state.vpnConnected && state.currentTab === 'vpn') {
        chartPoints.shift();
        chartPoints.push(Math.floor(Math.random() * 50 + 60));
        renderCanvasChart();
      }
    }, 2000);

    // DNS Providers
    document.querySelectorAll('.dns-provider-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.dns-provider-card').forEach(c => {
          c.className = 'dns-provider-card cursor-pointer p-3 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all';
        });
        card.className = 'dns-provider-card cursor-pointer p-3 rounded-2xl border border-sky-500 bg-sky-500/10 glow-cyan transition-all';
        state.selectedDns = card.dataset.dns;
        showToast(t('toastSaved'), card.querySelector('h4').textContent.trim(), "info");
      };
    });

    // DNS Shields
    function bindDns(id, key) {
      const el = document.getElementById(id);
      if (!el) return;
      el.onchange = (e) => {
        state.dnsFilters[key] = e.target.checked;
        showToast(t('toastSaved'), t('dnsSectionTitle'), "success");
      };
    }
    bindDns('dns-toggle-adblock', 'adblock');
    bindDns('dns-toggle-malware', 'malware');
    bindDns('dns-toggle-doh', 'doh');
    bindDns('dns-toggle-parental', 'parental');

    // DNS Log
    function renderDnsLog() {
      const body = document.getElementById('dns-query-log-body');
      if (!body) return;

      const filter = document.getElementById('dns-log-filter').value;
      const filtered = state.dnsQueries.filter(q => {
        if (filter === 'all') return true;
        if (filter === 'blocked') return q.status === 'blocked' || q.status === 'threat';
        if (filter === 'allowed') return q.status === 'allowed';
        return true;
      });

      const statusLabels = {
        allowed: { fr: "Autorisé", en: "Allowed", de: "Erlaubt", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
        blocked: { fr: "Pub bloquée", en: "Ad blocked", de: "Werbung geblockt", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
        threat: { fr: "⚠️ Menace évitée", en: "⚠️ Threat stopped", de: "⚠️ Bedrohung geblockt", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" }
      };

      body.innerHTML = filtered.map(query => {
        const info = statusLabels[query.status] || statusLabels.allowed;
        const statusText = info[state.lang] || info.fr;

        return `
          <div class="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono text-white text-xs font-semibold truncate">${query.domain}</span>
                <span class="badge-status px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${info.badge}">
                  ${statusText}
                </span>
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span>${query.client}</span>
                <span>•</span>
                <span class="text-slate-500">${query.time}</span>
                <span>•</span>
                <span class="text-slate-400 italic truncate">${query.reason}</span>
              </div>
            </div>
            
            <button type="button" class="toggle-domain-btn px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${query.status === 'allowed' ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'}" data-id="${query.id}">
              ${query.status === 'allowed' ? (state.lang === 'fr' ? 'Bloquer' : state.lang === 'de' ? 'Blockieren' : 'Block') : (state.lang === 'fr' ? 'Autoriser' : state.lang === 'de' ? 'Erlauben' : 'Allow')}
            </button>
          </div>
        `;
      }).join('');

      body.querySelectorAll('.toggle-domain-btn').forEach(btn => {
        btn.onclick = () => {
          const id = parseInt(btn.dataset.id);
          const q = state.dnsQueries.find(item => item.id === id);
          if (!q) return;

          if (q.status === 'allowed') {
            q.status = 'blocked';
            q.reason = state.lang === 'fr' ? "Bloqué par l'utilisateur" : "Blocked by user";
            state.dnsStats.blockedQueries++;
          } else {
            q.status = 'allowed';
            q.reason = state.lang === 'fr' ? "Autorisé par l'utilisateur" : "Allowed by user";
            if (state.dnsStats.blockedQueries > 0) state.dnsStats.blockedQueries--;
          }

          document.getElementById('stat-blocked-count').textContent = state.dnsStats.blockedQueries.toLocaleString();
          renderDnsLog();
        };
      });
    }

    const dnsFilterEl = document.getElementById('dns-log-filter');
    if (dnsFilterEl) dnsFilterEl.onchange = renderDnsLog;

    // Presentation Demo Actions (Safely guarded)
    const attackBtn = document.getElementById('demo-simulate-attack');
    if (attackBtn) {
      attackBtn.onclick = () => {
        state.dnsStats.threatsBlocked++;
        state.dnsStats.blockedQueries += 3;
        const threatsEl = document.getElementById('stat-threats-count');
        const blockedEl = document.getElementById('stat-blocked-count');
        if (threatsEl) threatsEl.textContent = state.dnsStats.threatsBlocked.toLocaleString();
        if (blockedEl) blockedEl.textContent = state.dnsStats.blockedQueries.toLocaleString();
        updateNetworkAnalytics();

        state.dnsQueries.unshift({
          id: Date.now(),
          domain: "phishing-bank-login.cc",
          client: "Smart TV Salon",
          time: new Date().toTimeString().substring(0, 5),
          status: "threat",
          reason: state.lang === 'fr' ? "Lien malveillant bloqué" : (state.lang === 'ru' ? "Опасный домен заблокирован" : "Malicious domain stopped")
        });

        renderDnsLog();
        showToast(t('toastAttackTitle'), t('toastAttackDesc'), "danger");
      };
    }

    const resetBtn = document.getElementById('demo-reset-state');
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.devices.forEach(d => d.paused = false);
        state.vpnConnected = true;
        renderDevices();
        updateVpnUI();
        showToast(t('toastResetTitle'), t('toastResetDesc'), "info");
      };
    }

    // Attach Language Select Listener
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.onchange = (e) => setLanguage(e.target.value);
    }

    // Attach Tab Switching Listeners (Both Desktop & Mobile Nav)
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.onclick = () => switchTab(tab.dataset.tab);
    });

    // News Category Filters
    document.querySelectorAll('.news-cat-pill').forEach(pill => {
      pill.onclick = () => {
        setDynamicCategory(pill.dataset.category || 'all');
      };
    });

    // Device Category Filters
    document.querySelectorAll('.device-cat-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('.device-cat-pill').forEach(p => {
          p.className = 'device-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 bg-slate-800/80 text-slate-300';
        });
        pill.className = 'device-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 bg-sky-500 text-white';
        state.deviceCategoryFilter = pill.dataset.category;
        renderDevices();
      };
    });

    // Device Search
    const searchInput = document.getElementById('device-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchDeviceQuery = e.target.value;
        renderDevices();
      };
    }

    // Initialize Default View
    setLanguage('ru');
    switchTab('news');
    updateDeleteCategoryBtn();
    loadLiveNews();
  })();
