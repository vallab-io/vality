export type Locale = "en" | "ko";

export const defaultLocale: Locale = "en";

export const locales: Locale[] = ["en", "ko"];

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    viewAll: string;
    startFree: string;
    viewNewsletters: string;
    writeFirstIssue: string;
    manageNewsletter: string;
    noIssuesYet: string;
    published: string;
    untitled: string;
    user: string;
    lastUpdated: string;
  };

  // Navigation
  nav: {
    home: string;
    dashboard: string;
    profile: string;
    about: string;
    pricing: string;
    login: string;
    signup: string;
    logout: string;
    menu: string;
  };

  // Auth
  auth: {
    loginTitle: string;
    signupTitle: string;
    noAccount: string;
    hasAccount: string;
    loginLink: string;
    signupLink: string;
    emailPlaceholder: string;
    continueWithEmail: string;
    continueWithGoogle: string;
    sending: string;
    connecting: string;
    or: string;
    enterEmail: string;
    codeSent: string;
    codeSendFailed: string;
    googleLoginFailed: string;
    // Verification
    verificationCodeSent: string;
    verifying: string;
    resendCode: string;
    resending: string;
    codeResent: string;
    resendFailed: string;
    invalidCode: string;
    tryDifferentEmail: string;
    // Success messages
    signupSuccess: string;
    loginSuccess: string;
    createNewsletterPrompt: string;
    // OAuth callback
    authFailed: string;
    authFailedOAuth: string;
    redirectingToLogin: string;
    processing: string;
    missingParams: string;
    invalidAuthInfo: string;
    processingError: string;
  };

  // Pricing
  pricing: {
    title: string;
    description: string;
    earlyAccess: string;
    foundingMember: string;
    foundingMemberDescription: string;
    startButton: string;
    earlyAccessBenefit1: string;
    earlyAccessBenefit2: string;
    earlyAccessBenefit3: string;
  };

  // About
  about: {
    heroTitle1: string;
    heroTitle2: string;
    heroDescription: string;
    valueTitle: string;
    valueSubtitle: string;
    valueCard1Title: string;
    valueCard1Desc: string;
    valueCard2Title: string;
    valueCard2Desc: string;
    valueCard3Title: string;
    valueCard3Desc: string;
    featuresTitle: string;
    featuresSubtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    ctaTitle: string;
    ctaDesc1: string;
    ctaDesc2: string;
    ctaDesc3: string;
  };

  // Home
  home: {
    forYou: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    ctaSubtext: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    description: string;
    manageNewsletter: string;
    totalSubscribers: string;
    activeSubscribers: string;
    publishedIssues: string;
    publishedSoFar: string;
    drafts: string;
    draftsInProgress: string;
    recentIssues: string;
    noPublishedIssues: string;
    writeFirstIssue: string;
  };

  // Sidebar
  sidebar: {
    home: string;
    dashboard: string;
    issues: string;
    subscribers: string;
    analytics: string;
    settings: string;
    subscription: string;
    accountSettings: string;
    loading: string;
    noNewsletter: string;
    createNewsletter: string;
    logout: string;
    signIn: string;
    about: string;
    profile: string;
  };

  // Upgrade Dialog
  upgrade: {
    title: string;
    description: string;
    perMonth: string;
    unlimitedNewsletters: string;
    unlimitedSubscribers: string;
    advancedAnalytics: string;
    customDomain: string;
    startPro: string;
    cancelAnytime: string;
  };

  // Footer
  footer: {
    terms: string;
    privacy: string;
  };

  // Newsletter Sub Items
  newsletterSub: {
    issues: string;
    subscribers: string;
    analytics: string;
    settings: string;
  };

  // Issues Page
  issues: {
    title: string;
    newIssue: string;
    creating: string;
    all: string;
    published: string;
    draft: string;
    scheduled: string;
    archived: string;
    noIssues: string;
    noIssuesDesc: string;
    noResults: string;
    noResultsDesc: string;
    createFirst: string;
    searchPlaceholder: string;
    newest: string;
    oldest: string;
    loadingIssues: string;
    failedToLoad: string;
    deleteConfirm: string;
    deleted: string;
    deleteFailed: string;
    createFailed: string;
    publishedAt: string;
    scheduledAt: string;
    createdAt: string;
    edit: string;
    view: string;
    totalIssues: string;
  };

  // Subscribers Page
  subscribers: {
    title: string;
    addSubscriber: string;
    addSubscriberDesc: string;
    email: string;
    emailPlaceholder: string;
    add: string;
    adding: string;
    all: string;
    active: string;
    pending: string;
    unsubscribed: string;
    searchPlaceholder: string;
    status: string;
    subscribedAt: string;
    actions: string;
    total: string;
    noResults: string;
    noSubscribers: string;
    loadingSubscribers: string;
    failedToLoad: string;
    pleaseEnterEmail: string;
    addSuccess: string;
    addFailed: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteFailed: string;
  };

  // Analytics Page
  analytics: {
    title: string;
    description: string;
    comingSoon: string;
    comingSoonDesc: string;
    subscriberStats: string;
    subscriberStatsDesc: string;
    emailPerformance: string;
    emailPerformanceDesc: string;
    issueAnalytics: string;
    issueAnalyticsDesc: string;
    periodComparison: string;
    periodComparisonDesc: string;
    segmentAnalysis: string;
    segmentAnalysisDesc: string;
    visualCharts: string;
    visualChartsDesc: string;
  };

  // Settings Page
  settings: {
    title: string;
    description: string;
    profileTab: string;
    newsletterTab: string;
    accountTab: string;
    profile: string;
    name: string;
    namePlaceholder: string;
    username: string;
    usernamePlaceholder: string;
    usernameRequired: string;
    usernameMinLength: string;
    usernameTaken: string;
    bio: string;
    bioPlaceholder: string;
    profileImage: string;
    uploadImage: string;
    uploading: string;
    removeImage: string;
    imageFormats: string;
    imageSizeLimit: string;
    imageUploaded: string;
    imageRemoved: string;
    imageUploadFailed: string;
    imageRemoveFailed: string;
    saveChanges: string;
    saving: string;
    profileSaved: string;
    profileSaveFailed: string;
    newsletterName: string;
    newsletterNamePlaceholder: string;
    newsletterDescription: string;
    newsletterDescPlaceholder: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    deleteAccountButton: string;
    deleteConfirmTitle: string;
    deleteConfirmDesc: string;
    deleteConfirmInput: string;
    deleteConfirmButton: string;
    permanentDelete: string;
    deleting: string;
    deleteSuccess: string;
    deleteFailed: string;
    // Newsletter settings
    newsletterSettings: string;
    basicInfo: string;
    urlSlug: string;
    urlSlugPlaceholder: string;
    emailSettings: string;
    senderName: string;
    senderNamePlaceholder: string;
    senderNameHint: string;
    timezone: string;
    timezoneSelect: string;
    timezoneHint: string;
    subscribeWidget: string;
    subscribeWidgetDesc: string;
    embedCode: string;
    embedCodeDesc: string;
    copyCode: string;
    codeCopied: string;
    copyFailed: string;
    newsletterLoadFailed: string;
    newsletterSaved: string;
    newsletterSaveFailed: string;
  };

  // Subscription Page
  subscription: {
    title: string;
    description: string;
    comingSoon: string;
    comingSoonDesc: string;
  };

  // Onboarding
  onboarding: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    username: string;
    usernameRequired: string;
    usernamePlaceholder: string;
    usernameHint: string;
    usernameMinLength: string;
    usernameAvailable: string;
    usernameTaken: string;
    usernameCheckError: string;
    name: string;
    nameOptional: string;
    namePlaceholder: string;
    bio: string;
    bioOptional: string;
    bioPlaceholder: string;
    newsletterName: string;
    newsletterNameRequired: string;
    newsletterNamePlaceholder: string;
    newsletterNameHint: string;
    slug: string;
    slugRequired: string;
    slugPlaceholder: string;
    slugMinLength: string;
    slugInvalid: string;
    slugAvailable: string;
    slugHint: string;
    newsletterDesc: string;
    newsletterDescOptional: string;
    newsletterDescPlaceholder: string;
    senderName: string;
    senderNameOptional: string;
    senderNamePlaceholder: string;
    senderNameHint: string;
    next: string;
    back: string;
    complete: string;
    completing: string;
    saving: string;
    startButton: string;
    createNewsletter: string;
    creating: string;
    profileSaved: string;
    newsletterCreated: string;
    saveFailed: string;
    createFailed: string;
    enterUsername: string;
    enterNewsletterName: string;
    enterSlug: string;
    country: string;
    countrySelect: string;
    countryHint: string;
  };

  // Issue Editor
  editor: {
    titlePlaceholder: string;
    contentPlaceholder: string;
    slashPlaceholder: string;
    saveDraft: string;
    publish: string;
    publishing: string;
    saving: string;
    preview: string;
    settings: string;
    coverImage: string;
    excerpt: string;
    excerptPlaceholder: string;
    sendEmail: string;
    sendEmailDesc: string;
    back: string;
    email: string;
    archive: string;
    noTitle: string;
    loadFailed: string;
    contentRequired: string;
    titleRequired: string;
    slugRequired: string;
    saved: string;
    saveFailed: string;
    publishFailed: string;
    published: string;
    scheduled: string;
    scheduledSuccess: string;
    publishSettings: string;
    publishSettingsDesc: string;
    emailNotice: string;
    emailNoticeZero: string;
    urlSlug: string;
    urlSlugHint: string;
    publishTiming: string;
    publishNow: string;
    publishNowDesc: string;
    schedulePublish: string;
    schedulePublishDesc: string;
    date: string;
    time: string;
    scheduledDateRequired: string;
    showPreview: string;
    hidePreview: string;
    // Slash Commands
    slashHeading1: string;
    slashHeading1Desc: string;
    slashHeading2: string;
    slashHeading2Desc: string;
    slashHeading3: string;
    slashHeading3Desc: string;
    slashBulletList: string;
    slashBulletListDesc: string;
    slashNumberedList: string;
    slashNumberedListDesc: string;
    slashQuote: string;
    slashQuoteDesc: string;
    slashDivider: string;
    slashDividerDesc: string;
    slashImage: string;
    slashImageDesc: string;
    slashImageSaveFirst: string;
    slashImageInvalidFormat: string;
    slashImageTooLarge: string;
    slashImageUploading: string;
    slashImageUploaded: string;
    slashImageUploadFailed: string;
  };

  // Embed Widget
  embed: {
    title: string;
    description: string;
    previewTitle: string;
    newsletter: string;
    subscribeDesc: string;
    email: string;
    emailPlaceholder: string;
    subscribe: string;
    subscribing: string;
    subscribed: string;
    subscribeFailed: string;
    embedCode: string;
    embedCodeDesc: string;
    copyCode: string;
    copied: string;
    copyFailed: string;
    errorRetry: string;
  };

  // Public Pages
  public: {
    subscribe: string;
    subscribeDesc: string;
    emailPlaceholder: string;
    emailInputPlaceholder: string;
    subscribing: string;
    subscribed: string;
    subscribedCompact: string;
    subscribedFull: string;
    alreadySubscribed: string;
    subscribeFailed: string;
    subscribeSuccess: string;
    enterEmail: string;
    checkEmail: string;
    shareTwitter: string;
    copyLink: string;
    linkCopied: string;
    likes: string;
    newsletters: string;
    subscribersCount: string;
    recentIssues: string;
    articlesCount: string;
    userNotFound: string;
    subscribeToNewsletter: string;
    publishedArticles: string;
    noPublishedArticles: string;
    newsletterNotFound: string;
    articleNotFound: string;
    coverImage: string;
  };

  // Legal Pages
  legal: {
    termsTitle: string;
    privacyTitle: string;
  };
  unsubscribe: {
    processing: string;
    success: string;
    successDesc: string;
    alreadyUnsubscribed: string;
    alreadyUnsubscribedDesc: string;
    errorTitle: string;
    error: string;
    invalidLink: string;
    invalidLinkDesc: string;
    notFound: string;
    retry: string;
    goHome: string;
  };
}

