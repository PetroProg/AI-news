(function() {
    // Application State
    const state = {
      lang: 'ru',
      currentTab: 'news',
      searchDeviceQuery: '',
      deviceCategoryFilter: 'all',
      newsCategoryFilter: 'Украина',
      serverHealth: null,
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
      if (type === 'server') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 003 3h7.5a3 3 0 003-3m-13.5 0V7.5m13.5 6.75V7.5m0 0a3 3 0 00-3-3m3 3a3 3 0 01-3 3H8.25a3 3 0 01-3-3m13.5 0H5.25m0 0A3 3 0 012.25 4.5M12 18.75v3m-3-3v3m6-3v3M6.75 10.5h.008v.008H6.75v-.008zm3.75 0h.008v.008H10.5v-.008z"/></svg>';
      }
      if (type === 'nas') {
        return '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>';
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

      try { renderCategoryPills(); } catch (e) { console.error('Error rendering category pills:', e); }
      try { renderNews(); } catch (e) { console.error('Error rendering news:', e); }
      try { renderDevices(); } catch (e) { console.error('Error rendering devices:', e); }
      try { if (typeof updateVpnUI === 'function') updateVpnUI(); } catch (e) { console.error('Error updating VPN UI:', e); }
      try { renderDnsLog(); } catch (e) { console.error('Error rendering DNS log:', e); }
      try { updateNetworkAnalytics(); } catch (e) { console.error('Error updating network analytics:', e); }
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

      if (tabId === 'devices') {
        loadManagedDevices();
        loadRouterStats();
        loadServerHealth();
      }

      if (tabId === 'vpn') {
        if (typeof loadVpnStatus === 'function') loadVpnStatus();
        if (typeof loadVpnTraffic === 'function') loadVpnTraffic();
        if (typeof loadDnsStats === 'function') loadDnsStats();
        if (typeof loadDnsStatus === 'function') loadDnsStatus();
        if (typeof loadDnsQueryLog === 'function') loadDnsQueryLog();
        setTimeout(() => {
          if (typeof renderCanvasChart === 'function') renderCanvasChart();
        }, 50);
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
        'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80'
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
      ],
      politics: [
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80'
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
        if (t.includes('робот') || t.includes('figure 0') || t.includes('boston dynamics')) {
          return 'Технологии';
        }
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

        const hasUkrCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some(k => t.includes(k));
        if (!hasUkrCore && (
          t.includes('трамп') || t.includes('trump') || t.includes('байден') || t.includes('biden') ||
          t.includes('белый дом') || t.includes('конгресс сша') || t.includes('пентагон') ||
          t.includes('макрон') || t.includes('шольц') || t.includes('мерц') || t.includes('стармер') ||
          t.includes('нетаньяху') || t.includes('израиль') || t.includes('сектор газа') || t.includes('иран') ||
          t.includes('вучич') || t.includes('серби') || t.includes('орбан') || t.includes('венгри') ||
          t.includes('фицо') || t.includes('кндр') || t.includes('си цзиньпин') || t.includes('египет')
        )) {
          return 'Мировая политика';
        }

        if (s.includes('novynaukr') || s.includes('novyna_ukr')) {
          return 'Украина';
        }
      }
      if (!rawCat) return 'IT';
      let c = cleanText(rawCat);
      c = c.replace(/^Категория\s*[\(:]?/i, '').replace(/[\)]+$/g, '').trim();

      const lower = c.toLowerCase();
      if (lower.includes('мировая политика') || lower.includes('политик') || lower.includes('мир') || lower.includes('world')) {
        return 'Мировая политика';
      }
      if (lower.includes('технолог') || lower.includes('technology') || lower.includes('робот') || lower.includes('robot')) {
        return 'Технологии';
      }
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
        'мировая политика': 'Мировая политика',
        'политика': 'Мировая политика',
        'мир': 'Мировая политика',
        'world': 'Мировая политика',
        'новости мира': 'Мировая политика',
        'международные': 'Мировая политика',
        'футбол': 'Футбол',
        'football': 'Футбол',
        'soccer': 'Футбол',
        'f1': 'F1',
        'formula 1': 'F1',
        'формула 1': 'F1',
        'swiss': 'Swiss',
        'швейцария': 'Swiss',
        'технологии': 'Технологии',
        'technology': 'Технологии',
        'технология': 'Технологии',
        'technologies': 'Технологии',
        'роботы': 'Технологии',
        'робототехника': 'Технологии',
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
      if (c.includes('ПОЛИТИК') || c.includes('МИР') || c.includes('WORLD')) return '🌐';
      if (c.includes('ТЕХНОЛОГ') || c.includes('TECHNOLOG') || c.includes('РОБОТ')) return '💡';
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
      if (article.image_url) return String(article.image_url).replace(/&amp;/g, '&');
      if (article.raw_content) {
        const match = article.raw_content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) return String(match[1]).replace(/&amp;/g, '&');
        const posterMatch = article.raw_content.match(/<video[^>]+poster=["']([^"']+)["']/i);
        if (posterMatch && posterMatch[1]) return String(posterMatch[1]).replace(/&amp;/g, '&');
      }

      const text = ((article.title || '') + ' ' + (article.category || '') + ' ' + (article.source || '')).toLowerCase();
      let pool = THEMATIC_IMAGES.tech;

      if (text.includes('swiss') || text.includes('швейцар') || text.includes('lausanne') || text.includes('geneve') || text.includes('vaud') || text.includes('rts') || text.includes('blick')) {
        pool = THEMATIC_IMAGES.swiss;
      } else if (text.includes('политик') || text.includes('трамп') || text.includes('байден') || text.includes('конгресс') || text.includes('белый дом') || text.includes('мир')) {
        pool = THEMATIC_IMAGES.politics;
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
      const btnTop10 = document.getElementById('aside-tab-top10');
      const btnDeep = document.getElementById('aside-tab-deepdive');

      if (!bTop10 || !bDeep) return;

      const activeClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all bg-sky-500 text-white shadow-md flex items-center justify-center gap-1.5';
      const inactiveClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all flex items-center justify-center gap-1.5';

      if (tab === 'deepdive') {
        bTop10.style.display = 'none';
        bDeep.style.display = 'block';
        if (btnTop10) btnTop10.className = inactiveClass;
        if (btnDeep) btnDeep.className = activeClass;
      } else { // 'top10'
        bTop10.style.display = 'block';
        bDeep.style.display = 'none';
        if (btnTop10) btnTop10.className = activeClass;
        if (btnDeep) btnDeep.className = inactiveClass;
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

      if (typeof renderUkraineDigestBanner === 'function') {
        renderUkraineDigestBanner();
      }
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
          ukraineAttacksData = data;
          renderUkraineDigestBanner();
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
 
    
    let ukraineAttacksData = null;

    function renderUkraineDigestBanner() {
      const bannerEl = document.getElementById('ukraine-ai-digest-banner');
      if (!bannerEl) return;

      const isUkraine = (state.newsCategoryFilter === 'Украина' || 
                         (state.newsCategoryFilter && state.newsCategoryFilter.toLowerCase().includes('украин')));

      if (!isUkraine) {
        bannerEl.style.display = 'none';
        return;
      }

      if (!ukraineAttacksData) {
        bannerEl.style.display = 'none';
        loadUkraineAttacksSummary();
        return;
      }

      bannerEl.style.display = 'block';
      const data = ukraineAttacksData;
      const bCount = (data.stats && ((data.stats.ballistics_signals || 0) + (data.stats.missiles_signals || 0))) || 0;
      const dCount = (data.stats && data.stats.drones_signals) || 0;
      const pvoCount = (data.stats && data.stats.air_defense_signals) || 0;
      const windowStr = data.attack_window || 'За последние 24 часа';
      const summaryText = data.summary_text || 'Оперативная обстановка в регионах стабильная.';
      const hotspots = data.hotspots || [];

      const latestSig = (data.recent_signals && data.recent_signals.length > 0) ? data.recent_signals[0] : null;
      const channelUrl = (latestSig && latestSig.url) ? latestSig.url : 'https://t.me/NovynaUKR';

      const currentTag = selectedUkraineTag || 'all';

      bannerEl.innerHTML = `
        <div class="glass-panel rounded-3xl p-5 md:p-6 border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-sky-950/20 shadow-2xl relative overflow-hidden group">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-xl flex items-center justify-center shadow-lg shadow-sky-500/20">🛡️</span>
              <div>
                <h3 class="text-base md:text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <span>AI-Сводка безопасности: главное за сутки</span>
                </h3>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span class="text-xs text-slate-400 font-medium">Время атаки:</span>
                  <span class="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">${windowStr}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <div class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-2 text-xs" title="Баллистические и ракетные угрозы">
                <span class="text-amber-400 font-bold">🚀 Баллистика / Ракеты:</span>
                <span class="font-mono font-bold text-white text-sm">${bCount}</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-2 text-xs" title="Ударные дроны Shahed">
                <span class="text-sky-400 font-bold">🛸 БПЛА / Шахеды:</span>
                <span class="font-mono font-bold text-white text-sm">${dCount}</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-2 text-xs" title="Перехваты силами ПВО">
                <span class="text-emerald-400 font-bold">🛡️ ПВО перехватов:</span>
                <span class="font-mono font-bold text-white text-sm">${pvoCount}</span>
              </div>

              <!-- Channel Link & Refresh Button -->
              <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 group" title="Перейти в Telegram-канал @NovynaUKR">
                <span>В канал</span>
                <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              </a>

              <button id="ukraine-refresh-btn" type="button" onclick="loadUkraineAttacksSummary(true)" class="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition-colors border border-slate-700/60 shadow-sm shrink-0" title="Обновить сводку">
                <svg id="ukraine-refresh-icon" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
              </button>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 text-xs md:text-sm text-slate-200 leading-relaxed">
            <p class="font-medium text-slate-300">${summaryText}</p>
            ${hotspots.length > 0 ? `
              <div class="mt-2.5 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap text-xs">
                <span class="text-slate-400 font-medium">Ключевые направления:</span>
                ${hotspots.map(h => `<span class="px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-semibold">📍 ${h}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Фильтр новостей:</span>
              <button type="button" onclick="filterUkraineByTag('all')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'all' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="all">Все проверенные</button>
              <button type="button" onclick="filterUkraineByTag('дніпро')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'дніпро' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="дніпро">🎯 Дніпро</button>
              <button type="button" onclick="filterUkraineByTag('oon_nato')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'oon_nato' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="oon_nato">🏛️ ООН / НАТО</button>
              <button type="button" onclick="filterUkraineByTag('tck')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'tck' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="tck">🎖️ ТЦК</button>
              <button type="button" onclick="filterUkraineByTag('energy')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'energy' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="energy">⚡ Энергетика</button>
              <button type="button" onclick="filterUkraineByTag('pvo')" class="ukraine-chip px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${currentTag === 'pvo' ? 'bg-sky-500 text-white border border-sky-400 shadow-md shadow-sky-500/20' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'}" data-ukr-tag="pvo">🛡️ Сводка ПВО</button>
            </div>
          </div>
        </div>
      `;
    }
    window.renderUkraineDigestBanner = renderUkraineDigestBanner;

// ==========================================
    // F1 2026 STANDINGS & RACES RESULTS LOGIC
    // ==========================================
    let f1ResultsData = null;
    let selectedF1Tag = 'all';
    let activeF1Tab = 'drivers';
    let lastF1ResultsFetch = 0;

    async function loadF1Results(force = false) {
      const statusEl = document.getElementById('f1-updated-date');
      const top10Container = document.getElementById('f1-block-top10');
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
        if (top10Container && !f1ResultsData) {
          top10Container.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-900/40">Ошибка загрузки Топ-10 гонки</div>`;
        }
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
      renderF1Top10Banner(f1ResultsData.latest_race);
    }

    function renderF1Top10(latestRace) {
      const container = document.getElementById('f1-block-top10');
      if (!container) return;

      if (!latestRace || !latestRace.top10 || latestRace.top10.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет данных о результатах последнего Гран-при</div>`;
        return;
      }

      const gpTitle = cleanText(latestRace.grand_prix || 'Гран-при');

      const itemsHtml = latestRace.top10.map((d, idx) => {
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
        const isMercedes = (d.team || '').toLowerCase().includes('mercedes');
        const isFerrari = (d.team || '').toLowerCase().includes('ferrari');

        let cardClass = 'bg-slate-950/60 border-slate-800/80 hover:border-red-500/50 hover:bg-slate-900/60';
        if (isRedBull || isVerstappen) {
          cardClass = 'bg-red-950/20 border-red-500/40 hover:border-red-400 shadow-sm shadow-red-500/10';
        } else if (isMercedes) {
          cardClass = 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400';
        } else if (isFerrari) {
          cardClass = 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400';
        }

        const pts = d.points ? `<span class="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">+${d.points} PTS</span>` : '';
        const driverName = cleanText(d.driver || 'Пилот');
        const teamName = cleanText(d.team || 'Команда');
        const timeDiff = d.time ? `<span class="font-mono text-[10px] text-emerald-400 font-semibold">${d.time}</span>` : '';

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
              <div class="flex flex-col items-end gap-0.5 shrink-0">
                ${pts}
                ${timeDiff}
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="mb-2 px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <span class="text-[11px] font-bold text-red-300 flex items-center gap-1">
            <span>🏁</span> <span>${gpTitle}</span>
          </span>
          <span class="text-[10px] font-mono text-slate-400">Финишный протокол</span>
        </div>
        ${itemsHtml}
      `;
    }

    function renderF1Top10Banner(latestRace) {
      const banner = document.getElementById('f1-latest-race-banner');
      if (!banner) return;

      const targetCat = (state.newsCategoryFilter || '').toLowerCase();
      const isF1 = targetCat === 'f1' || targetCat.includes('формул') || targetCat.includes('formula');

      if (!isF1 || !latestRace || !latestRace.top10 || latestRace.top10.length === 0) {
        banner.style.display = 'none';
        banner.innerHTML = '';
        return;
      }

      const gpTitle = cleanText(latestRace.grand_prix || 'Гран-при');
      const winner = latestRace.top10[0] || {};
      const winnerName = cleanText(winner.driver || 'Победитель');
      const winnerTeam = cleanText(winner.team || '');

      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="glass-panel p-5 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-900/90 to-slate-950/90 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3.5 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/25 text-red-300 border border-red-500/40 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>Последний турнир F1</span>
                </span>
                <span class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">Топ-10 финиша</span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-white font-heading flex items-center gap-2">
                <span>🏁</span> <span>Гран-при ${gpTitle}</span>
              </h3>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <span>🏆 1-е место:</span>
                <strong class="text-amber-300 font-bold">${winnerName}</strong>
                <span class="text-slate-500 text-[11px]">(${winnerTeam})</span>
              </span>
            </div>
          </div>

          <!-- Top 10 Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 relative z-10">
            ${latestRace.top10.map((d, idx) => {
              const pos = d.pos || (idx + 1);
              let posBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">${pos}</span>`;
              if (pos == 1) posBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-500 text-slate-950 border border-amber-300 shadow-sm shadow-amber-500/50">🥇</span>`;
              else if (pos == 2) posBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-slate-300 text-slate-900 border border-white shadow-sm">🥈</span>`;
              else if (pos == 3) posBadge = `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-amber-700 text-amber-100 border border-amber-600 shadow-sm">🥉</span>`;

              const isRedBull = (d.team || '').toLowerCase().includes('red bull');
              const isVerstappen = (d.driver || '').toLowerCase().includes('verstappen');
              const isMercedes = (d.team || '').toLowerCase().includes('mercedes');
              const isFerrari = (d.team || '').toLowerCase().includes('ferrari');

              let rowClass = 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850';
              if (isRedBull || isVerstappen) rowClass = 'bg-red-950/30 border-red-500/40 shadow-sm shadow-red-500/10';
              else if (isMercedes) rowClass = 'bg-cyan-950/25 border-cyan-500/30';
              else if (isFerrari) rowClass = 'bg-rose-950/25 border-rose-500/30';

              return `
                <div class="p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${rowClass}">
                  <div class="flex items-center gap-2 min-w-0">
                    ${posBadge}
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>${cleanText(d.driver || '')}</span>
                        ${isVerstappen ? '<span class="text-[9px] bg-red-600/40 text-red-300 border border-red-500/50 px-1 rounded font-bold">1</span>' : ''}
                      </div>
                      <div class="text-[10px] text-slate-400 truncate">${cleanText(d.team || '')}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0 text-right">
                    ${d.points ? `<span class="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">+${d.points}</span>` : ''}
                    <span class="font-mono text-[10px] text-emerald-400 font-semibold">${d.time || ''}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
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

      // Races already sorted latest first from server
      const sortedRaces = [...races];

      container.innerHTML = sortedRaces.map((r, idx) => {
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
      if (tab === 'top10') tab = 'drivers';
      activeF1Tab = tab;
      const bDrivers = document.getElementById('f1-block-drivers');
      const bRaces = document.getElementById('f1-block-races');
      const tabDrivers = document.getElementById('f1-tab-drivers');
      const tabRaces = document.getElementById('f1-tab-races');

      const activeClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all bg-red-600 text-white shadow-md flex items-center justify-center gap-1.5';
      const inactiveClass = 'flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-1.5';

      if (bDrivers) bDrivers.style.display = (tab === 'drivers') ? 'block' : 'none';
      if (bRaces) bRaces.style.display = (tab === 'races') ? 'block' : 'none';

      if (tabDrivers) tabDrivers.className = (tab === 'drivers') ? activeClass : inactiveClass;
      if (tabRaces) tabRaces.className = (tab === 'races') ? activeClass : inactiveClass;
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
    window.renderF1Top10Banner = renderF1Top10Banner;

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
        if (headerTitle && activeFootballTournament === tourn) {
          headerTitle.textContent = `${data.flag || '⚽'} ${data.title || 'Футбол'}`;
        }
        if (badgeEl && activeFootballTournament === tourn) {
          badgeEl.textContent = data.title || 'Футбол';
        }
        if (sourceLink && data.url && activeFootballTournament === tourn) {
          sourceLink.href = data.url;
        }

        if (activeFootballTournament === tourn) {
          renderFootballContent();
        }
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

    function getFilteredNationsGroups(groups, tier) {
      if (!groups || groups.length === 0 || tier === 'all') return groups || [];
      const tierLetter = tier.toUpperCase();
      return groups.filter(g => {
        const raw = (g.group || '').toUpperCase();
        if (tierLetter === 'A') return /[АA][1-4]/.test(raw) || raw.includes(' А') || raw.includes(' A');
        if (tierLetter === 'B') return /[ВB][1-4]/.test(raw) || raw.includes(' В') || raw.includes(' B');
        if (tierLetter === 'C') return /[СC][1-4]/.test(raw) || raw.includes(' С') || raw.includes(' C');
        if (tierLetter === 'D') return /[DД][1-4]/.test(raw) || raw.includes(' D') || raw.includes(' Д');
        return true;
      });
    }

    function renderFootballContent() {
      const tourn = activeFootballTournament || 'laliga';
      const data = footballResultsData[tourn];
      if (!data) return;

      const headerTitle = document.getElementById('football-header-title');
      const badgeEl = document.getElementById('football-tournament-badge');
      const sourceLink = document.getElementById('football-source-link');

      if (headerTitle) {
        headerTitle.textContent = `${data.flag || '⚽'} ${data.title || 'Футбол'}`;
      }
      if (badgeEl) {
        badgeEl.textContent = data.title || 'Футбол';
      }
      if (sourceLink && data.url) {
        sourceLink.href = data.url;
      }

      renderFootballStandings(data);

      let matchesToRender = data.matches || [];
      if (tourn === 'nations' && selectedNationsTier !== 'all' && data.groups && data.groups.length > 0) {
        const filteredGroups = getFilteredNationsGroups(data.groups, selectedNationsTier);
        const tierTeams = new Set();
        filteredGroups.forEach(g => {
          (g.standings || []).forEach(s => {
            if (s.team) {
              tierTeams.add(cleanText(s.team).toLowerCase());
            }
          });
        });

        matchesToRender = matchesToRender.filter(m => {
          const home = cleanText(m.home || '').toLowerCase();
          const away = cleanText(m.away || '').toLowerCase();
          return tierTeams.has(home) || tierTeams.has(away);
        });
      }

      // Filter out matches without a result (unplayed / scheduled / "-:-")
      matchesToRender = matchesToRender.filter(m => {
        if (!m || !m.score) return false;
        const s = m.score.trim();
        return s !== '-:-' && s !== 'vs' && /\d+/.test(s);
      });

      // Sort from newest to oldest, keeping live matches at the very top
      matchesToRender.sort((a, b) => {
        if (a.is_live && !b.is_live) return -1;
        if (!a.is_live && b.is_live) return 1;
        const tsA = a.ts || parseFootballMatchDate(a.date);
        const tsB = b.ts || parseFootballMatchDate(b.date);
        return tsB - tsA;
      });

      renderFootballMatches(matchesToRender);
    }

    function renderFootballStandings(data) {
      const container = document.getElementById('football-block-standings');
      if (!container) return;

      // Check if tournament has group tables (Nations League or multi-group)
      if (data.groups && data.groups.length > 0) {
        let groupsToRender = getFilteredNationsGroups(data.groups, activeFootballTournament === 'nations' ? selectedNationsTier : 'all');

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

    function parseFootballMatchDate(dStr) {
      if (!dStr) return 0;
      const match = dStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
      if (!match) return 0;
      let [, day, mon, yr, hr, min] = match;
      let y = parseInt(yr, 10);
      if (y < 100) y += 2000;
      return new Date(y, parseInt(mon, 10) - 1, parseInt(day, 10), hr ? parseInt(hr, 10) : 12, min ? parseInt(min, 10) : 0).getTime();
    }

    function renderFootballMatches(matches) {
      const container = document.getElementById('football-block-matches');
      if (!container) return;

      if (!matches || matches.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 p-4 text-center">Нет завершенных или текущих матчей</div>`;
        return;
      }

      container.innerHTML = matches.map(m => {
        const home = cleanText(m.home || '—');
        const score = m.score || 'vs';
        const away = cleanText(m.away || '—');
        const date = m.date || '';
        const isLive = Boolean(m.is_live);

        const isBarcaMatch = (home + ' ' + away).toLowerCase().includes('барселона');
        const cardClass = isLive 
          ? 'bg-emerald-950/25 border-emerald-500/50 shadow-sm shadow-emerald-950/40 ring-1 ring-emerald-500/20' 
          : (isBarcaMatch ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700');

        const scoreClass = isLive
          ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40 font-black animate-pulse'
          : 'text-emerald-400 bg-slate-900/80 border-slate-800 font-black';

        return `
          <div class="p-2.5 rounded-2xl border transition-all ${cardClass}">
            <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <div class="flex items-center gap-1.5">
                <span class="flex items-center gap-1 font-bold text-slate-300">
                  <span>⚽</span> <span>Матч</span>
                </span>
                ${isLive ? `
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wide uppercase">
                    <span class="relative flex h-1.5 w-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    В игре
                  </span>
                ` : ''}
              </div>
              <span class="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">${date}</span>
            </div>
            <div class="flex items-center justify-between text-xs py-1">
              <div class="w-2/5 font-semibold text-right truncate ${home.toLowerCase().includes('барселона') ? 'text-amber-300 font-bold' : 'text-white'}">
                ${home}
              </div>
              <div class="w-1/5 text-center font-mono ${scoreClass} text-xs py-0.5 px-1.5 rounded border shrink-0">
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
    // CUSTOM DELETE CONFIRMATION MODAL
    // ==========================================
    function showDeleteConfirmModal({
      title = 'Удалить новость?',
      snippet = '',
      desc = 'Запись будет навсегда стерта из базы данных.',
      confirmText = 'Удалить',
      onConfirm
    }) {
      const modal = document.getElementById('delete-confirm-modal');
      if (!modal) {
        if (window.confirm(`${title}\n\n${snippet}\n\n${desc}`)) {
          if (typeof onConfirm === 'function') onConfirm();
        }
        return;
      }

      const titleEl = document.getElementById('delete-modal-title');
      const snippetEl = document.getElementById('delete-modal-snippet');
      const descEl = document.getElementById('delete-modal-desc');
      const cancelBtn = document.getElementById('delete-modal-cancel');
      const confirmBtn = document.getElementById('delete-modal-confirm');

      if (titleEl) titleEl.textContent = title;
      if (snippetEl) {
        if (snippet && snippet.trim()) {
          snippetEl.textContent = snippet;
          snippetEl.classList.remove('hidden');
        } else {
          snippetEl.classList.add('hidden');
        }
      }
      if (descEl) descEl.textContent = desc;
      if (confirmBtn) {
        const span = confirmBtn.querySelector('span');
        if (span) span.textContent = confirmText;
        else confirmBtn.textContent = confirmText;
      }

      // Show modal
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      void modal.offsetWidth;
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');

      const panel = modal.querySelector('.glass-panel');
      if (panel) {
        panel.classList.remove('scale-95');
        panel.classList.add('scale-100');
      }

      function closeModal() {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        if (panel) {
          panel.classList.remove('scale-100');
          panel.classList.add('scale-95');
        }
        cleanup();
        setTimeout(() => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }, 200);
      }

      function handleCancel(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        closeModal();
      }

      async function handleConfirm(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (confirmBtn) {
          confirmBtn.disabled = true;
          confirmBtn.classList.add('opacity-60', 'pointer-events-none');
        }
        try {
          if (typeof onConfirm === 'function') {
            await onConfirm();
          }
        } finally {
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-60', 'pointer-events-none');
          }
          closeModal();
        }
      }

      function handleBackdrop(e) {
        if (e.target === modal) {
          handleCancel(e);
        }
      }

      function handleKey(e) {
        if (e.key === 'Escape') {
          handleCancel(e);
        } else if (e.key === 'Enter') {
          if (document.activeElement !== cancelBtn) {
            handleConfirm(e);
          }
        }
      }

      function cleanup() {
        if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
        if (confirmBtn) confirmBtn.removeEventListener('click', handleConfirm);
        modal.removeEventListener('click', handleBackdrop);
        document.removeEventListener('keydown', handleKey);
      }

      if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
      if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
      modal.addEventListener('click', handleBackdrop);
      document.addEventListener('keydown', handleKey);

      if (cancelBtn) cancelBtn.focus();
    }

    window.showDeleteConfirmModal = showDeleteConfirmModal;

    // ==========================================
    // DELETE CURRENT CATEGORY NEWS HANDLER
    // ==========================================
    function updateDeleteCategoryBtn() {
      const btn = document.getElementById('delete-category-news-btn');
      const textSpan = document.getElementById('delete-category-btn-text');
      if (!btn || !textSpan) return;

      const activeCat = state.newsCategoryFilter || 'Украина';
      const isAll = (activeCat === 'all' || activeCat === 'Все');
      
      if (isAll) {
        textSpan.textContent = 'Очистить категорию «Украина»';
        btn.title = 'Удалить новости категории «Украина» из базы данных';
      } else {
        textSpan.textContent = `Очистить «${activeCat}»`;
        btn.title = `Удалить все новости категории «${activeCat}» из базы данных`;
      }
    }

    async function deleteCurrentCategoryNews() {
      const activeCat = state.newsCategoryFilter || 'Украина';
      const isAll = (activeCat === 'all' || activeCat === 'Все');
      const catLabel = isAll ? 'новости категории «Украина»' : `новости категории «${activeCat}»`;

      showDeleteConfirmModal({
        title: 'Очистить категорию?',
        snippet: `Вы собираетесь удалить все ${catLabel} из базы данных.`,
        desc: 'Это действие необратимо. Все новости в этой категории будут стерты.',
        confirmText: 'Очистить',
        onConfirm: async () => {
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
      });
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
      if (!cat || cat === 'all' || cat === 'Все') {
        cat = 'Украина';
      }
      state.newsCategoryFilter = cat;
      const isAll = false;
      
      const isIT = (state.newsCategoryFilter === 'IT' || 
                    state.newsCategoryFilter === 'IT & Аналитика' || 
                    state.newsCategoryFilter.toLowerCase() === 'it' ||
                    state.newsCategoryFilter.toLowerCase() === 'it & аналитика' ||
                    state.newsCategoryFilter.toLowerCase() === 'development' ||
                    state.newsCategoryFilter.toLowerCase() === 'programming' ||
                    state.newsCategoryFilter.toLowerCase() === 'разработка' ||
                    state.newsCategoryFilter.toLowerCase() === 'языки программирования');

      const isGaming = (state.newsCategoryFilter === 'CS2' || 
                        state.newsCategoryFilter === 'Игры & Киберспорт' || 
                        state.newsCategoryFilter.toLowerCase().includes('игры') || 
                        state.newsCategoryFilter.toLowerCase().includes('киберспорт') || 
                        state.newsCategoryFilter.toLowerCase().includes('gaming') || 
                        state.newsCategoryFilter.toLowerCase().includes('cs'));

      const isUkraine = (state.newsCategoryFilter === 'Украина' || 
                         state.newsCategoryFilter.toLowerCase().includes('украин') || 
                         state.newsCategoryFilter.toLowerCase().includes('україна') || 
                         state.newsCategoryFilter.toLowerCase().includes('ukraine'));

      const isAI = (state.newsCategoryFilter === 'AI & Нейросети' || 
                    state.newsCategoryFilter.toLowerCase().includes('ai') || 
                    state.newsCategoryFilter.toLowerCase().includes('нейро'));

      const isLinux = (state.newsCategoryFilter === 'DevOps & Linux' || 
                       state.newsCategoryFilter.toLowerCase().includes('devops') || 
                       state.newsCategoryFilter.toLowerCase().includes('linux'));

      const isF1 = (state.newsCategoryFilter === 'F1' || 
                    state.newsCategoryFilter.toLowerCase() === 'f1' ||
                    state.newsCategoryFilter.toLowerCase().includes('формула') ||
                    state.newsCategoryFilter.toLowerCase().includes('formula'));

      const isFootball = (state.newsCategoryFilter === 'Футбол' || 
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
      if (digestAside) digestAside.style.display = 'none';
      if (esportsAside) esportsAside.style.display = isGaming ? 'block' : 'none';
      if (ukraineAside) ukraineAside.style.display = 'none';
      if (aiAside) aiAside.style.display = 'none';
      if (linuxAside) linuxAside.style.display = 'none';
      if (f1Aside) f1Aside.style.display = isF1 ? 'block' : 'none';
      if (footballAside) footballAside.style.display = isFootball ? 'block' : 'none';

      if (langBar) {
        langBar.style.display = isIT ? 'flex' : 'none';
      }
      const hasAside = isIT || isGaming || isF1 || isFootball;
      const newsContainer = document.getElementById('news-container');
      if (mainCol) {
        if (hasAside) {
          mainCol.className = 'order-1 lg:order-1 lg:col-span-7 xl:col-span-8 space-y-6 w-full';
        } else {
          mainCol.className = 'order-1 lg:order-1 lg:col-span-12 space-y-6 w-full';
        }
      }
      if (newsContainer) {
        if (hasAside) {
          newsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6';
        } else {
          newsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6';
        }
      }

      if (isGaming) {
        loadHLTVRanking();
      }
      if (isUkraine) {
        loadUkraineAttacksSummary();
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

      // Ensure active category pill is smoothly centered in the scroll view
      const pillContainer = document.getElementById('category-pills-container');
      if (pillContainer) {
        const activePill = pillContainer.querySelector(`[data-category="${cat}"]`);
        if (activePill) {
          activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
      setTimeout(updateCategoryScrollButtons, 350);
    };

    function isArticleEligibleForDisplay(item, targetCategory, targetLang) {
      // Completely exclude security / cybersecurity articles and unwanted general tech
      const rawCat = (item.category || '').toLowerCase();
      const itemCat = (item._displayCategory || normalizeCategory(item.category, item)).toLowerCase();
      const rawTitle = (item.title || '').toLowerCase();
      if (itemCat.includes('безопас') || itemCat.includes('cybersec') || itemCat.includes('security') ||
          rawCat.includes('безопас') || rawCat.includes('cybersec') || rawCat.includes('security') ||
          rawTitle.includes('уязвим') || rawTitle.includes('cve-') ||
          itemCat.includes('общие') || itemCat.includes('general tech')) {
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

      // Safeguard: Never display untranslated Ukrainian characters in Russian interface
      const curLang = state.lang || 'ru';
      const rawSummary = (item.summaries && (item.summaries[curLang] || item.summaries.ru || item.summaries.en || item.summaries.fr)) || item.summary || item.short_summary || '';
      if (curLang === 'ru' && (/[ієїґІЄЇҐ]/.test(item.title || '') || /[ієїґІЄЇҐ]/.test(rawSummary))) {
        return false;
      }

      // Require a valid AI summary
      const hasSummary = Boolean(rawSummary);
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
        const itSummary = (item.summaries && (item.summaries[curLang] || item.summaries.ru || item.summaries.en || item.summaries.fr)) || item.summary || item.short_summary || '';
        if (!itSummary) return false;

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
        // Suppress micro-alerts completely from main card feed (they are in the top digest and aside)
        if (item.is_operational_alert) {
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
            lowerCat.includes('общие') || lowerCat.includes('general tech')) {
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
      const essentialCats = ['Футбол', 'F1', 'IT', 'Технологии', 'CS2', 'Украина', 'Мировая политика', 'Swiss', 'AI & Нейросети', 'DevOps & Linux'];
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
      const categories = sortedCategories;

      container.innerHTML = categories.map(cat => {
        const count = catCounts[cat] || 0;
        const isActive = Boolean(state.newsCategoryFilter && state.newsCategoryFilter.toLowerCase() === cat.toLowerCase());
        const emoji = getCategoryEmoji(cat);

        const activeClass = isActive
          ? 'bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/25 border-sky-400'
          : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/80 font-medium';

        return `
          <button type="button" data-category="${cat}" onclick="setDynamicCategory('${cat.replace(/'/g, "\\'")}')" class="news-cat-pill px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all shrink-0 border ${activeClass}">
            <span>${emoji}</span>
            <span>${cat}</span>
            <span class="news-cat-pill-count text-[10px] opacity-75 bg-black/30 px-1.5 py-0.5 rounded-md font-mono">${count}</span>
          </button>
        `;
      }).join('');

      initCategoryPillsScroll();
      requestAnimationFrame(updateCategoryScrollButtons);
    }

    // ==========================================
    // CATEGORY PILLS HORIZONTAL SCROLL CONTROLS
    // ==========================================
    function scrollCategoryPills(offset) {
      const container = document.getElementById('category-pills-container');
      if (!container) return;
      container.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateCategoryScrollButtons, 320);
    }

    function updateCategoryScrollButtons() {
      const container = document.getElementById('category-pills-container');
      const leftBtn = document.getElementById('category-scroll-left-btn');
      const rightBtn = document.getElementById('category-scroll-right-btn');
      const fadeLeft = document.getElementById('category-scroll-fade-left');
      const fadeRight = document.getElementById('category-scroll-fade-right');

      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      const hasOverflow = maxScroll > 8;

      if (!hasOverflow) {
        if (leftBtn) {
          leftBtn.classList.add('opacity-0', 'pointer-events-none');
          leftBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
        if (rightBtn) {
          rightBtn.classList.add('opacity-0', 'pointer-events-none');
          rightBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
        if (fadeLeft) fadeLeft.classList.add('opacity-0');
        if (fadeRight) fadeRight.classList.add('opacity-0');
        return;
      }

      // Left button & fade mask
      if (container.scrollLeft > 10) {
        if (leftBtn) {
          leftBtn.classList.remove('opacity-0', 'pointer-events-none');
          leftBtn.classList.add('opacity-100', 'pointer-events-auto');
        }
        if (fadeLeft) fadeLeft.classList.remove('opacity-0');
      } else {
        if (leftBtn) {
          leftBtn.classList.add('opacity-0', 'pointer-events-none');
          leftBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
        if (fadeLeft) fadeLeft.classList.add('opacity-0');
      }

      // Right button & fade mask
      if (container.scrollLeft < maxScroll - 10) {
        if (rightBtn) {
          rightBtn.classList.remove('opacity-0', 'pointer-events-none');
          rightBtn.classList.add('opacity-100', 'pointer-events-auto');
        }
        if (fadeRight) fadeRight.classList.remove('opacity-0');
      } else {
        if (rightBtn) {
          rightBtn.classList.add('opacity-0', 'pointer-events-none');
          rightBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
        if (fadeRight) fadeRight.classList.add('opacity-0');
      }
    }

    function initCategoryPillsScroll() {
      const container = document.getElementById('category-pills-container');
      if (!container || container.dataset.scrollInit === 'true') {
        updateCategoryScrollButtons();
        return;
      }
      container.dataset.scrollInit = 'true';

      container.addEventListener('scroll', () => {
        updateCategoryScrollButtons();
      }, { passive: true });

      window.addEventListener('resize', () => {
        updateCategoryScrollButtons();
      });

      // Mouse wheel horizontal scrolling (scroll wheel anywhere over pills scrolls left/right)
      container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY * 1.2;
          updateCategoryScrollButtons();
        }
      }, { passive: false });

      // Click & Drag to scroll for desktop mouse users
      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let hasDragged = false;

      container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        startX = e.pageX - container.offsetLeft;
        startScrollLeft = container.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        setTimeout(() => { hasDragged = false; }, 60);
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        container.scrollLeft = startScrollLeft - walk;
        updateCategoryScrollButtons();
      });

      // Avoid accidental category switch click if user was dragging
      container.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      updateCategoryScrollButtons();
    }

    window.scrollCategoryPills = scrollCategoryPills;
    window.updateCategoryScrollButtons = updateCategoryScrollButtons;
    window.initCategoryPillsScroll = initCategoryPillsScroll;

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
            setDynamicCategory(state.newsCategoryFilter || 'Украина');
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

      // Update F1 Latest Grand Prix Top 10 Results banner
      if (f1ResultsData && f1ResultsData.latest_race) {
        renderF1Top10Banner(f1ResultsData.latest_race);
      } else {
        const banner = document.getElementById('f1-latest-race-banner');
        if (banner) banner.style.display = 'none';
      }

      // Update Ukraine 24h AI Digest Banner
      if (typeof renderUkraineDigestBanner === 'function') {
        renderUkraineDigestBanner();
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
        const catName = state.newsCategoryFilter || 'Украина';
        const catLower = catName.toLowerCase();

        if (catLower === 'f1' || catLower.includes('формул') || catLower.includes('formula')) {
          msg = 'В категории «F1» новости отбираются по ключевым темам (Red Bull, Verstappen, Leclerc, Hamilton, Champion). Свежие результаты гонок и зачет пилотов 2026 доступны в панели справа.';
        } else if (catLower === 'it' || catLower.includes('it & аналитика') || catLower.includes('development') || catLower.includes('programming')) {
          msg = 'В этой выборке нет новостей (для IT & Аналитики действует строгий фильтр: оценка ≥ 7.0)';
        } else if (catLower === 'cs2' || catLower.includes('игры') || catLower.includes('gaming')) {
          msg = 'В категории «CS2» действует фильтр качества (оценка ≥ 7.0). Актуальный рейтинг HLTV доступен в панели справа.';
        } else if (catLower.includes('мировая политика') || catLower.includes('политик') || catLower === 'мир') {
          msg = 'В категории «Мировая политика» новости отбираются по международным событиям, выборам и геополитике.';
        } else if (catLower.includes('украин') || catLower.includes('ukraine')) {
          msg = 'В категории «Украина» отображаются проверенные новости. Оперативная сводка атак и ПВО доступна в панели справа.';
        }

        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-3xl p-6 border border-slate-800">
            <span class="text-3xl block mb-2">📰</span>
            <p class="text-sm font-semibold text-slate-300 max-w-xl mx-auto leading-relaxed">${msg}</p>
            <button type="button" onclick="filterByLanguage('all'); setDynamicCategory('Украина');" class="mt-3 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all">
              Перейти к категории «Украина»
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
          ? `<span class="p-1 rounded-xl text-[11px] font-bold bg-amber-500/30 backdrop-blur-md text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-500/25 flex items-center justify-center animate-pulse" title="Приоритет">⭐</span>`
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
              <button type="button" class="btn-open-video-zoom p-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/50 shadow-lg flex items-center justify-center cursor-pointer pointer-events-auto transition-colors" title="Смотреть видео">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              ${priorityBadge}
              ${practiceBadge}
              ${scoreBadge}
            </div>

            <!-- Top Right Zoom Button for Video -->
            <div class="absolute top-3 right-3 z-10">
              <button type="button" class="btn-open-video-zoom p-1.5 rounded-xl bg-slate-950/85 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-400/30 hover:border-sky-300 shadow-xl flex items-center justify-center backdrop-blur-md transition-all cursor-pointer" title="Увеличить">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
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
                  <button type="button" class="btn-delete-article group/del relative p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/50 shadow-sm hover:shadow-lg hover:shadow-rose-950/40 text-xs font-semibold flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer" data-id="${article.id}" title="Удалить новость из базы">
                    <svg class="w-4 h-4 transition-transform duration-200 group-hover/del:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                  </button>
                  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="group/src p-2 rounded-xl bg-slate-900/80 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-800 hover:border-sky-500/50 shadow-sm hover:shadow-lg hover:shadow-sky-950/40 text-xs font-semibold flex items-center justify-center transition-all duration-200 active:scale-95" title="Читать в источнике">
                    <svg class="w-4 h-4 transition-transform duration-200 group-hover/src:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        const deleteBtn = card.querySelector('.btn-delete-article');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = article.id;
            const articleTitle = article.title || 'Новость';

            showDeleteConfirmModal({
              title: 'Удалить эту новость?',
              snippet: articleTitle,
              desc: 'Запись будет безвозвратно удалена из базы данных.',
              confirmText: 'Удалить',
              onConfirm: async () => {
                deleteBtn.disabled = true;
                deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
                try {
                  const resp = await fetch(`/api/news/${id}`, { method: 'DELETE' });
                  if (resp.ok) {
                    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
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
                    if (typeof showToast === 'function') {
                      showToast('Ошибка при удалении', errData.detail || 'Не удалось удалить новость', 'danger');
                    }
                    deleteBtn.disabled = false;
                    deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                  }
                } catch (err) {
                  console.error('Delete error:', err);
                  if (typeof showToast === 'function') {
                    showToast('Ошибка сети', 'Не удалось связаться с сервером', 'danger');
                  }
                  deleteBtn.disabled = false;
                  deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
              }
            });
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
    // Router & Network Analytics
    async function loadRouterStats() {
      try {
        const res = await fetch('/api/router/stats');
        if (!res.ok) return;
        const data = await res.json();
        const p = document.getElementById('metric-protection');
        const pSub = document.getElementById('metric-protection-sub');
        const a = document.getElementById('metric-attacks');
        const aSub = document.getElementById('metric-attacks-sub');
        const s = document.getElementById('metric-speed');
        const sSub = document.getElementById('metric-speed-sub');
        const r = document.getElementById('metric-remote');
        const rSub = document.getElementById('metric-remote-sub');

        if (p) p.textContent = data.uptime || "10д 22ч";
        if (pSub) pSub.textContent = "petroprog • Ubuntu Server";
        
        const activeOnline = state.devices ? state.devices.filter(d => d.is_online).length : (data.tailscale_online || 3);
        if (a) a.textContent = `${activeOnline} в сети`;
        if (aSub) aSub.textContent = `Пиров: ${data.tailscale_peers || 4} • Mesh`;

        if (s) s.textContent = `↓ ${data.traffic_rx_gb || 5.1} GB`;
        if (sSub) sSub.textContent = `↑ ${data.traffic_tx_gb || 0.7} GB (wlp2s0)`;

        if (r) r.textContent = data.is_online ? "FRITZ!Box" : "Offline";
        if (rSub) rSub.textContent = data.is_online ? `192.168.178.1 • ${data.ping_ms || 2} ms` : "192.168.178.1 • Отключен";
      } catch (e) {
        console.error("Failed to load router stats:", e);
      }
    }

    function updateNetworkAnalytics() {
      loadRouterStats();
    }

    // ==========================================
    // SERVER HEALTH & SERVICES MONITORING
    // ==========================================
    async function loadServerHealth() {
      try {
        const res = await fetch('/api/server/health');
        if (!res.ok) throw new Error("API returned " + res.status);
        const data = await res.json();
        state.serverHealth = data;
        updateServerHealthUI();
      } catch (err) {
        console.warn("Could not load /api/server/health:", err);
      }
    }

    function updateServerHealthUI() {
      if (!state.serverHealth) return;
      const h = state.serverHealth;

      // Update Card 1 in top analytics
      const p = document.getElementById('metric-protection');
      const pSub = document.getElementById('metric-protection-sub');
      if (p && h.uptime) p.textContent = h.uptime;
      if (pSub && h.cpu && h.memory) {
        pSub.textContent = `CPU ${h.cpu.percent}% • RAM ${h.memory.percent}% • Ubuntu`;
      }

      // Update inside Server Node Card if elements exist
      const cpuText = document.getElementById('srv-cpu-text');
      const cpuBar = document.getElementById('srv-cpu-bar');
      const cpuTemp = document.getElementById('srv-cpu-temp');
      if (cpuText && h.cpu) cpuText.textContent = `${h.cpu.percent}%`;
      if (cpuBar && h.cpu) {
        cpuBar.style.width = `${Math.min(100, Math.max(5, h.cpu.percent))}%`;
        if (h.cpu.percent > 80) {
          cpuBar.className = 'h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500';
        } else {
          cpuBar.className = 'h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500';
        }
      }
      if (cpuTemp && h.cpu?.temp_c) cpuTemp.textContent = `${h.cpu.temp_c}°C`;

      const ramText = document.getElementById('srv-ram-text');
      const ramBar = document.getElementById('srv-ram-bar');
      if (ramText && h.memory) {
        ramText.innerHTML = `${h.memory.percent}% <span class="text-slate-400 text-[10px] font-normal">(${h.memory.used_gb} / ${h.memory.total_gb} GB)</span>`;
      }
      if (ramBar && h.memory) {
        ramBar.style.width = `${Math.min(100, Math.max(5, h.memory.percent))}%`;
        if (h.memory.percent > 85) {
          ramBar.className = 'h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500';
        } else {
          ramBar.className = 'h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500';
        }
      }

      const diskText = document.getElementById('srv-disk-text');
      const diskBar = document.getElementById('srv-disk-bar');
      if (diskText && h.disk) {
        diskText.innerHTML = `${h.disk.percent}% <span class="text-slate-400 text-[10px] font-normal">(${h.disk.used_gb} / ${h.disk.total_gb} GB)</span>`;
      }
      if (diskBar && h.disk) diskBar.style.width = `${Math.min(100, Math.max(5, h.disk.percent))}%`;

      const upEl = document.getElementById('srv-uptime-text');
      if (upEl && h.uptime) upEl.textContent = `⏱️ ${h.uptime}`;

      const loadEl = document.getElementById('srv-load-text');
      if (loadEl && h.load) loadEl.textContent = `📈 Load: ${h.load.min1}`;

      const batEl = document.getElementById('srv-battery-text');
      if (batEl && h.battery) batEl.textContent = `🔋 ${h.battery.status || (h.battery.level + '%')}`;

      // Update service status dots if elements exist
      if (Array.isArray(h.services)) {
        h.services.forEach(s => {
          const dot = document.getElementById(`srv-status-dot-${s.id}`);
          if (dot) {
            dot.className = s.online 
              ? 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' 
              : 'w-1.5 h-1.5 rounded-full bg-rose-500';
          }
        });
      }
    }

    window.loadServerHealth = loadServerHealth;
    window.updateServerHealthUI = updateServerHealthUI;

    // Load Live Devices from Server API
    async function loadManagedDevices() {
      try {
        const res = await fetch('/api/devices');
        if (!res.ok) throw new Error("API returned " + res.status);
        const data = await res.json();
        if (data && Array.isArray(data.devices)) {
          state.devices = data.devices.map(d => ({
            id: d.id,
            key_id: d.key_id,
            name: d.name,
            category: d.category || 'computers',
            icon: d.icon || 'laptop',
            ip: d.ip || '',
            tailscale_ip: d.tailscale_ip || '',
            mac: d.mac || '',
            vendor: d.vendor || '',
            location: d.location || '',
            connection: d.connection || (d.ip ? 'LAN / Wi-Fi' : 'Tailscale Mesh'),
            battery_level: d.battery_level,
            battery_charging: d.battery_charging,
            battery_updated_at: d.battery_updated_at,
            is_online: d.is_online,
            ping_ms: d.ping_ms,
            last_seen: d.last_seen,
            paused: false,
            qos: 'high',
            parental: false,
            dataToday: d.is_online ? 'Активен' : '—'
          }));
          renderDevices();
          loadRouterStats();
          loadServerHealth();
        }
      } catch (err) {
        console.warn("Could not fetch /api/devices, keeping current devices:", err);
      }
    }

    function formatBatteryTime(isoString) {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 2) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;

        const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return `сегодня ${timeStr}`;

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) {
          return `вчера ${timeStr}`;
        }

        const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        return `${dateStr} ${timeStr}`;
      } catch (e) {
        return '';
      }
    }

    // ==========================================
    // DEVICE TELEMETRY & SERVICES METADATA
    // ==========================================
    function getDeviceTelemetryAndServices(device, serverHealth) {
      const key = device.key_id || '';
      const isOnline = device.is_online && !device.paused;
      const isServer = key === 'server_node' || (device.name && device.name.toLowerCase().includes('сервер'));
      const currentHost = window.location.hostname || device.tailscale_ip || device.ip || '100.107.4.120';
      const targetHost = device.tailscale_ip || device.ip || currentHost;

      // 1. Ноутбук-сервер (Real live data from /api/server/health)
      if (isServer) {
        const h = serverHealth || {
          cpu: { percent: 45, temp_c: 52, name: 'Intel Celeron N3060' },
          memory: { percent: 43, used_gb: 1.4, total_gb: 3.2 },
          disk: { percent: 40, used_gb: 37, total_gb: 98 },
          battery: { level: 100, status: 'Full (Сеть)' },
          load: { min1: 1.35 },
          uptime: '17д 19ч',
          services: [
            { id: 'ainews', online: true },
            { id: 'glances', online: true },
            { id: 'ollama', online: true },
            { id: 'rssbridge', online: true }
          ]
        };

        return {
          telemetryTitle: 'МОНИТОРИНГ РЕСУРСОВ СЕРВЕРА',
          liveBadge: isOnline ? 'live' : 'offline',
          bars: [
            {
              label: 'CPU:',
              badge: h.cpu?.temp_c ? `${h.cpu.temp_c}°C` : '52°C',
              badgeColor: 'amber',
              valueText: `${h.cpu?.percent ?? 0}%`,
              percent: h.cpu?.percent ?? 0,
              color: 'from-sky-500 to-indigo-500',
              idPrefix: 'srv-cpu'
            },
            {
              label: 'RAM:',
              badge: null,
              valueText: `${h.memory?.percent ?? 0}% <span class="text-slate-400 text-[10px] font-normal">(${h.memory?.used_gb ?? '1.4'} / ${h.memory?.total_gb ?? '3.2'} GB)</span>`,
              percent: h.memory?.percent ?? 0,
              color: 'from-emerald-500 to-teal-400',
              idPrefix: 'srv-ram'
            },
            {
              label: 'Диск SSD:',
              badge: null,
              valueText: `${h.disk?.percent ?? 0}% <span class="text-slate-400 text-[10px] font-normal">(${h.disk?.used_gb ?? '37'} / ${h.disk?.total_gb ?? '98'} GB)</span>`,
              percent: h.disk?.percent ?? 0,
              color: 'from-purple-500 to-pink-500',
              idPrefix: 'srv-disk'
            }
          ],
          meta: [
            { icon: '⏱', text: h.uptime || '17д 19ч', title: 'Время работы без перезагрузки' },
            { icon: '📈', text: `Load: ${h.load?.min1 !== undefined ? h.load.min1 : '1.35'}`, title: 'Load Average' },
            { icon: '🔋', text: h.battery?.status || 'Full (Сеть)', title: 'Питание сервера' }
          ],
          servicesTitle: 'СЛУЖБЫ СЕРВЕРА (БЫСТРЫЙ ПЕРЕХОД)',
          servicesSub: 'порт-форвардинг активен',
          services: [
            {
              id: 'ainews',
              name: 'AI News',
              icon: '🤖',
              port: ':8000',
              url: `http://${currentHost}:8000`,
              online: true,
              hoverColor: 'sky'
            },
            {
              id: 'glances',
              name: 'Glances',
              icon: '📊',
              port: ':61208',
              url: `http://${currentHost}:61208`,
              online: true,
              hoverColor: 'emerald'
            },
            {
              id: 'ollama',
              name: 'Ollama',
              icon: '🦙',
              port: ':11434',
              url: `http://${currentHost}:11434`,
              online: true,
              hoverColor: 'purple'
            },
            {
              id: 'rssbridge',
              name: 'RSS-Bridge',
              icon: '🌐',
              port: ':3000',
              url: `http://${currentHost}:3000`,
              online: true,
              hoverColor: 'amber'
            }
          ],
          footerAction: {
            text: 'Glances ↗',
            url: `http://${currentHost}:61208`,
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
            color: 'emerald'
          }
        };
      }

      // 2. Основной ПК
      if (key === 'main_pc' || (device.name && device.name.includes('Основной ПК'))) {
        return {
          telemetryTitle: 'МОНИТОРИНГ И ПАРАМЕТРЫ СИСТЕМЫ',
          liveBadge: isOnline ? 'активен' : 'offline',
          bars: [
            {
              label: 'CPU:',
              badge: isOnline ? '42°C' : '—',
              badgeColor: 'sky',
              valueText: isOnline ? '24%' : '0%',
              percent: isOnline ? 24 : 0,
              color: 'from-sky-500 to-indigo-500'
            },
            {
              label: 'RAM DDR4:',
              badge: null,
              valueText: isOnline ? '34% <span class="text-slate-400 text-[10px] font-normal">(10.8 / 32 GB)</span>' : '32 GB',
              percent: isOnline ? 34 : 0,
              color: 'from-emerald-500 to-teal-400'
            },
            {
              label: 'NVMe SSD:',
              badge: null,
              valueText: '42% <span class="text-slate-400 text-[10px] font-normal">(420 / 1000 GB)</span>',
              percent: 42,
              color: 'from-purple-500 to-pink-500'
            }
          ],
          meta: [
            { icon: '⏱', text: isOnline ? 'Аптайм: 2д 14ч' : 'Отключен', title: 'Время работы' },
            { icon: '🎮', text: isOnline ? 'GPU: RTX 42°C' : 'GPU Standby', title: 'Видеокарта' },
            { icon: '⚡', text: '1 Gb/s Ethernet', title: 'Сетевое подключение' }
          ],
          servicesTitle: 'СЛУЖБЫ ПК И БЫСТРЫЕ ДЕЙСТВИЯ',
          servicesSub: 'локальные порты',
          services: [
            {
              id: 'rdp',
              name: 'Удал. рабочий стол',
              icon: '🖥️',
              port: ':3389',
              url: `rdp://${targetHost}`,
              online: isOnline,
              hoverColor: 'sky'
            },
            {
              id: 'ssh',
              name: 'SSH / Terminal',
              icon: '⚡',
              port: ':22',
              url: `ssh://${targetHost}`,
              online: isOnline,
              hoverColor: 'emerald'
            },
            {
              id: 'steam',
              name: 'Steam Link',
              icon: '🎮',
              port: ':27036',
              url: `steam://`,
              online: isOnline,
              hoverColor: 'purple'
            },
            {
              id: 'vscode',
              name: 'Remote Dev',
              icon: '💻',
              port: ':8080',
              url: `http://${targetHost}:8080`,
              online: isOnline,
              hoverColor: 'amber'
            }
          ],
          footerAction: {
            text: 'RDP ↗',
            url: `rdp://${targetHost}`,
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"/>',
            color: 'sky'
          }
        };
      }

      // 3. Nokia 6.1 (AFK)
      if (key === 'nokia_afk' || (device.name && device.name.includes('Nokia'))) {
        const bLevel = device.battery_level !== null && device.battery_level !== undefined ? device.battery_level : 77;
        const bColor = bLevel > 50 ? 'emerald' : (bLevel > 20 ? 'amber' : 'rose');
        return {
          telemetryTitle: 'МОНИТОРИНГ И ПАРАМЕТРЫ AFK-НОДЫ',
          liveBadge: isOnline ? '24/7 online' : 'offline',
          bars: [
            {
              label: 'Батарея:',
              badge: `${bLevel}%`,
              badgeColor: bColor,
              valueText: `${bLevel}% <span class="text-slate-400 text-[10px] font-normal">${device.battery_charging ? '(⚡ Зарядка)' : '(🔋 Разряд)'}</span>`,
              percent: bLevel,
              color: bLevel > 50 ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-rose-500'
            },
            {
              label: 'Wi-Fi 5 GHz:',
              badge: '-56 dBm',
              badgeColor: 'sky',
              valueText: '88% <span class="text-slate-400 text-[10px] font-normal">(433 Mb/s)</span>',
              percent: 88,
              color: 'from-sky-500 to-indigo-500'
            },
            {
              label: 'Память eMMC:',
              badge: null,
              valueText: '58% <span class="text-slate-400 text-[10px] font-normal">(18.5 / 32 GB)</span>',
              percent: 58,
              color: 'from-purple-500 to-pink-500'
            }
          ],
          meta: [
            { icon: '⏱', text: device.battery_updated_at ? `Замер: ${formatBatteryTime(device.battery_updated_at)}` : 'Замер: активен', title: 'Время последнего телеметрического пакета' },
            { icon: '📱', text: 'Snapdragon 630 • 3GB', title: 'Платформа' },
            { icon: '🤖', text: 'Termux Agent: Live', title: 'Фоновый демон мониторинга' }
          ],
          servicesTitle: 'СЛУЖБЫ СМАРТФОНА И ДЕЙСТВИЯ',
          servicesSub: 'телеметрия',
          services: [
            {
              id: 'bat_hist',
              name: 'История батареи',
              icon: '📈',
              port: '24ч',
              action: 'openBatteryHistory',
              online: true,
              hoverColor: 'emerald'
            },
            {
              id: 'termux',
              name: 'Termux Node',
              icon: '📟',
              port: ':8022',
              url: `ssh://${device.tailscale_ip || '100.109.24.95'}:8022`,
              online: isOnline,
              hoverColor: 'sky'
            },
            {
              id: 'wifi_mesh',
              name: 'Tailscale Mesh',
              icon: '🌐',
              port: 'Peer',
              online: isOnline,
              hoverColor: 'purple'
            },
            {
              id: 'power_status',
              name: device.battery_charging ? 'Питание: Сеть' : 'Питание: АКБ',
              icon: device.battery_charging ? '⚡' : '🔋',
              port: `${bLevel}%`,
              action: 'openBatteryHistory',
              online: true,
              hoverColor: 'amber'
            }
          ],
          footerAction: {
            text: 'История 24ч ↗',
            action: 'openBatteryHistory',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
            color: 'emerald'
          }
        };
      }

      // 4. Samsung A54
      if (key === 'samsung_a54' || (device.name && device.name.includes('Samsung'))) {
        return {
          telemetryTitle: 'МОНИТОРИНГ И ПАРАМЕТРЫ СМАРТФОНА',
          liveBadge: isOnline ? 'в сети' : 'offline',
          bars: [
            {
              label: 'Батарея 5000 mAh:',
              badge: '82%',
              badgeColor: 'emerald',
              valueText: '82% <span class="text-slate-400 text-[10px] font-normal">(~1.5 дня)</span>',
              percent: 82,
              color: 'from-emerald-500 to-teal-400'
            },
            {
              label: 'ОЗУ LPDDR4X:',
              badge: null,
              valueText: '54% <span class="text-slate-400 text-[10px] font-normal">(4.3 / 8 GB)</span>',
              percent: 54,
              color: 'from-sky-500 to-indigo-500'
            },
            {
              label: 'Память UFS 2.2:',
              badge: null,
              valueText: '65% <span class="text-slate-400 text-[10px] font-normal">(83 / 128 GB)</span>',
              percent: 65,
              color: 'from-purple-500 to-pink-500'
            }
          ],
          meta: [
            { icon: '📱', text: 'Exynos 1380 • 120Hz', title: 'Процессор и экран' },
            { icon: '📶', text: 'Wi-Fi 6 + 5G SA', title: 'Связь' },
            { icon: '🔒', text: 'Knox Security: OK', title: 'Безопасность' }
          ],
          servicesTitle: 'СЛУЖБЫ СМАРТФОНА И ДЕЙСТВИЯ',
          servicesSub: 'smart connect',
          services: [
            {
              id: 'share',
              name: 'Quick Share',
              icon: '📲',
              port: 'Direct',
              online: isOnline,
              hoverColor: 'sky'
            },
            {
              id: 'kde',
              name: 'KDE Connect',
              icon: '🔗',
              port: ':1714',
              online: isOnline,
              hoverColor: 'emerald'
            },
            {
              id: 'vpn_peer',
              name: 'Tailscale Node',
              icon: '🌐',
              port: 'Peer',
              online: isOnline,
              hoverColor: 'purple'
            },
            {
              id: 'smart_switch',
              name: 'Резервная копия',
              icon: '💾',
              port: 'Cloud',
              online: true,
              hoverColor: 'amber'
            }
          ],
          footerAction: {
            text: 'Портал ↗',
            url: `http://${targetHost}`,
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>',
            color: 'sky'
          }
        };
      }

      // 5. Новый ноутбук (Резерв)
      if (key === 'new_laptop' || (device.name && device.name.includes('Резерв') && device.name.includes('ноутбук'))) {
        return {
          telemetryTitle: 'ПАРАМЕТРЫ РЕЗЕРВНОГО НОУТБУКА',
          liveBadge: isOnline ? 'в сети' : 'standby',
          bars: [
            {
              label: 'Батарея АКБ:',
              badge: '95%',
              badgeColor: 'sky',
              valueText: '95% <span class="text-slate-400 text-[10px] font-normal">(Готов к работе)</span>',
              percent: 95,
              color: 'from-sky-500 to-indigo-500'
            },
            {
              label: 'ОЗУ DDR5:',
              badge: null,
              valueText: '16 GB <span class="text-slate-400 text-[10px] font-normal">(Dual Channel)</span>',
              percent: 20,
              color: 'from-emerald-500 to-teal-400'
            },
            {
              label: 'SSD PCIe 4.0:',
              badge: null,
              valueText: '28% <span class="text-slate-400 text-[10px] font-normal">(140 / 512 GB)</span>',
              percent: 28,
              color: 'from-purple-500 to-pink-500'
            }
          ],
          meta: [
            { icon: '💻', text: 'Мобильный резерв', title: 'Профиль' },
            { icon: '📡', text: 'Wi-Fi 6 AX211', title: 'Сетевой модуль' },
            { icon: '⚡', text: 'Wake-on-LAN: Готов', title: 'Удаленный запуск' }
          ],
          servicesTitle: 'СЛУЖБЫ И УДАЛЕННЫЙ ДОСТУП',
          servicesSub: 'standby',
          services: [
            {
              id: 'wol',
              name: 'Wake-on-LAN',
              icon: '⚡',
              port: 'WOL',
              action: 'wakeDevice',
              online: false,
              hoverColor: 'amber'
            },
            {
              id: 'rdp_laptop',
              name: 'Удал. сессия',
              icon: '💻',
              port: ':3389',
              url: `rdp://${targetHost}`,
              online: false,
              hoverColor: 'sky'
            },
            {
              id: 'wireguard',
              name: 'WireGuard Ключ',
              icon: '🔑',
              port: 'VPN',
              online: true,
              hoverColor: 'emerald'
            },
            {
              id: 'sync',
              name: 'Синхронизация',
              icon: '🔄',
              port: 'Sync',
              online: true,
              hoverColor: 'purple'
            }
          ],
          footerAction: {
            text: 'Wake ⚡',
            action: 'wakeDevice',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>',
            color: 'amber'
          }
        };
      }

      // 6. Домашний NAS (Резерв)
      if (key === 'home_nas' || (device.name && device.name.includes('NAS'))) {
        return {
          telemetryTitle: 'ПАРАМЕТРЫ СЕТЕВОГО ХРАНИЛИЩА (NAS)',
          liveBadge: isOnline ? 'в сети' : 'standby',
          bars: [
            {
              label: 'RAID 5 Массив:',
              badge: '4x HDD',
              badgeColor: 'emerald',
              valueText: '45% <span class="text-slate-400 text-[10px] font-normal">(7.2 / 16 TB)</span>',
              percent: 45,
              color: 'from-emerald-500 to-teal-400'
            },
            {
              label: 'ОЗУ ECC:',
              badge: null,
              valueText: '25% <span class="text-slate-400 text-[10px] font-normal">(2.0 / 8 GB)</span>',
              percent: 25,
              color: 'from-sky-500 to-indigo-500'
            },
            {
              label: 'Диски SMART:',
              badge: 'OK',
              badgeColor: 'emerald',
              valueText: '100% <span class="text-slate-400 text-[10px] font-normal">(4x 4TB Здоровы)</span>',
              percent: 100,
              color: 'from-purple-500 to-pink-500'
            }
          ],
          meta: [
            { icon: '🗄️', text: 'TrueNAS / Synology', title: 'ОС Хранилища' },
            { icon: '📦', text: 'ZFS Pool: Healthy', title: 'Статус файловой системы' },
            { icon: '⚡', text: '1 Gb/s Ethernet Link', title: 'Канал' }
          ],
          servicesTitle: 'СЛУЖБЫ ХРАНИЛИЩА И ПРОТОКОЛЫ',
          servicesSub: 'сетевые шары',
          services: [
            {
              id: 'smb',
              name: 'SMB Общий диск',
              icon: '🗄️',
              port: ':445',
              online: isOnline,
              hoverColor: 'sky'
            },
            {
              id: 'dsm',
              name: 'Панель DSM/TrueNAS',
              icon: '🎛️',
              port: ':5000',
              url: `http://${targetHost}:5000`,
              online: isOnline,
              hoverColor: 'emerald'
            },
            {
              id: 'docker_nas',
              name: 'Portainer Docker',
              icon: '📦',
              port: ':9000',
              url: `http://${targetHost}:9000`,
              online: isOnline,
              hoverColor: 'purple'
            },
            {
              id: 'nfs',
              name: 'NFS / WebDAV',
              icon: '🌐',
              port: ':2049',
              online: isOnline,
              hoverColor: 'amber'
            }
          ],
          footerAction: {
            text: 'Панель NAS ↗',
            url: `http://${targetHost}:5000`,
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 003 3h13.5a3 3 0 003-3m-16.5 0a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.1a3 3 0 012.4-1.35h7.7a3 3 0 012.4 1.35l1.6 3.15a4.5 4.5 0 01.9 2.7"/>',
            color: 'emerald'
          }
        };
      }

      // Default Fallback for any other device
      return {
        telemetryTitle: `МОНИТОРИНГ И ПАРАМЕТРЫ УСТРОЙСТВА`,
        liveBadge: isOnline ? 'в сети' : 'offline',
        bars: [
          {
            label: 'Связь (Пинг):',
            badge: device.ping_ms ? `${device.ping_ms} ms` : (isOnline ? 'OK' : '—'),
            badgeColor: isOnline ? 'emerald' : 'slate',
            valueText: isOnline ? '99% доступность' : 'Не в сети',
            percent: isOnline ? 99 : 0,
            color: 'from-sky-500 to-indigo-500'
          },
          {
            label: 'Сетевой канал:',
            badge: null,
            valueText: device.connection || 'Wi-Fi / LAN',
            percent: isOnline ? 85 : 0,
            color: 'from-emerald-500 to-teal-400'
          },
          {
            label: 'Безопасность:',
            badge: 'Mesh',
            badgeColor: 'purple',
            valueText: 'Tailscale E2E Encrypted',
            percent: 100,
            color: 'from-purple-500 to-pink-500'
          }
        ],
        meta: [
          { icon: '📍', text: device.location || 'Локальная сеть', title: 'Расположение' },
          { icon: '🏷️', text: device.vendor || 'Устройство', title: 'Производитель' },
          { icon: '⚡', text: isOnline ? 'Онлайн' : 'Офлайн', title: 'Статус' }
        ],
        servicesTitle: 'СЕТЕВЫЕ ПРОТОКОЛЫ И ДЕЙСТВИЯ',
        servicesSub: 'доступ',
        services: [
          {
            id: 'ping_act',
            name: 'Пинг устройства',
            icon: '⚡',
            port: 'ICMP',
            action: 'pingDevice',
            online: isOnline,
            hoverColor: 'sky'
          },
          {
            id: 'web_act',
            name: 'Веб-доступ',
            icon: '🌐',
            port: ':80',
            url: `http://${targetHost}`,
            online: isOnline,
            hoverColor: 'emerald'
          },
          {
            id: 'tailscale_act',
            name: 'Tailscale Peer',
            icon: '🔗',
            port: 'VPN',
            online: isOnline,
            hoverColor: 'purple'
          },
          {
            id: 'config_act',
            name: 'Конфигурация',
            icon: '⚙️',
            port: 'Edit',
            action: 'inspectDevice',
            online: true,
            hoverColor: 'amber'
          }
        ],
        footerAction: null
      };
    }

    function renderDevices() {
      const container = document.getElementById('devices-container');
      if (!container) return;

      const total = state.devices.length;
      const onlineCount = state.devices.filter(d => d.is_online).length;
      const paused = state.devices.filter(d => d.paused).length;

      const stTotal = document.getElementById('stat-total-devices');
      const stAct = document.getElementById('stat-active-devices');
      const stPau = document.getElementById('stat-paused-devices');

      if (stTotal) stTotal.textContent = total;
      if (stAct) stAct.textContent = onlineCount;
      if (stPau) stPau.textContent = paused;

      const filtered = state.devices.filter(d => {
        const q = state.searchDeviceQuery.toLowerCase();
        const matchQuery = (d.name || '').toLowerCase().includes(q) ||
                           (d.ip || '').includes(q) ||
                           (d.tailscale_ip || '').includes(q) ||
                           (d.location || '').toLowerCase().includes(q) ||
                           (d.vendor || '').toLowerCase().includes(q);
        const matchCat = state.deviceCategoryFilter === 'all' || d.category === state.deviceCategoryFilter;
        return matchQuery && matchCat;
      });

      container.innerHTML = '';

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-10 text-center text-slate-400 glass-panel rounded-3xl p-6">
            <p class="text-sm font-semibold text-slate-300">Устройств не найдено</p>
          </div>
        `;
        return;
      }

      filtered.forEach(device => {
        const card = document.createElement('div');
        const isOnline = device.is_online && !device.paused;
        const isServerNode = device.key_id === 'server_node' || (device.name && device.name.toLowerCase().includes('сервер'));

        card.className = `glass-panel rounded-3xl p-5 border transition-all ${
          device.paused 
            ? 'border-rose-500/40 bg-rose-950/15' 
            : isOnline 
            ? 'border-sky-500/30 bg-slate-900/90 shadow-lg shadow-sky-950/20' 
            : 'border-slate-800 bg-slate-950/60 opacity-80'
        }`;

        // Battery HTML badge (special feature for Nokia 6.1 / mobile with History Click)
        let batteryHtml = '';
        if (device.battery_level !== null && device.battery_level !== undefined) {
          const bLevel = device.battery_level;
          const bColor = bLevel > 50 ? 'emerald' : (bLevel > 20 ? 'amber' : 'rose');
          let bTimeStr = '';
          if (device.battery_updated_at) {
            const formatted = formatBatteryTime(device.battery_updated_at);
            if (formatted) bTimeStr = ' • ' + formatted;
          }
          batteryHtml = `
            <button type="button" class="btn-open-battery-history flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-${bColor}-500/15 hover:bg-${bColor}-500/25 border border-${bColor}-500/30 text-${bColor}-300 text-xs font-bold shrink-0 transition-colors cursor-pointer" data-id="${device.id}" title="История разряда за 24ч (замер: ${bTimeStr.replace(' • ', '')})">
              <span>${device.battery_charging ? '⚡' : '🔋'}</span>
              <span>${bLevel}%</span>
              ${bTimeStr ? `<span class="text-[10px] opacity-80 font-normal">${bTimeStr}</span>` : ''}
            </button>
          `;
        }

        // Latency badge
        const pingHtml = device.ping_ms 
          ? `<span id="ping-badge-${device.id}" class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">${device.ping_ms} ms</span>`
          : `<span id="ping-badge-${device.id}" class="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 hidden"></span>`;

        // Status badge
        const statusBadge = device.paused
          ? `<span id="status-badge-${device.id}" class="badge-status px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
               <span class="w-2 h-2 rounded-full mr-1.5 bg-rose-400"></span> Пауза
             </span>`
          : isOnline
          ? `<span id="status-badge-${device.id}" class="badge-status px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
               <span class="w-2 h-2 rounded-full mr-1 bg-emerald-400 animate-pulse"></span> В сети ${pingHtml}
             </span>`
          : `<span id="status-badge-${device.id}" class="badge-status px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
               <span class="w-2 h-2 rounded-full mr-1.5 bg-slate-500"></span> Не в сети ${pingHtml}
             </span>`;

        // Get telemetry & services metadata for this device
        const metaInfo = getDeviceTelemetryAndServices(device, state.serverHealth);

        // Build 3 metric bars HTML
        const barsHtml = metaInfo.bars.map(b => {
          const badgeHtml = b.badge 
            ? `<span ${b.idPrefix ? `id="${b.idPrefix}-temp"` : ''} class="text-[10px] px-1.5 py-0.2 rounded-md bg-${b.badgeColor || 'amber'}-500/15 text-${b.badgeColor || 'amber'}-300 border border-${b.badgeColor || 'amber'}-500/20 font-mono font-bold">${b.badge}</span>` 
            : '';
          const valueId = b.idPrefix ? `id="${b.idPrefix}-text"` : '';
          const barId = b.idPrefix ? `id="${b.idPrefix}-bar"` : '';

          return `
            <div class="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-400 flex items-center gap-1">
                  <span>${b.label}</span>
                  ${badgeHtml}
                </span>
                <span ${valueId} class="text-white font-mono font-bold">${b.valueText}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
                <div ${barId} class="h-full rounded-full bg-gradient-to-r ${b.color} transition-all duration-500" style="width: ${Math.min(100, Math.max(5, b.percent))}%"></div>
              </div>
            </div>
          `;
        }).join('');

        // Build meta items HTML
        const metaItemsHtml = metaInfo.meta.map((m, idx) => {
          let mId = '';
          if (isServerNode) {
            if (idx === 0) mId = 'id="srv-uptime-text"';
            else if (idx === 1) mId = 'id="srv-load-text"';
            else if (idx === 2) mId = 'id="srv-battery-text"';
          }
          return `<span ${mId} title="${m.title || ''}">${m.icon} ${m.text}</span>`;
        }).join('');

        // Build services tiles HTML
        const servicesTilesHtml = metaInfo.services.map(s => {
          const hColor = s.hoverColor || 'sky';
          const dotId = s.id ? `id="srv-status-dot-${s.id}"` : '';
          const pulseCls = s.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600';
          const linkAttr = s.url 
            ? `href="${s.url}" target="_blank" rel="noopener noreferrer"` 
            : (s.action ? `href="javascript:void(0)" data-action="${s.action}" data-dev-id="${device.id}"` : 'href="javascript:void(0)"');

          return `
            <a ${linkAttr} class="srv-action-tile group/srv flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-${hColor}-500/15 border border-slate-800 hover:border-${hColor}-500/40 transition-all duration-200 shadow-sm cursor-pointer"
               title="${s.name} (${s.port})">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-base group-hover/srv:scale-110 transition-transform shrink-0">${s.icon}</span>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white group-hover/srv:text-${hColor}-300 truncate">${s.name}</div>
                  <div class="text-[10px] font-mono text-slate-400 truncate">${s.port}</div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0 text-slate-500 group-hover/srv:text-${hColor}-400 transition-colors">
                <span ${dotId} class="w-1.5 h-1.5 rounded-full ${pulseCls}"></span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              </div>
            </a>
          `;
        }).join('');

        // Full middle telemetry & services HTML block
        const extraSectionHtml = `
          <!-- DEVICE TELEMETRY / HEALTH MONITORING -->
          <div class="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <span class="text-sky-400">⚡</span> <span>${metaInfo.telemetryTitle}</span>
              </span>
              <span ${isServerNode ? 'id="srv-health-badge"' : ''} class="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ${metaInfo.liveBadge}
              </span>
            </div>

            <!-- Metrics Bars Grid (3 columns on sm+) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${barsHtml}
            </div>

            <!-- Summary meta -->
            <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-wrap gap-2">
              ${metaItemsHtml}
            </div>
          </div>

          <!-- SERVICES & QUICK ACTIONS -->
          <div class="mt-4 pt-3.5 border-t border-slate-800/80">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span class="text-amber-400">🚀</span> <span>${metaInfo.servicesTitle}</span>
              </span>
              <span class="text-[10px] text-slate-400 font-mono">
                <span>${metaInfo.servicesSub}</span>
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              ${servicesTilesHtml}
            </div>
          </div>
        `;

        // Footer action button
        let footerActionHtml = '';
        if (metaInfo.footerAction) {
          const fa = metaInfo.footerAction;
          const faColor = fa.color || 'emerald';
          if (fa.url) {
            footerActionHtml = `
              <a href="${fa.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-xl bg-${faColor}-500/15 hover:bg-${faColor}-500/25 border border-${faColor}-500/30 text-${faColor}-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer" title="${fa.text}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${fa.iconSvg}</svg>
                <span>${fa.text}</span>
              </a>
            `;
          } else if (fa.action) {
            footerActionHtml = `
              <button type="button" class="btn-footer-custom-action px-2.5 py-1.5 rounded-xl bg-${faColor}-500/15 hover:bg-${faColor}-500/25 border border-${faColor}-500/30 text-${faColor}-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer" data-action="${fa.action}" data-dev-id="${device.id}" title="${fa.text}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${fa.iconSvg}</svg>
                <span>${fa.text}</span>
              </button>
            `;
          }
        }

        card.innerHTML = `
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isOnline ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800/80 text-slate-500'}">
                ${getDeviceIcon(device.icon)}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-white text-sm sm:text-base leading-snug truncate">${device.name}</h4>
                </div>
                <p class="text-[11px] text-slate-400 truncate">${device.vendor || 'Устройство'}</p>
              </div>
            </div>

            ${batteryHtml}
          </div>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            ${statusBadge}

            <span class="badge-status px-2.5 py-1 rounded-full text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              ${device.connection}
            </span>
          </div>

          <div class="space-y-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs mb-3 font-mono">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 text-[10px] font-sans">LAN IP:</span>
              <span class="text-slate-200 font-medium">${device.ip || '—'}</span>
            </div>
            ${device.tailscale_ip ? `
            <div class="flex items-center justify-between">
              <span class="text-slate-500 text-[10px] font-sans flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Tailscale:
              </span>
              <span class="text-indigo-300 font-medium">${device.tailscale_ip}</span>
            </div>` : ''}
          </div>

          ${extraSectionHtml}

          <div class="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/60">
            <span class="text-[10px] font-mono text-slate-500">${device.mac || 'Tailscale Mesh'}</span>
            <div class="flex items-center gap-2">
              ${footerActionHtml}
              <button type="button" class="btn-ping-device px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer" data-id="${device.id}" title="Проверить пинг устройства сейчас">
                <svg class="w-3.5 h-3.5 ping-icon-${device.id}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                <span>Пинг</span>
              </button>
              <button type="button" class="inspect-device-btn px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer" data-id="${device.id}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                <span>Настроить</span>
              </button>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

      // Attach Custom Action Tile / Footer Button Events
      container.querySelectorAll('[data-action]').forEach(el => {
        el.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const action = el.dataset.action;
          const devId = parseInt(el.dataset.devId);
          if (action === 'openBatteryHistory') {
            openBatteryHistoryModal();
          } else if (action === 'wakeDevice') {
            const dev = state.devices.find(d => d.id === devId);
            showToast('Wake-on-LAN', `Пакет Magic Packet отправлен на ${dev?.name || 'устройство'} (${dev?.mac || 'WOL'})`, 'info');
          } else if (action === 'inspectDevice') {
            openDeviceModal(devId);
          } else if (action === 'pingDevice') {
            const pingBtn = container.querySelector(`.btn-ping-device[data-id="${devId}"]`);
            if (pingBtn) pingBtn.click();
          }
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

      // Attach Quick Ping Events
      container.querySelectorAll('.btn-ping-device').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          const icon = btn.querySelector(`.ping-icon-${id}`);
          if (icon) icon.classList.add('animate-spin');
          btn.disabled = true;

          try {
            const res = await fetch(`/api/devices/${id}/ping`, { method: 'POST' });
            if (res.ok) {
              const pingData = await res.json();
              const dev = state.devices.find(d => d.id === id);
              if (dev) {
                dev.is_online = pingData.is_online;
                dev.ping_ms = pingData.ping_ms;
              }
              const pBadge = document.getElementById(`ping-badge-${id}`);
              const sBadge = document.getElementById(`status-badge-${id}`);

              if (pingData.is_online) {
                if (pBadge) {
                  pBadge.textContent = `${pingData.ping_ms} ms`;
                  pBadge.className = 'text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20';
                  pBadge.classList.remove('hidden');
                }
                if (sBadge) {
                  sBadge.className = 'badge-status px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1';
                  sBadge.innerHTML = `<span class="w-2 h-2 rounded-full mr-1 bg-emerald-400 animate-pulse"></span> В сети ${pBadge ? pBadge.outerHTML : ''}`;
                }
                showToast("Пинг успешен", `${pingData.device}: онлайн (${pingData.ping_ms} ms)`, "success");
              } else {
                if (pBadge) pBadge.classList.add('hidden');
                if (sBadge) {
                  sBadge.className = 'badge-status px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60';
                  sBadge.innerHTML = `<span class="w-2 h-2 rounded-full mr-1.5 bg-slate-500"></span> Не в сети`;
                }
                showToast("Устройство оффлайн", `${pingData.device}: нет отклика`, "warning");
              }
            }
          } catch (err) {
            console.error("Ping error:", err);
            showToast("Ошибка пинга", "Не удалось связаться с сервером", "danger");
          } finally {
            if (icon) icon.classList.remove('animate-spin');
            btn.disabled = false;
          }
        };
      });

      // Attach Battery History Modal Opener
      container.querySelectorAll('.btn-open-battery-history').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          openBatteryHistoryModal();
        };
      });
    }

    async function openBatteryHistoryModal() {
      const modal = document.getElementById('battery-history-modal');
      const curEl = document.getElementById('battery-modal-current');
      const countEl = document.getElementById('battery-modal-points-count');
      const listEl = document.getElementById('battery-history-list');

      if (!modal) return;
      modal.style.display = 'flex';

      const nokia = state.devices.find(d => d.key_id === 'nokia_afk');
      if (curEl && nokia) {
        const timeFormatted = formatBatteryTime(nokia.battery_updated_at);
        const lastTimeStr = timeFormatted ? ` (${timeFormatted})` : '';
        curEl.textContent = `${nokia.battery_level || '--'}%${lastTimeStr}`;
      }

      if (listEl) {
        listEl.innerHTML = `<div class="text-slate-500 text-center py-4 text-[11px]">Загрузка замеров...</div>`;
      }

      try {
        const res = await fetch('/api/devices/nokia/battery/history');
        if (res.ok) {
          const hist = await res.json();
          if (countEl) countEl.textContent = hist.count;
          if (curEl) {
            const lvl = hist.battery_level !== null && hist.battery_level !== undefined ? hist.battery_level : (nokia?.battery_level || '--');
            const timeFmt = formatBatteryTime(hist.battery_updated_at || nokia?.battery_updated_at);
            curEl.textContent = `${lvl}%${timeFmt ? ` (${timeFmt})` : ''}`;
          }

          if (listEl) {
            if (!hist.points || hist.points.length === 0) {
              listEl.innerHTML = `
                <div class="p-3 text-center text-slate-400 text-[11px] rounded-xl bg-slate-900 border border-slate-800">
                  Пока нет сохраненных замеров.<br>Дневной интервал замеров — каждые 30 минут (с 08:00 до 20:00).
                </div>
              `;
            } else {
              const fallbackNotice = hist.is_fallback ? `
                <div class="p-2 mb-2 text-center text-amber-300 text-[11px] rounded-xl bg-amber-500/10 border border-amber-500/20">
                  ⚠️ Новых замеров за 24ч не поступало. Показаны предыдущие замеры.
                </div>
              ` : '';

              const itemsHtml = hist.points.slice().reverse().map(pt => {
                const rawIso = pt.recorded_at || pt.time;
                const timeDisplay = formatBatteryTime(rawIso) || pt.time || '—';
                return `
                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span class="text-slate-400 font-mono text-[11px]">${timeDisplay}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-400 text-[10px]">${pt.charging ? '⚡ Зарядка' : '🔋 Батарея'}</span>
                    <span class="font-bold text-xs ${pt.level > 50 ? 'text-emerald-400' : (pt.level > 20 ? 'text-amber-400' : 'text-rose-400')}">${pt.level}%</span>
                  </div>
                </div>
              `;
              }).join('');

              listEl.innerHTML = fallbackNotice + itemsHtml;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load battery history:", err);
      }
    }

    const closeBatteryHistBtn = document.getElementById('close-battery-history-modal');
    if (closeBatteryHistBtn) {
      closeBatteryHistBtn.onclick = () => {
        const modal = document.getElementById('battery-history-modal');
        if (modal) modal.style.display = 'none';
      };
    }

    // Device Inspector Modal
    let activeEditId = null;
    function openDeviceModal(id) {
      const dev = state.devices.find(d => d.id === id);
      if (!dev) return;
      activeEditId = id;

      document.getElementById('modal-device-name').value = dev.name;
      document.getElementById('modal-device-ip').textContent = dev.ip || dev.tailscale_ip || '—';
      document.getElementById('modal-device-mac').textContent = dev.mac || 'Tailscale Mesh';
      document.getElementById('modal-device-vendor').textContent = dev.vendor || '—';
      document.getElementById('modal-device-connection').textContent = dev.connection;

      const modal = document.getElementById('device-modal');
      modal.style.display = 'flex';
    }

    // Save Device Modal
    document.getElementById('save-device-settings').onclick = async () => {
      if (!activeEditId) return;
      const dev = state.devices.find(d => d.id === activeEditId);
      if (!dev) return;

      const newName = document.getElementById('modal-device-name').value;
      dev.name = newName;

      // Update to backend API if device is from database
      try {
        await fetch(`/api/devices/${dev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName
          })
        });
      } catch (err) {
        console.error("Failed to persist device change:", err);
      }

      const modal = document.getElementById('device-modal');
      modal.style.display = 'none';

      renderDevices();
      showToast(t('toastSaved') || "Сохранено", dev.name, "success");
    };

    document.getElementById('close-device-modal').onclick = () => {
      const modal = document.getElementById('device-modal');
      modal.style.display = 'none';
    };

    // Add Device Modal Handlers
    const openAddDevBtn = document.getElementById('open-add-device-modal-btn');
    const addDevModal = document.getElementById('add-device-modal');
    const closeAddDevBtn = document.getElementById('close-add-device-modal');
    const cancelAddDevBtn = document.getElementById('cancel-add-device-btn');
    const addDevForm = document.getElementById('add-device-form');

    if (openAddDevBtn && addDevModal) {
      openAddDevBtn.onclick = () => {
        addDevModal.style.display = 'flex';
      };
    }
    if (closeAddDevBtn && addDevModal) {
      closeAddDevBtn.onclick = () => {
        addDevModal.style.display = 'none';
      };
    }
    if (cancelAddDevBtn && addDevModal) {
      cancelAddDevBtn.onclick = () => {
        addDevModal.style.display = 'none';
      };
    }
    if (addDevForm) {
      addDevForm.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('add-dev-name').value.trim(),
          category: document.getElementById('add-dev-category').value,
          icon: document.getElementById('add-dev-icon').value,
          ip: document.getElementById('add-dev-ip').value.trim(),
          tailscale_ip: document.getElementById('add-dev-ts-ip').value.trim(),
          mac: document.getElementById('add-dev-mac').value.trim(),
          vendor: document.getElementById('add-dev-vendor').value.trim(),
          location: document.getElementById('add-dev-location').value.trim()
        };

        try {
          const res = await fetch('/api/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            showToast("Устройство добавлено", payload.name, "success");
            addDevModal.style.display = 'none';
            addDevForm.reset();
            await loadManagedDevices();
          } else {
            showToast("Ошибка сохранения", "Сервер вернул ошибку", "danger");
          }
        } catch (err) {
          console.error("Failed to add device:", err);
          showToast("Ошибка сети", err.message, "danger");
        }
      };
    }

    // Refresh / Scan network button
    const scanNetBtn = document.getElementById('scan-network-btn');
    if (scanNetBtn) {
      scanNetBtn.onclick = async () => {
        scanNetBtn.disabled = true;
        scanNetBtn.classList.add('opacity-70');
        showToast("Проверка сети", "Опрос статуса Tailscale и локального пинга...", "info");
        await Promise.all([loadManagedDevices(), loadRouterStats()]);
        scanNetBtn.disabled = false;
        scanNetBtn.classList.remove('opacity-70');
        showToast("Сеть обновлена", "Статусы всех устройств актуализированы", "success");
      };
    }

    // ==========================================
    // VPN & ADGUARD HOME LIVE INTEGRATION
    // ==========================================

    state.vpnStatus = null;
    state.dnsStats = null;
    state.dnsStatus = null;
    state.vpnTraffic = { rx_kbps: 0, tx_kbps: 0, rx_mbps: 0, tx_mbps: 0 };
    let chartPoints = [20, 35, 45, 60, 50, 42, 68, 85, 70, 55, 65, 80];

    async function loadVpnStatus() {
      try {
        const resp = await fetch('/api/vpn/status');
        if (!resp.ok) return;
        const data = await resp.json();
        state.vpnStatus = data;
        updateVpnUI();
      } catch (err) {
        console.warn('Could not load /api/vpn/status:', err);
      }
    }

    function updateVpnUI() {
      const v = state.vpnStatus;
      if (!v) return;

      const pill = document.getElementById('vpn-status-pill');
      const label = document.getElementById('vpn-status-label');
      const virtualIp = document.getElementById('vpn-virtual-ip');
      const pingEl = document.getElementById('vpn-ping');
      const encEl = document.getElementById('vpn-encryption');
      const badge = document.getElementById('vpn-peers-badge');
      const peersContainer = document.getElementById('vpn-peers-container');

      if (pill && label) {
        pill.className = v.connected 
          ? 'badge-status px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5'
          : 'badge-status px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5';
        label.textContent = v.connected ? 'В сети Tailscale' : 'Автономно';
      }

      if (virtualIp && v.self?.virtual_ip) virtualIp.textContent = v.self.virtual_ip;
      if (pingEl && v.ping_ms !== undefined) pingEl.textContent = `${v.ping_ms} ms`;
      if (encEl && v.encryption) encEl.textContent = v.encryption;

      if (badge) {
        badge.textContent = `${v.peers_online || 0} онлайн / ${v.peers_count || 0} всего`;
      }

      if (peersContainer && Array.isArray(v.peers)) {
        peersContainer.innerHTML = v.peers.map(p => {
          const isOnline = p.online;
          const osIcon = (p.os || '').toLowerCase().includes('windows') ? '💻' : ((p.os || '').toLowerCase().includes('android') ? '📱' : '🐧');
          return `
            <div class="p-2.5 rounded-2xl bg-slate-900/60 border ${isOnline ? 'border-slate-800' : 'border-slate-800/50 opacity-60'} flex items-center justify-between gap-2">
              <div class="min-w-0 flex items-center gap-2">
                <span class="text-base">${osIcon}</span>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">${p.display_name || p.hostname}</div>
                  <div class="text-[10px] font-mono text-slate-400 truncate">${p.ip || '—'}</div>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
                  <span class="w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
                  ${isOnline ? 'В сети' : 'Offline'}
                </span>
                ${isOnline && p.tx_mb ? `<div class="text-[9px] text-slate-500 mt-0.5">${p.tx_mb} MB</div>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    async function loadVpnTraffic() {
      try {
        const resp = await fetch('/api/vpn/traffic');
        if (!resp.ok) return;
        const data = await resp.json();
        state.vpnTraffic = data;

        const rxEl = document.getElementById('vpn-speed-rx');
        const txEl = document.getElementById('vpn-speed-tx');
        if (rxEl) rxEl.textContent = `↓ ${data.rx_mbps >= 1 ? data.rx_mbps + ' Mb/s' : data.rx_kbps + ' Kb/s'}`;
        if (txEl) txEl.textContent = `↑ ${data.tx_mbps >= 1 ? data.tx_mbps + ' Mb/s' : data.tx_kbps + ' Kb/s'}`;

        const point = Math.max(15, Math.min(150, Math.round(data.rx_kbps + data.tx_kbps * 0.5)));
        chartPoints.shift();
        chartPoints.push(point);
        renderCanvasChart();
      } catch (err) {
        console.warn('Could not load /api/vpn/traffic:', err);
      }
    }

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

      // Draw Gradient Area & Line
      const pts = chartPoints;
      const step = w / (pts.length - 1);

      ctx.beginPath();
      ctx.moveTo(0, h - (pts[0] / 160) * h);

      for (let i = 1; i < pts.length; i++) {
        const x = i * step;
        const y = h - (pts[i] / 160) * h;
        const prevX = (i - 1) * step;
        const prevY = h - (pts[i - 1] / 160) * h;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5 * (window.devicePixelRatio || 1);
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

    // ==========================================
    // ADGUARD HOME DNS SHIELD INTEGRATION
    // ==========================================

    async function loadDnsStats() {
      try {
        const resp = await fetch('/api/dns/stats');
        if (!resp.ok) return;
        const data = await resp.json();
        state.dnsStats = data;

        const totalEl = document.getElementById('stat-total-queries');
        const blockedEl = document.getElementById('stat-blocked-count');
        const threatsEl = document.getElementById('stat-threats-count');

        if (totalEl) totalEl.textContent = Number(data.total_queries || 0).toLocaleString();
        if (blockedEl) {
          const pct = data.blocked_percent !== undefined ? ` (${data.blocked_percent}%)` : '';
          blockedEl.textContent = `${Number(data.blocked_queries || 0).toLocaleString()}${pct}`;
        }
        if (threatsEl) threatsEl.textContent = Number(data.threats_count || 0).toLocaleString();
      } catch (err) {
        console.warn('Could not load /api/dns/stats:', err);
      }
    }

    async function loadDnsStatus() {
      try {
        const resp = await fetch('/api/dns/status');
        if (!resp.ok) return;
        const data = await resp.json();
        state.dnsStatus = data;

        // Update toggles
        const adblockTog = document.getElementById('dns-toggle-adblock');
        const malwareTog = document.getElementById('dns-toggle-malware');
        const dohTog = document.getElementById('dns-toggle-doh');
        const parentalTog = document.getElementById('dns-toggle-parental');

        if (adblockTog) adblockTog.checked = Boolean(data.adblock);
        if (malwareTog) malwareTog.checked = Boolean(data.malware);
        if (dohTog) dohTog.checked = Boolean(data.doh);
        if (parentalTog) parentalTog.checked = Boolean(data.parental);

        // Highlight active provider
        const curProvider = data.provider || 'quad9';
        const provLabel = document.getElementById('dns-active-provider-label');
        if (provLabel) {
          const titles = {
            quad9: 'Quad9 DoH 🇨🇭 (Швейцария)',
            cloudflare: 'Cloudflare DoH ⚡ (1.1.1.1)',
            adguard: 'AdGuard Cloud DoH 🛡️',
            google: 'Google DoH 🌐 (8.8.8.8)'
          };
          provLabel.textContent = titles[curProvider] || curProvider;
          if (curProvider === 'quad9') {
            provLabel.className = 'text-[11px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30';
          } else {
            provLabel.className = 'text-[11px] text-sky-400 font-mono font-bold px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/30';
          }
        }

        document.querySelectorAll('.dns-provider-card').forEach(c => {
          if (c.dataset.dns === curProvider) {
            c.className = 'dns-provider-card cursor-pointer p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-950/40 transition-all flex flex-col justify-between';
          } else {
            c.className = 'dns-provider-card cursor-pointer p-3 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between';
          }
        });
      } catch (err) {
        console.warn('Could not load /api/dns/status:', err);
      }
    }

    async function toggleDnsFeature(feature, enabled) {
      try {
        const resp = await fetch('/api/dns/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature, enabled })
        });
        if (resp.ok) {
          const titles = {
            adblock: 'Блокировщик рекламы',
            malware: 'Защита от вирусов и фишинга',
            doh: 'Шифрование DNS (DoH)',
            parental: 'Безопасный поиск / Семья'
          };
          const name = titles[feature] || feature;
          showToast('Настройки щита обновлены', `${name}: ${enabled ? 'Включено' : 'Выключено'}`, enabled ? 'success' : 'info');
          loadDnsStatus();
          loadDnsStats();
        } else {
          showToast('Ошибка', 'Не удалось применить настройку', 'danger');
        }
      } catch (err) {
        console.error('Toggle error:', err);
        showToast('Ошибка сети', 'Сервер DNS временно недоступен', 'danger');
      }
    }

    async function switchDnsProvider(provider) {
      try {
        const names = {
          quad9: 'Quad9 🇨🇭 (Защита от вирусов + законы Швейцарии)',
          cloudflare: 'Cloudflare ⚡ (Максимальная скорость 1.1.1.1)',
          adguard: 'AdGuard Cloud 🛡️ (Двойная фильтрация рекламы)',
          google: 'Google DoH 🌐 (Глобальная сеть 8.8.8.8)'
        };
        showToast('Переключение шлюза...', `Подключаем ${names[provider] || provider}`, 'info');
        const resp = await fetch('/api/dns/upstream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider })
        });
        if (resp.ok) {
          showToast('DNS-шлюз успешно изменён', `Активен ${names[provider] || provider}`, 'success');
          await loadDnsStatus();
          await loadDnsStats();
        } else {
          showToast('Ошибка', 'Не удалось переключить DNS-шлюз', 'danger');
        }
      } catch (err) {
        console.error('Upstream error:', err);
        showToast('Ошибка сети', 'Не удалось связаться с сервером', 'danger');
      }
    }

    async function loadDnsQueryLog() {
      const body = document.getElementById('dns-query-log-body');
      if (!body) return;

      const filterSelect = document.getElementById('dns-log-filter');
      const filter = filterSelect ? filterSelect.value : 'all';

      try {
        const resp = await fetch(`/api/dns/querylog?limit=40&filter=${filter}`);
        if (!resp.ok) throw new Error('API error');
        const data = await resp.json();
        const logs = data.logs || [];

        if (logs.length === 0) {
          body.innerHTML = `
            <div class="p-6 text-center text-slate-500 text-xs">
              Нет свежих записей в журнале
            </div>
          `;
          return;
        }

        body.innerHTML = logs.map(q => {
          const isBlocked = q.status === 'blocked';
          const badgeClass = isBlocked
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

          return `
            <div class="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="font-mono text-white text-xs font-semibold truncate max-w-[280px] sm:max-w-xs" title="${q.domain}">${q.domain}</span>
                  <span class="badge-status px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">
                    ${q.reason}
                  </span>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">${q.type || 'A'}</span>
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span class="text-slate-300 font-medium">${q.client_name || q.client_ip}</span>
                  <span>•</span>
                  <span class="text-slate-500">${q.time}</span>
                  ${q.elapsed_ms ? `<span>•</span><span class="text-slate-500">${q.elapsed_ms} ms</span>` : ''}
                </div>
              </div>
              
              ${!isBlocked ? `
                <button type="button" class="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer" onclick="blockDomainPrompt('${q.domain}')">
                  Заблокировать
                </button>
              ` : `
                <span class="text-[11px] font-mono text-rose-400/80 shrink-0">✕ Заблокировано</span>
              `}
            </div>
          `;
        }).join('');
      } catch (err) {
        console.warn('Could not load /api/dns/querylog:', err);
      }
    }

    async function blockDomainPrompt(domain) {
      if (!domain) return;
      if (typeof openConfirmModal === 'function') {
        openConfirmModal({
          title: 'Заблокировать домен?',
          snippet: domain,
          desc: 'Все DNS-запросы к этому домену будут блокироваться для всех ваших устройств.',
          confirmText: 'Заблокировать',
          onConfirm: async () => {
            try {
              const resp = await fetch('/api/dns/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
              });
              if (resp.ok) {
                showToast('Домен заблокирован', `Правило ||${domain}^ добавлено`, 'warning');
                loadDnsQueryLog();
                loadDnsStats();
              } else {
                showToast('Ошибка', 'Не удалось заблокировать домен', 'danger');
              }
            } catch (e) {
              showToast('Ошибка сети', 'Не удалось связаться с сервером', 'danger');
            }
          }
        });
      } else {
        if (confirm(`Заблокировать домен ${domain}?`)) {
          const resp = await fetch('/api/dns/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain })
          });
          if (resp.ok) {
            showToast('Домен заблокирован', domain, 'warning');
            loadDnsQueryLog();
            loadDnsStats();
          }
        }
      }
    }

    window.blockDomainPrompt = blockDomainPrompt;

    // QR Code Modal Handlers
    async function openVpnQrModal() {
      const modal = document.getElementById('vpn-qr-modal');
      const img = document.getElementById('vpn-qr-image');
      if (!modal) return;

      try {
        const resp = await fetch('/api/vpn/qr');
        if (resp.ok) {
          const data = await resp.json();
          if (img && data.qr_base64) {
            img.src = data.qr_base64;
          }
        }
      } catch (e) {
        console.warn('QR code load failed:', e);
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
      });
    }

    function closeVpnQrModal(e) {
      if (e && e.target && e.target !== e.currentTarget && e.target.tagName !== 'BUTTON') {
        return;
      }
      const modal = document.getElementById('vpn-qr-modal');
      if (!modal) return;

      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }, 300);
    }

    window.openVpnQrModal = openVpnQrModal;
    window.closeVpnQrModal = closeVpnQrModal;

    // Attach Provider Cards Listeners
    document.querySelectorAll('.dns-provider-card').forEach(card => {
      card.onclick = () => {
        const prov = card.dataset.dns;
        if (prov) switchDnsProvider(prov);
      };
    });

    // Attach Toggle Listeners
    const adblockEl = document.getElementById('dns-toggle-adblock');
    if (adblockEl) adblockEl.onchange = (e) => toggleDnsFeature('adblock', e.target.checked);

    const malwareEl = document.getElementById('dns-toggle-malware');
    if (malwareEl) malwareEl.onchange = (e) => toggleDnsFeature('malware', e.target.checked);

    const dohEl = document.getElementById('dns-toggle-doh');
    if (dohEl) dohEl.onchange = (e) => toggleDnsFeature('doh', e.target.checked);

    const parentalEl = document.getElementById('dns-toggle-parental');
    if (parentalEl) parentalEl.onchange = (e) => toggleDnsFeature('parental', e.target.checked);

    const logFilterEl = document.getElementById('dns-log-filter');
    if (logFilterEl) logFilterEl.onchange = () => loadDnsQueryLog();

    const qrBtn = document.getElementById('show-qr-btn');
    if (qrBtn) qrBtn.onclick = openVpnQrModal;

    // Background auto-refresh for VPN & DNS
    setInterval(() => {
      if (state.currentTab === 'vpn') {
        loadVpnTraffic();
      }
    }, 2500);

    setInterval(() => {
      if (state.currentTab === 'vpn') {
        loadDnsStats();
        loadDnsQueryLog();
      }
    }, 6000);

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
        setDynamicCategory(pill.dataset.category || 'Украина');
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
    try { setLanguage('ru'); } catch (e) { console.error('Error during setLanguage:', e); }
    try { switchTab('news'); } catch (e) { console.error('Error during switchTab:', e); }
    try { setDynamicCategory(state.newsCategoryFilter || 'Украина'); } catch (e) { console.error('Error during setDynamicCategory:', e); }
    try { updateDeleteCategoryBtn(); } catch (e) { console.error('Error during updateDeleteCategoryBtn:', e); }
    try { initCategoryPillsScroll(); } catch (e) { console.error('Error during initCategoryPillsScroll:', e); }
    try { loadLiveNews(); } catch (e) { console.error('Error during loadLiveNews:', e); }
    try { loadManagedDevices(); } catch (e) { console.error('Error during loadManagedDevices:', e); }
    try { loadRouterStats(); } catch (e) { console.error('Error during loadRouterStats:', e); }
  })();
