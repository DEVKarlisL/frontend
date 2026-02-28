/**
 * Zustand store for language selection
 */

import { create } from "zustand";

type Language = "lv" | "en" | "ru";

type TranslationKey =
  | "login"
  | "register"
  | "dashboard"
  | "adminPanel"
  | "accountSettings"
  | "logout"
  | "currentBid"
  | "buyNow"
  | "bids"
  | "left"
  | "hoursShort"
  | "minutesShort"
  | "secondsShort"
  | "auctionsTitle"
  | "liveAuctions"
  | "endedAuctions"
  | "loading"
  | "noAuctions"
  | "statusActive"
  | "statusEnding"
  | "statusEnded"
  | "startsSoon"
  | "endingSoon"
  | "ended"
  | "currentWinner"
  | "winner"
  | "loginTitle"
  | "loginSubtitle"
  | "username"
  | "usernamePlaceholder"
  | "password"
  | "passwordPlaceholder"
  | "loggingIn"
  | "or"
  | "signInWithGoogle"
  | "noAccount"
  | "registerHere"
  | "registerTitle"
  | "registerSubtitle"
  | "firstName"
  | "lastName"
  | "firstNamePlaceholder"
  | "lastNamePlaceholder"
  | "email"
  | "emailPlaceholder"
  | "birthDate"
  | "birthDateFormat"
  | "usernameRequired"
  | "passwordConfirm"
  | "registering"
  | "haveAccount"
  | "loginHere"
  | "passwordMismatch"
  | "registerSuccess"
  | "dashboardTitle"
  | "welcomeBack"
  | "pleaseLogin"
  | "pleaseLoginToBid"
  | "loadingDashboard"
  | "activeAuctions"
  | "totalBids"
  | "watchlist"
  | "wonAuctions"
  | "quickActions"
  | "createNewAuction"
  | "manageMyAuctions"
  | "editProfile"
  | "myRecentAuctions"
  | "recentBids"
  | "viewAll"
  | "noAuctionsYet"
  | "watchlistTitle"
  | "noWatchlist"
  | "myAuctionsTitle"
  | "status"
  | "title"
  | "price"
  | "actions"
  | "view"
  | "bidHistory"
  | "noBids"
  | "beFirst"
  | "seller"
  | "category"
  | "timeRemaining"
  | "calculating"
  | "finalizing"
  | "minimumIncrement"
  | "minimumBid"
  | "yourBid"
  | "placeBid"
  | "addToWatchlist"
  | "removeFromWatchlist"
  | "profileSettings"
  | "profileUpdated"
  | "updateProfile"
  | "changeAvatar"
  | "bio"
  | "phone"
  | "location"
  | "website"
  | "bioPlaceholder"
  | "selectImageFile"
  | "fileTooLarge"
  | "profileUpdateFailed"
  | "usernameLabel"
  | "usernameCannotChange"
  | "avatarHint"
  | "watchlistAdded"
  | "watchlistRemoved"
  | "watchlistError"
  | "loadingAuction"
  | "errorLoadingAuction"
  | "auctionNotFound"
  | "agreeToTerms"
  | "termsOfService"
  | "privacyPolicy"
  | "and"
  | "alreadyHighest"
  | "invalidBid"
  | "minBidAmount"
  | "bidPlaced"
  | "bidFailed"
  | "auctionSingular"
  | "auctionPlural"
  | "createAuctionTitle"
  | "createAuctionSubtitle"
  | "description"
  | "pricing"
  | "startingPrice"
  | "reservePrice"
  | "minimumIncrementLabel"
  | "duration"
  | "startTime"
  | "endTime"
  | "antiSnipe"
  | "images"
  | "uploadImages"
  | "uploadHint"
  | "uploadDropText"
  | "imagesHint"
  | "noImages"
  | "setPrimary"
  | "cancel"
  | "creating"
  | "createAuctionButton"
  | "selectCategory"
  | "altTextOptional"
  | "createTitleRequired"
  | "createDescriptionRequired"
  | "createCategoryRequired"
  | "createStartingPriceMin"
  | "createReserveNonNegative"
  | "createBuyNowMin"
  | "createMinIncrementMin"
  | "createStartFuture"
  | "createEndAfterStart"
  | "createMaxImages"
  | "createInvalidImage"
  | "createImageTooLarge"
  | "createLoadCategoriesFailed"
  | "createAuctionSuccess"
  | "createAuctionFailed"
  | "createImageUploadFailed"
  | "statusLabel"
  | "unknownAuction"
  | "winning"
  | "outbid"
  | "unknown"
  | "changePasswordTitle"
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword"
  | "changePasswordButton"
  | "passwordMismatchError"
  | "passwordTooShort"
  | "passwordChangeSuccess"
  | "passwordChangeFailed"
  | "incorrectPassword"
  | "overview"
  | "myAuctions"
  | "myBids"
  | "wonAuctionsTab"
  | "profile"
  | "notifications"
  | "settings"
  | "agreeTermsLogin"
  | "agreeToTermsLabel"
  | "ended"
  | "solPluralShort"
  | "soldItems"
  | "loading"
  | "loadingAuction"
  | "loadingDashboard"
  | "browseAuctions"
  | "helpCenter"
  | "createAuction"
  | "manageAuctions"
  | "currentBidLabel"
  | "noBidsYet"
  | "startBidding"
  | "noItemsWatchlist"
  | "noWonAuctions"
  | "goToProfilePage"
  | "noNotifications"
  | "accountSettingsLabel"
  | "notificationPreferences"
  | "privacySecurity"
  | "manageAccountPrefs"
  | "controlNotifications"
  | "managePrivacySettings"
  | "listNewItem"
  | "viewListings"
  | "updateInfo"
  | "createNew"
  | "viewAllLink"
  | "sessionExpiring"
  | "sessionExpiringMessage"
  | "stayLoggedIn"
  | "logoutNow"
  | "checkBackSoon";

const translations: Record<Language, Record<TranslationKey, string>> = {
  lv: {
    profileSettings: "Profila iestatījumi",
    loadingDashboard: "Panelis tiek ielādēts...",
    sessionExpiring: "Sesija beidzas",
    sessionExpiringMessage:
      "Jūsu sesija drīz beigsies. Vai vēlaties palikt piesaistītam?",
    stayLoggedIn: "Palikt piesaistītam",
    logoutNow: "Izrakstīties",
    checkBackSoon: "Atgriezieties drīz jaunas izsoles",
    login: "Ielogoties",
    register: "Izveidot kontu",
    dashboard: "Panelis",
    adminPanel: "Admin panelis",
    accountSettings: "Konta iestatījumi",
    logout: "Izrakstīties",
    currentBid: "Šī brīža cena",
    buyNow: "Pirkt uzreiz",
    bids: "solījumi",
    left: "atlikušas",
    hoursShort: "st",
    minutesShort: "min",
    secondsShort: "s",
    auctionsTitle: "Aktuālās izsoles",
    liveAuctions: "Aktīvās izsoles",
    endedAuctions: "Beigušās izsoles",
    loading: "Ielāde...",
    noAuctions: "Nav pieejamu izsolu",
    statusActive: "Aktīva",
    statusEnding: "Beidzas drīz",
    statusEnded: "Beigusies",
    startsSoon: "Drīz sāksies",
    endingSoon: "Drīzumā",
    ended: "Beidzās",
    currentWinner: "Pašreizējais uzvarētājs",
    winner: "Uzvarētājs",
    loginTitle: "Ielogoties",
    loginSubtitle: "Pievienojieties lielākajam izsoles portālam Latvijā",
    username: "Lietotājvārds",
    usernamePlaceholder: "Ievadiet lietotājvārdu",
    password: "Parole",
    passwordPlaceholder: "Ievadiet paroli",
    loggingIn: "Notiek ielogošanās...",
    or: "vai",
    signInWithGoogle: "Ielogojieties ar Google",
    noAccount: "Nav konta?",
    registerHere: "Reģistrējies šeit",
    registerTitle: "Izveidot kontu",
    registerSubtitle: "Sāciet izsoles vai piedalieties esošajās",
    firstName: "Vārds",
    lastName: "Uzvārds",
    firstNamePlaceholder: "Jānis",
    lastNamePlaceholder: "Bērziņš",
    email: "E-pasts",
    emailPlaceholder: "janis@example.com",
    birthDate: "Dzimšanas datums",
    birthDateFormat: "Formāts: DD.MM.YYYY (piemēram, 15.06.1990)",
    usernameRequired: "Lietotājvārds",
    passwordConfirm: "Apstipriniet paroli",
    registering: "Notiek reģistrācija...",
    haveAccount: "Jau ir konts?",
    loginHere: "Ielogojies šeit",
    passwordMismatch: "Paroles nesakrīt",
    registerSuccess: "Reģistrācija veiksmīga. Lūdzu, ielogojieties.",
    dashboardTitle: "Panelis",
    welcomeBack: "Sveicināti,",
    pleaseLogin: "Lūdzu, ielogojieties, lai skatītu",
    pleaseLoginToBid: "Lūdzu pierakstieties, lai solītu",
    // Removed duplicate key
    activeAuctions: "Aktīvās izsoles",
    totalBids: "Kopējie solījumi",
    watchlist: "Vērojamie",
    wonAuctions: "Uzvarētās izsoles",
    quickActions: "Ātrās darbības",
    createNewAuction: "Izveidot jaunu izsoli",
    manageMyAuctions: "Pārvaldīt savas izsoles",
    editProfile: "Rediģēt profilu",
    myRecentAuctions: "Manas jaunākās izsoles",
    recentBids: "Jaunākie solījumi",
    viewAll: "Skatīt visu",
    noAuctionsYet: "Vēl nav izsoļu",
    watchlistTitle: "Vērojamie",
    noWatchlist: "Vērojamajos nav vienumu",
    myAuctionsTitle: "Manas izsoles",
    status: "Statuss",
    title: "Nosaukums",
    price: "Cena",
    actions: "Darbības",
    view: "Skatīt",
    bidHistory: "Solījumu vēsture",
    noBids: "Solījumu vēl nav",
    beFirst: "Esiet pirmais, kas izvieto solījumu!",
    seller: "Pārdevējs",
    category: "Kategorija",
    timeRemaining: "Atlicis laiks",
    calculating: "Aprēķina...",
    finalizing: "Apstrādā...",
    minimumIncrement: "Minimālais solis",
    minimumBid: "Minimālais solījums",
    yourBid: "Jūsu solījums",
    placeBid: "Solīt",
    addToWatchlist: "Pievienot vērojamajiem",
    removeFromWatchlist: "Noņemt no vērojamajiem",
    watchlistAdded: "Pievienots vērojamajiem!",
    watchlistRemoved: "Noņemts no vērojamajiem!",
    watchlistError: "Neizdevās mainīt vērojamos.",
    loadingAuction: "Ielādē izsoli...",
    errorLoadingAuction: "Kļūda ielādējot izsoli",
    auctionNotFound: "Izsole nav atrasta",
    alreadyHighest: "Jūs jau esat augstākais solītājs",
    invalidBid: "Lūdzu ievadiet derīgu summu",
    minBidAmount: "Minimālā solījuma summa ir",
    bidPlaced: "Solījums veiksmīgi izvietots!",
    bidFailed: "Neizdevās izvietot solījumu",
    auctionSingular: "Izsole",
    auctionPlural: "Izsoles",
    createAuctionTitle: "Izveidot izsoli",
    createAuctionSubtitle: "Aizpildiet informāciju, lai izveidotu jaunu izsoli",
    description: "Apraksts",
    pricing: "Cenas",
    startingPrice: "Sākuma cena",
    reservePrice: "Rezerves cena",
    minimumIncrementLabel: "Minimālais solis",
    duration: "Ilgums",
    startTime: "Sākuma laiks",
    endTime: "Beigu laiks",
    antiSnipe: "Anti-snipe pagarinājums (sekundes)",
    images: "Attēli",
    uploadImages: "Augšupielādēt attēlus",
    uploadHint: "PNG, JPG, GIF līdz 5MB",
    uploadDropText: "Klikšķiniet, lai augšupielādētu attēlus vai velciet",
    imagesHint: "Pievienojiet vismaz 1, līdz 10 attēliem",
    noImages: "Nav augšupielādētu attēlu",
    setPrimary: "Iestatīt kā galveno",
    cancel: "Atcelt",
    creating: "Izveido...",
    createAuctionButton: "Izveidot izsoli",
    selectCategory: "Izvēlieties kategoriju",
    altTextOptional: "Alt teksts (nav obligāts)",
    createTitleRequired: "Nosaukums ir obligāts",
    createDescriptionRequired: "Apraksts ir obligāts",
    createCategoryRequired: "Kategorija ir obligāta",
    createStartingPriceMin: "Sākuma cenai jābūt lielākai par 0",
    createReserveNonNegative: "Rezerves cena nevar būt negatīva",
    createBuyNowMin: "Cena 'Pirkt uzreiz' jābūt lielākai par sākuma cenu",
    createMinIncrementMin: "Minimālajam solim jābūt lielākam par 0",
    createStartFuture: "Sākuma laikam jābūt nākotnē",
    createEndAfterStart: "Beigu laikam jābūt pēc sākuma laika",
    createMaxImages: "Maksimāli 10 attēli",
    createInvalidImage: "Nav derīgs attēla fails",
    createImageTooLarge: "Pārsniedz 5MB limitu",
    createLoadCategoriesFailed: "Neizdevās ielādēt kategorijas",
    createAuctionSuccess: "Izsole veiksmīgi izveidota!",
    createAuctionFailed: "Neizdevās izveidot izsoli",
    createImageUploadFailed: "Neizdevās augšupielādēt attēlu",
    statusLabel: "Statuss",
    unknownAuction: "Nezināma izsole",
    winning: "Vadošais",
    outbid: "Pārsolīts",
    unknown: "Nezināms",
    changePasswordTitle: "Mainīt paroli",
    currentPassword: "Pašreizējā parole",
    newPassword: "Jaunā parole",
    confirmNewPassword: "Apstipriniet jauno paroli",
    changePasswordButton: "Mainīt paroli",
    passwordMismatchError: "Paroles nesakrīt",
    passwordTooShort: "Parolei jābūt vismaz 8 rakstzīmēm garai",
    passwordChangeSuccess: "Parole veiksmīgi nomainīta",
    passwordChangeFailed: "Neizdevās nomainīt paroli",
    incorrectPassword: "Pašreizējā parole nav pareiza",
    overview: "Pārskats",
    myAuctions: "Manas Izsoles",
    myBids: "Mani Piedāvājumi",
    wonAuctionsTab: "Uzvarētās Izsoles",
    profile: "Profils",
    notifications: "Paziņojumi",
    settings: "Iestatījumi",
    browseAuctions: "Pārlūkot Izsoles",
    helpCenter: "Palīdzības Centrs",
    createAuction: "Izveidot Izsoli",
    manageAuctions: "Pārvaldīt Savas Izsoles",
    currentBidLabel: "Pašreizējais piedāvājums",
    noBidsYet: "Pagaidām nav aktīvu piedāvājumu",
    startBidding: "Sāciet piedāvāt izsolēs, lai tās parādītos šeit.",
    noItemsWatchlist: "Jūsu vērojumu saraksts ir tukšs",
    noWonAuctions: "Pagaidām neesat uzvarējis nevienā izsolē",
    goToProfilePage: "Doties uz profilu",
    noNotifications: "Nav jaunu paziņojumu",
    accountSettingsLabel: "Konta Iestatījumi",
    notificationPreferences: "Paziņojumu Preferences",
    privacySecurity: "Privātums un Drošība",
    manageAccountPrefs: "Pārvaldīt konta iestatījumus un preferences",
    controlNotifications: "Kontrolēt, kā un kad saņemat paziņojumus",
    managePrivacySettings: "Pārvaldīt privātuma un drošības iestatījumus",
    listNewItem: "Ievietot Jaunu Preci",
    viewListings: "Skatīt Manus Sludinājumus",
    updateInfo: "Atjaunināt Informāciju",
    createNew: "Izveidot Jaunu",
    viewAllLink: "Skatīt visus",
    // profileSettings: "Profila iestatījumi", // Duplicate removed
    profileUpdated: "Profils veiksmīgi atjaunināts!",
    updateProfile: "Atjaunināt profilu",
    changeAvatar: "Mainīt attēlu",
    bio: "Bio",
    bioPlaceholder: "Pastāstiet par sevi...",
    phone: "Tālrunis",
    location: "Atrašanās vieta",
    website: "Mājaslapa",
    selectImageFile: "Lūdzu izvēlieties attēla failu",
    fileTooLarge: "Faila izmēram jābūt mazākam par 10MB",
    profileUpdateFailed: "Neizdevās atjaunināt profilu",
    usernameLabel: "Lietotājvārds",
    usernameCannotChange: "Lietotājvārdu nevar mainīt",
    avatarHint: "Noklikšķiniet uz kameras ikonas, lai mainītu attēlu",
    agreeToTerms: "Reģistrējoties jūs piekrītat mūsu",
    termsOfService: "Lietošanas noteikumiem",
    privacyPolicy: "Privātuma politikai",
    and: "un",
    agreeTermsLogin: "Ieiešanā sistēmā jūs piekrītat mūsu",
    agreeToTermsLabel: "Lietošanas noteikumiem",
    solPluralShort: "solījumi",
    soldItems: "Pārdotie priekšmeti",
    //sessionExpiring: "Sesija beidzas",
    //sessionExpiringMessage:
    //  "Jūsu sesija drīz beigsies. Vai vēlaties palikt piesaistītam?",
    //stayLoggedIn: "Palikt piesaistītam",
    //logoutNow: "Izrakstīties",
    //checkBackSoon: "Atgriezieties drīz jaunas izsoles",
  },
  en: {
    loadingDashboard: "Loading dashboard...",
    sessionExpiring: "Session Expiring",
    sessionExpiringMessage:
      "Your session will expire soon. Do you want to stay logged in?",
    stayLoggedIn: "Stay logged in",
    logoutNow: "Logout now",
    checkBackSoon: "Check back soon for new auctions",
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    adminPanel: "Admin Panel",
    accountSettings: "Account Settings",
    logout: "Logout",
    currentBid: "Current Bid",
    buyNow: "Buy Now",
    bids: "bids",
    left: "left",
    hoursShort: "h",
    minutesShort: "m",
    secondsShort: "s",
    auctionsTitle: "Live Auctions",
    liveAuctions: "Live Auctions",
    endedAuctions: "Ended Auctions",
    loading: "Loading...",
    noAuctions: "No auctions available",
    statusActive: "Active",
    profileSettings: "Profile Settings",
    currentBidLabel: "Current Bid",
    unknownAuction: "Unknown Auction",
    statusLabel: "Status",
    statusEnding: "Ending Soon",
    statusEnded: "Ended",
    startsSoon: "Starting Soon",
    endingSoon: "Ending Soon",
    ended: "Ended",
    currentWinner: "Current winner",
    winner: "Winner",
    loginTitle: "Login",
    loginSubtitle: "Join the largest auction portal in Latvia",
    username: "Username",
    usernamePlaceholder: "Enter username",
    password: "Password",
    passwordPlaceholder: "Enter password",
    loggingIn: "Logging in...",
    or: "or",
    signInWithGoogle: "Sign in with Google",
    noAccount: "No account?",
    registerHere: "Register here",
    registerTitle: "Create account",
    registerSubtitle: "Start auctions or join existing ones",
    firstName: "First name",
    lastName: "Last name",
    firstNamePlaceholder: "John",
    lastNamePlaceholder: "Smith",
    email: "Email",
    emailPlaceholder: "john@example.com",
    birthDate: "Date of birth",
    birthDateFormat: "Format: DD.MM.YYYY (e.g., 15.06.1990)",
    usernameRequired: "Username",
    passwordConfirm: "Confirm password",
    registering: "Registering...",
    haveAccount: "Already have an account?",
    loginHere: "Login here",
    passwordMismatch: "Passwords do not match",
    registerSuccess: "Registration successful. Please login.",
    dashboardTitle: "Dashboard",
    welcomeBack: "Welcome back,",
    pleaseLogin: "Please log in to view",
    pleaseLoginToBid: "Please log in to bid",
    activeAuctions: "Active Auctions",
    totalBids: "Total Bids",
    watchlist: "Watchlist",
    wonAuctions: "Won Auctions",
    quickActions: "Quick Actions",
    createNewAuction: "Create New Auction",
    manageMyAuctions: "Manage My Auctions",
    editProfile: "Edit Profile",
    myRecentAuctions: "My Recent Auctions",
    recentBids: "Recent Bids",
    viewAll: "View All",
    noAuctionsYet: "No auctions yet",
    watchlistTitle: "Watchlist",
    noWatchlist: "No items in watchlist",
    myAuctionsTitle: "My Auctions",
    status: "Status",
    title: "Title",
    price: "Price",
    actions: "Actions",
    view: "View",
    bidHistory: "Bid History",
    noBids: "No bids yet",
    beFirst: "Be the first to place a bid!",
    seller: "Seller",
    category: "Category",
    timeRemaining: "Time remaining",
    calculating: "Calculating...",
    finalizing: "Finalizing...",
    minimumIncrement: "Minimum increment",
    minimumBid: "Minimum bid",
    yourBid: "Your bid",
    placeBid: "Place bid",
    addToWatchlist: "Add to watchlist",
    removeFromWatchlist: "Remove from watchlist",
    watchlistAdded: "Added to watchlist!",
    watchlistRemoved: "Removed from watchlist!",
    watchlistError: "Failed to update watchlist.",
    loadingAuction: "Loading auction...",
    errorLoadingAuction: "Error loading auction",
    auctionNotFound: "Auction not found",
    alreadyHighest: "You are already the highest bidder",
    invalidBid: "Please enter a valid amount",
    minBidAmount: "Minimum bid amount is",
    bidPlaced: "Bid placed successfully!",
    bidFailed: "Failed to place bid",
    auctionSingular: "Auction",
    auctionPlural: "Auctions",
    createAuctionTitle: "Create Auction",
    createAuctionSubtitle: "Fill in the details to create a new auction",
    description: "Description",
    pricing: "Pricing",
    startingPrice: "Starting Price",
    reservePrice: "Reserve Price",
    minimumIncrementLabel: "Minimum Increment",
    duration: "Duration",
    startTime: "Start Time",
    endTime: "End Time",
    antiSnipe: "Anti-snipe Extension (seconds)",
    images: "Images",
    uploadImages: "Upload images",
    uploadHint: "PNG, JPG, GIF up to 5MB",
    uploadDropText: "Click to upload images or drag and drop",
    imagesHint: "Add at least 1, up to 10 images",
    noImages: "No images uploaded",
    setPrimary: "Set as Primary",
    cancel: "Cancel",
    creating: "Creating...",
    createAuctionButton: "Create Auction",
    selectCategory: "Select a category",
    altTextOptional: "Alt text (optional)",
    createTitleRequired: "Title is required",
    createDescriptionRequired: "Description is required",
    createCategoryRequired: "Category is required",
    createStartingPriceMin: "Starting price must be greater than 0",
    createReserveNonNegative: "Reserve price cannot be negative",
    createBuyNowMin: "Buy now price must be greater than starting price",
    createMinIncrementMin: "Minimum increment must be greater than 0",
    createStartFuture: "Start time must be in the future",
    createEndAfterStart: "End time must be after start time",
    createMaxImages: "Maximum 10 images allowed",
    createInvalidImage: "Not a valid image file",
    createImageTooLarge: "Exceeds 5MB limit",
    createLoadCategoriesFailed: "Failed to load categories",
    createAuctionSuccess: "Auction created successfully!",
    createAuctionFailed: "Failed to create auction",
    createImageUploadFailed: "Failed to upload image",
    //statusLabel: "Status",
    //unknownAuction: "Unknown auction",
    winning: "Winning",
    outbid: "Outbid",
    unknown: "Unknown",
    changePasswordTitle: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    changePasswordButton: "Change Password",
    passwordMismatchError: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters",
    passwordChangeSuccess: "Password changed successfully",
    passwordChangeFailed: "Failed to change password",
    incorrectPassword: "Current password is incorrect",
    overview: "Overview",
    myAuctions: "My Auctions",
    myBids: "My Bids",
    wonAuctionsTab: "Won Auctions",
    profile: "Profile",
    notifications: "Notifications",
    settings: "Settings",
    browseAuctions: "Browse Auctions",
    helpCenter: "Help Center",
    createAuction: "Create Auction",
    manageAuctions: "Manage Your Auctions",
    noBidsYet: "No active bids yet",
    startBidding: "Start bidding on auctions to see them here.",
    noItemsWatchlist: "Your watchlist is empty",
    noWonAuctions: "You haven't won any auctions yet",
    goToProfilePage: "Go to Profile",
    noNotifications: "No new notifications",
    accountSettingsLabel: "Account Settings",
    notificationPreferences: "Notification Preferences",
    privacySecurity: "Privacy & Security",
    manageAccountPrefs: "Manage account settings and preferences",
    controlNotifications: "Control how and when you receive notifications",
    managePrivacySettings: "Manage privacy and security settings",
    listNewItem: "List New Item",
    viewListings: "View My Listings",
    updateInfo: "Update Information",
    createNew: "Create New",
    viewAllLink: "View all",
    //profileSettings: "Profile Settings",
    profileUpdated: "Profile updated successfully!",
    updateProfile: "Update profile",
    changeAvatar: "Change avatar",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    phone: "Phone",
    location: "Location",
    website: "Website",
    selectImageFile: "Please select an image file",
    fileTooLarge: "File size must be less than 10MB",
    profileUpdateFailed: "Failed to update profile",
    usernameLabel: "Username",
    usernameCannotChange: "Username cannot be changed",
    avatarHint: "Click the camera icon to change your avatar",
    agreeToTerms: "By registering you agree to our",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    and: "and",
    agreeTermsLogin: "By signing in you agree to our",
    agreeToTermsLabel: "Terms of Service",
    //ended: "Ended",
    solPluralShort: "bids",
    soldItems: "Sold Items",
    //loading: "Loading...",
    //loadingAuction: "Loading auction...",
    //loadingDashboard: "Loading dashboard...",
    //sessionExpiring: "Session Expiring",
    //sessionExpiringMessage:
    //  "Your session is about to expire. Would you like to stay logged in?",
    //stayLoggedIn: "Stay Logged In",
    //logoutNow: "Logout Now",
  },
  ru: {
    login: "Войти",
    register: "Регистрация",
    dashboard: "Панель",
    adminPanel: "Админ панель",
    accountSettings: "Настройки аккаунта",
    logout: "Выйти",
    currentBid: "Текущая ставка",
    buyNow: "Купить сейчас",
    bids: "ставки",
    left: "осталось",
    hoursShort: "ч",
    minutesShort: "м",
    secondsShort: "с",
    auctionsTitle: "Актуальные аукционы",
    liveAuctions: "Живые аукционы",
    endedAuctions: "Завершённые аукционы",
    loading: "Загрузка...",
    noAuctions: "Нет доступных аукционов",
    statusActive: "Активный",
    statusEnding: "Скоро закончится",
    statusEnded: "Завершён",
    startsSoon: "Скоро начнётся",
    endingSoon: "Скоро",
    ended: "Завершён",
    currentWinner: "Текущий лидер",
    winner: "Победитель",
    loginTitle: "Войти",
    loginSubtitle: "Присоединяйтесь к крупнейшему аукционному порталу Латвии",
    username: "Логин",
    usernamePlaceholder: "Введите логин",
    password: "Пароль",
    passwordPlaceholder: "Введите пароль",
    loggingIn: "Выполняется вход...",
    or: "или",
    signInWithGoogle: "Войти через Google",
    noAccount: "Нет аккаунта?",
    registerHere: "Зарегистрируйтесь здесь",
    registerTitle: "Создать аккаунт",
    registerSubtitle: "Создайте аукцион или участвуйте в существующих",
    firstName: "Имя",
    lastName: "Фамилия",
    firstNamePlaceholder: "Иван",
    lastNamePlaceholder: "Иванов",
    email: "Эл. почта",
    emailPlaceholder: "ivan@example.com",
    birthDate: "Дата рождения",
    birthDateFormat: "Формат: ДД.ММ.ГГГГ (например, 15.06.1990)",
    usernameRequired: "Логин",
    passwordConfirm: "Подтвердите пароль",
    registering: "Регистрация...",
    haveAccount: "Уже есть аккаунт?",
    loginHere: "Войти здесь",
    passwordMismatch: "Пароли не совпадают",
    registerSuccess: "Регистрация успешна. Пожалуйста, войдите.",
    dashboardTitle: "Панель",
    welcomeBack: "С возвращением,",
    pleaseLogin: "Пожалуйста, войдите, чтобы посмотреть",
    pleaseLoginToBid: "Пожалуйста, войдите, чтобы делать ставки",
    loadingDashboard: "Загрузка панели...",
    activeAuctions: "Активные аукционы",
    totalBids: "Всего ставок",
    watchlist: "Наблюдаемые",
    wonAuctions: "Выигранные аукционы",
    quickActions: "Быстрые действия",
    createNewAuction: "Создать аукцион",
    manageMyAuctions: "Управлять аукционами",
    editProfile: "Редактировать профиль",
    myRecentAuctions: "Мои недавние аукционы",
    recentBids: "Недавние ставки",
    viewAll: "Смотреть все",
    noAuctionsYet: "Аукционов пока нет",
    watchlistTitle: "Наблюдаемые",
    noWatchlist: "Ничего в наблюдаемых",
    myAuctionsTitle: "Мои аукционы",
    status: "Статус",
    title: "Название",
    price: "Цена",
    actions: "Действия",
    view: "Смотреть",
    bidHistory: "История ставок",
    noBids: "Ставок ещё нет",
    beFirst: "Станьте первым, кто сделает ставку!",
    seller: "Продавец",
    category: "Категория",
    timeRemaining: "Осталось времени",
    calculating: "Считаем...",
    finalizing: "Завершение...",
    minimumIncrement: "Минимальный шаг",
    minimumBid: "Минимальная ставка",
    yourBid: "Ваша ставка",
    placeBid: "Сделать ставку",
    addToWatchlist: "В избранное",
    removeFromWatchlist: "Убрать из избранного",
    watchlistAdded: "Добавлено в избранное!",
    watchlistRemoved: "Удалено из избранного!",
    watchlistError: "Не удалось обновить избранное.",
    loadingAuction: "Загрузка аукциона...",
    errorLoadingAuction: "Ошибка загрузки аукциона",
    auctionNotFound: "Аукцион не найден",
    alreadyHighest: "Вы уже самый высокий участник",
    invalidBid: "Введите корректную сумму",
    minBidAmount: "Минимальная ставка",
    bidPlaced: "Ставка успешно размещена!",
    bidFailed: "Не удалось сделать ставку",
    auctionSingular: "Аукцион",
    auctionPlural: "Аукционы",
    createAuctionTitle: "Создать аукцион",
    createAuctionSubtitle: "Заполните данные, чтобы создать новый аукцион",
    description: "Описание",
    pricing: "Цены",
    startingPrice: "Стартовая цена",
    reservePrice: "Резервная цена",
    minimumIncrementLabel: "Минимальный шаг",
    duration: "Длительность",
    startTime: "Время начала",
    endTime: "Время окончания",
    antiSnipe: "Антиснайп продление (секунды)",
    images: "Изображения",
    uploadImages: "Загрузить изображения",
    uploadHint: "PNG, JPG, GIF до 5MB",
    uploadDropText: "Нажмите, чтобы загрузить или перетащите",
    imagesHint: "Добавьте минимум 1, максимум 10 изображений",
    noImages: "Нет загруженных изображений",
    setPrimary: "Сделать главным",
    cancel: "Отмена",
    creating: "Создание...",
    createAuctionButton: "Создать аукцион",
    selectCategory: "Выберите категорию",
    altTextOptional: "Alt текст (необязательно)",
    createTitleRequired: "Название обязательно",
    createDescriptionRequired: "Описание обязательно",
    createCategoryRequired: "Категория обязательна",
    createStartingPriceMin: "Стартовая цена должна быть больше 0",
    createReserveNonNegative: "Резервная цена не может быть отрицательной",
    createBuyNowMin: "Цена 'Купить сейчас' должна быть больше стартовой",
    createMinIncrementMin: "Минимальный шаг должен быть больше 0",
    createStartFuture: "Время начала должно быть в будущем",
    createEndAfterStart: "Время окончания должно быть после начала",
    createMaxImages: "Максимум 10 изображений",
    createInvalidImage: "Недопустимый файл изображения",
    createImageTooLarge: "Превышает лимит 5MB",
    createLoadCategoriesFailed: "Не удалось загрузить категории",
    createAuctionSuccess: "Аукцион успешно создан!",
    createAuctionFailed: "Не удалось создать аукцион",
    createImageUploadFailed: "Не удалось загрузить изображение",
    statusLabel: "Статус",
    unknownAuction: "Неизвестный аукцион",
    winning: "Лидер",
    outbid: "Перебили",
    unknown: "Неизвестно",
    changePasswordTitle: "Изменить пароль",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmNewPassword: "Подтвердите новый пароль",
    changePasswordButton: "Изменить пароль",
    passwordMismatchError: "Пароли не совпадают",
    passwordTooShort: "Пароль должен содержать не менее 8 символов",
    passwordChangeSuccess: "Пароль успешно изменен",
    passwordChangeFailed: "Не удалось изменить пароль",
    incorrectPassword: "Текущий пароль неверен",
    overview: "Обзор",
    myAuctions: "Мои Аукционы",
    myBids: "Мои Ставки",
    wonAuctionsTab: "Выигранные Аукционы",
    profile: "Профиль",
    notifications: "Уведомления",
    settings: "Настройки",
    browseAuctions: "Обзор Аукционов",
    helpCenter: "Центр Помощи",
    createAuction: "Создать Аукцион",
    manageAuctions: "Управление Аукционами",
    currentBidLabel: "Текущая ставка",
    noBidsYet: "Нет активных ставок",
    startBidding: "Начните делать ставки, чтобы они появились здесь.",
    noItemsWatchlist: "Список отслеживания пуст",
    noWonAuctions: "Вы еще не выиграли ни одного аукциона",
    goToProfilePage: "Перейти в профиль",
    noNotifications: "Нет новых уведомлений",
    accountSettingsLabel: "Настройки Аккаунта",
    notificationPreferences: "Настройки Уведомлений",
    privacySecurity: "Конфиденциальность и Безопасность",
    manageAccountPrefs: "Управление настройками аккаунта и предпочтениями",
    controlNotifications: "Управление уведомлениями и их получением",
    managePrivacySettings: "Управление конфиденциальностью и безопасностью",
    listNewItem: "Добавить Товар",
    viewListings: "Мои Объявления",
    updateInfo: "Обновить Информацию",
    createNew: "Создать Новый",
    viewAllLink: "Посмотреть все",
    profileSettings: "Настройки профиля",
    profileUpdated: "Профиль обновлён!",
    updateProfile: "Обновить профиль",
    changeAvatar: "Сменить аватар",
    bio: "О себе",
    bioPlaceholder: "Расскажите о себе...",
    phone: "Телефон",
    location: "Местоположение",
    website: "Сайт",
    selectImageFile: "Пожалуйста, выберите файл изображения",
    fileTooLarge: "Размер файла должен быть меньше 10MB",
    profileUpdateFailed: "Не удалось обновить профиль",
    usernameLabel: "Логин",
    usernameCannotChange: "Логин нельзя изменить",
    avatarHint: "Нажмите на иконку камеры, чтобы изменить аватар",
    agreeToTerms: "Регистрируясь, вы соглашаетесь с",
    termsOfService: "Условиями использования",
    privacyPolicy: "Политикой конфиденциальности",
    and: "и",
    agreeTermsLogin: "Входя в систему, вы соглашаетесь с",
    agreeToTermsLabel: "Условиями использования",
    //ended: "Завершён",
    solPluralShort: "ставки",
    soldItems: "Проданные товары",
    sessionExpiring: "Сеанс истекает",
    sessionExpiringMessage:
      "Ваш сеанс вот-вот истечет. Хотите остаться в системе?",
    stayLoggedIn: "Остаться в системе",
    logoutNow: "Выйти сейчас",
    checkBackSoon: "Повторно навестите в скором времени для новых аукционов",
    //sessionExpiring: "Сеанс истекает",
    //sessionExpiringMessage:
    //  "Ваш сеанс вот-вот истечет. Хотите остаться в системе?",
    //stayLoggedIn: "Остаться в системе",
    //logoutNow: "Выйти сейчас",
    //checkBackSoon: "Повторно навестите в скором времени для новых аукционов",
  },
};

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem("app_language");
  if (saved === "lv" || saved === "en" || saved === "ru") {
    return saved;
  }
  return "lv";
};

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    localStorage.setItem("app_language", language);
    set({ language });
  },
  t: (key) => translations[get().language][key] || key,
}));
