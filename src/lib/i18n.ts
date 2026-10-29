export type Language = "en" | "ur" | "ps";

export interface Translations {
  appName: string;
  tagline: string;
  reportProblem: string;
  photoStepTitle: string;
  photoStepSubtitle: string;
  takePhoto: string;
  uploadPhoto: string;
  aiAnalyzing: string;
  aiSuggested: string;
  aiFailed: string;
  sendReport: string;
  reportSentToast: string;
  seeThisToo: string;
  confirmedToast: string;
  isItReallyFixed: string;
  yesFixed: string;
  noStillThere: string;
  noProblemsNear: string;
  locationDenied: string;
  offlineNotice: string;
  avoidZoneActive: string;
  avoidZoneLegend: string;
  filtersAll: string;
  filterDanger: string;
  filterDrain: string;
  filterWater: string;
  filterManhole: string;
  filterFixed: string;
  scoreboard: string;
  mapView: string;
  adminPortal: string;
  about: string;
  signUp: string;
  signIn: string;
  signOut: string;
  duplicateTitle: string;
  duplicateDesc: string;
  confirmDuplicateBtn: string;
  submitAnywayBtn: string;
  severities: {
    ankle: string;
    knee: string;
    danger: string;
    fixed: string;
  };
  types: {
    blocked_drain: string;
    standing_water: string;
    open_manhole: string;
    garbage_in_drain: string;
    other: string;
  };
  status: {
    open: string;
    sent: string;
    marked_fixed: string;
    verified_fixed: string;
  };
  scoreboardPitch: string;
  daysToFix: string;
  worstAreas: string;
  reportedVsFixed: string;
  safeRoute: string;
  planSafeRoute: string;
  startLocation: string;
  endLocation: string;
  calculateSafeRoute: string;
  radarActive: string;
  radarProximityAlert: string;
  routeSafeTitle: string;
  routeDirectTitle: string;
  avoidedHazardsLabel: string;
  emergencyHelplines: string;
  floodSimulator: string;
  floodSimTagline: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "AquaSentinel",
    tagline: "AI Urban Hazard & Flood Intelligence Sentinel",
    reportProblem: "Report a problem",
    photoStepTitle: "Take a photo of the problem",
    photoStepSubtitle: "Capture the drain, flooded street, or open manhole clearly.",
    takePhoto: "Take Photo",
    uploadPhoto: "Upload from Gallery",
    aiAnalyzing: "Gemini Vision is analyzing drain depth & hazard...",
    aiSuggested: "This looks like a {type}, {severity}. Change it if we got it wrong.",
    aiFailed: "We couldn't read the photo. Pick the problem type yourself.",
    sendReport: "Send report",
    reportSentToast: "Report sent. Nearby citizens will see it.",
    seeThisToo: "I see this too",
    confirmedToast: "Thanks! {n} people have confirmed this issue.",
    isItReallyFixed: "Is it really fixed?",
    yesFixed: "Yes, it is fixed",
    noStillThere: "No, still there",
    noProblemsNear: "No problems reported near you. If you see one, report it.",
    locationDenied: "We can't find your location. Turn on GPS or tap the map.",
    offlineNotice: "No internet. Your report is saved and will send when you're back online.",
    avoidZoneActive: "Avoid-road zone active",
    avoidZoneLegend: "Red zones indicate dangerous flooding or open manholes",
    filtersAll: "All",
    filterDanger: "Danger",
    filterDrain: "Blocked drain",
    filterWater: "Standing water",
    filterManhole: "Open manhole",
    filterFixed: "Verified fixed",
    scoreboard: "Scoreboard",
    mapView: "Live Map",
    adminPortal: "Admin",
    about: "What We Solve",
    signUp: "Sign Up",
    signIn: "Sign in",
    signOut: "Sign out",
    duplicateTitle: "Nearby Problem Found",
    duplicateDesc: "An active {type} was already reported {dist}m away. Is this the same problem?",
    confirmDuplicateBtn: "Yes, add my confirmation",
    submitAnywayBtn: "No, create new report",
    severities: {
      ankle: "Ankle-deep",
      knee: "Knee-deep",
      danger: "Danger",
      fixed: "Verified fixed",
    },
    types: {
      blocked_drain: "Blocked drain",
      standing_water: "Standing water",
      open_manhole: "Open manhole",
      garbage_in_drain: "Garbage in drain",
      other: "Other hazard",
    },
    status: {
      open: "Reported",
      sent: "Sent to WSSP",
      marked_fixed: "Marked fixed by WSSP",
      verified_fixed: "Citizen-verified fixed",
    },
    scoreboardPitch: "Peshawar does not lack complaints. It lacks a map that makes them impossible to ignore.",
    daysToFix: "avg days to fix",
    worstAreas: "Worst 3 areas this month",
    reportedVsFixed: "Reported vs Fixed comparison",
    safeRoute: "Safe Route",
    planSafeRoute: "Plan Safe Route (محفوظ راستہ)",
    startLocation: "Starting Point",
    endLocation: "Destination",
    calculateSafeRoute: "Calculate Safe Route",
    radarActive: "Manhole Radar Active",
    radarProximityAlert: "Warning: Active open manhole or flood nearby!",
    routeSafeTitle: "Safe Diversion (0 Choke Points)",
    routeDirectTitle: "Direct Path (Hazard Clashes)",
    avoidedHazardsLabel: "Hazards Avoided",
    emergencyHelplines: "Emergency Helplines (SOS)",
    floodSimulator: "AI Flood Simulator",
    floodSimTagline: "Predict urban storm runoff & simulate drain desilting across Peshawar",
  },
  ur: {
    appName: "ایکوا سینٹینل",
    tagline: "پشاور کا خودکار اے آئی اربن ہیزرڈ و سیلاب انٹیلی جنس نظام",
    reportProblem: "مسئلہ رپورٹ کریں",
    photoStepTitle: "مسئلے کی تصویر لیں",
    photoStepSubtitle: "بند نالی، کھڑا پانی یا کھلا مین ہول واضح طور پر دکھائیں۔",
    takePhoto: "تصویر لیں",
    uploadPhoto: "گیلری سے منتخب کریں",
    aiAnalyzing: "مصنوعی ذہانت تصویر کا جائزہ لے رہی ہے...",
    aiSuggested: "یہ {type}، {severity} معلوم ہوتا ہے۔ اگر غلط ہے تو تبدیل کریں۔",
    aiFailed: "ہم تصویر پڑھ نہیں سکے۔ مسئلہ خود منتخب کریں۔",
    sendReport: "رپورٹ بھیجیں",
    reportSentToast: "رپورٹ بھیج دی گئی۔ قریبی شہری اب اسے دیکھ سکیں گے۔",
    seeThisToo: "میں نے بھی دیکھا ہے",
    confirmedToast: "شکریہ! {n} شہریوں نے اس مسئلے کی تصدیق کی ہے۔",
    isItReallyFixed: "کیا واقعی ٹھیک ہو گیا ہے؟",
    yesFixed: "جی ہاں، ٹھیک ہو گیا",
    noStillThere: "نہیں، ابھی بھی مسئلہ ہے",
    noProblemsNear: "آپ کے قریب کوئی مسئلہ رپورٹ نہیں ہوا۔ اگر ہے تو رپورٹ کریں۔",
    locationDenied: "آپ کی لوکیشن معلوم نہیں ہو سکی۔ جی پی ایس آن کریں یا نقشے پر کلک کریں۔",
    offlineNotice: "انٹرنیٹ نہیں ہے۔ رپورٹ محفوظ ہے، آن لائن ہوتے ہی بھیج دی جائے گی۔",
    avoidZoneActive: "متبادل راستہ اختیار کریں",
    avoidZoneLegend: "سرخ دائرے گہرے پانی یا کھلے مین ہول کا خطرہ ظاہر کرتے ہیں",
    filtersAll: "تمام",
    filterDanger: "خطرہ",
    filterDrain: "بند نالی",
    filterWater: "کھڑا پانی",
    filterManhole: "کھلا مین ہول",
    filterFixed: "تصدیق شدہ ٹھیک",
    scoreboard: "کارکردگی بورڈ",
    mapView: "لائیو نقشہ",
    adminPortal: "ایڈمن",
    about: "ہمارا مقصد",
    signUp: "اکاؤنٹ بنائیں",
    signIn: "لاگ ان",
    signOut: "لاگ آؤٹ",
    duplicateTitle: "قریبی مسئلہ پہلے سے موجود ہے",
    duplicateDesc: "یہاں سے {dist} میٹر کے فاصلے پر {type} پہلے ہی رپورٹ ہو چکا ہے۔ کیا یہ وہی ہے؟",
    confirmDuplicateBtn: "ہاں، میری بھی تصدیق شامل کریں",
    submitAnywayBtn: "نہیں، نئی رپورٹ بنائیں",
    severities: {
      ankle: "ٹخنے تک",
      knee: "گھٹنے تک",
      danger: "شدید خطرہ",
      fixed: "ٹھیک ہو گیا",
    },
    types: {
      blocked_drain: "بند نالی",
      standing_water: "کھڑا پانی",
      open_manhole: "کھلا مین ہول",
      garbage_in_drain: "نالی میں کچرا",
      other: "دیگر مسئلہ",
    },
    status: {
      open: "رپورٹ شدہ",
      sent: "ڈبلیو ایس ایس پی کو ارسال",
      marked_fixed: "عملے نے ٹھیک ظاہر کیا",
      verified_fixed: "شہریوں کی تصدیق شدہ",
    },
    scoreboardPitch: "پشاور میں شکایات کی کمی نہیں، ایسے نقشے کی کمی ہے جسے نظر انداز نہ کیا جا سکے۔",
    daysToFix: "حل ہونے کا اوسط وقت (دن)",
    worstAreas: "سب سے زیادہ متاثرہ 3 علاقے",
    reportedVsFixed: "رپورٹ بمقابلہ حل شدہ موازنہ",
    safeRoute: "محفوظ راستہ",
    planSafeRoute: "محفوظ راستہ تلاش کریں",
    startLocation: "روانگی کا مقام",
    endLocation: "منزل کا مقام",
    calculateSafeRoute: "محفوظ راستہ بنائیں",
    radarActive: "مین ہول ریڈار الرٹ فعال ہے",
    radarProximityAlert: "⚠️ ہوشیار: چند میٹر میں کھلا مین ہول یا سیلابی پانی ہے!",
    routeSafeTitle: "محفوظ راستہ (کوئی خطرہ نہیں)",
    routeDirectTitle: "براہِ راست راستہ (خطرناک رکاوٹیں)",
    avoidedHazardsLabel: "بچے ہوئے خطرات",
    emergencyHelplines: "ہنگامی ہیلپ لائنز (SOS)",
    floodSimulator: "اے آئی سیلاب سمیلیٹر",
    floodSimTagline: "پشاور کے 8 طاسوں میں طوفانی بارش اور نالوں کی صفائی کا سائنسی تجزیہ",
  },
  ps: {
    appName: "ایکوا سینټینل",
    tagline: "د پیښور د ښاري خطرونو او سېلابونو هوښیار نظام",
    reportProblem: "ستونزه ثبت کړئ",
    photoStepTitle: "د ستونزې انځور واخلئ",
    photoStepSubtitle: "بنده نالۍ، ولاړې اوبه یا خلاص مین هول په روښانه توګه وښایئ.",
    takePhoto: "انځور واخلئ",
    uploadPhoto: "له ګالري څخه انتخاب کړئ",
    aiAnalyzing: "هوښیار نظام د انځور کتنه کوي...",
    aiSuggested: "دا {type}، {severity} ښکاري. که غلط وي نو بدل یې کړئ.",
    aiFailed: "موږ انځور لوستلی نه شو. مهرباني وکړئ ستونزه په خپله وټاکئ.",
    sendReport: "راپور واستوئ",
    reportSentToast: "راپور واستول شو. د سیمې خلک به یې اوس پر نقشه وویني.",
    seeThisToo: "ما هم دا ولیدل",
    confirmedToast: "مننه! {n} کسانو د دې ستونزې تصدیق کړی دی.",
    isItReallyFixed: "ایا واقعا دا حل شوی دی؟",
    yesFixed: "هو، حل شوی دی",
    noStillThere: "نه، لا هم پاتې دی",
    noProblemsNear: "ستاسو شاوخوا کومه ستونزه نشته. که شتون ولري نو راپور یې کړئ.",
    locationDenied: "ستاسو موقعیت معلوم نشو. جي پي ایس چالان کړئ یا په نقشه کلیک وکړئ.",
    offlineNotice: "انټرنېټ نشته. راپور خوندي دی، د انټرنېټ راتلو سره به واستول شي.",
    avoidZoneActive: "د خطر سیمه فعاله ده",
    avoidZoneLegend: "سورې کړۍ ژورې اوبه یا خلاص مین هولونه ښیي",
    filtersAll: "ټول",
    filterDanger: "خطر",
    filterDrain: "بنده نالۍ",
    filterWater: "ولاړې اوبه",
    filterManhole: "خلاص مین هول",
    filterFixed: "تصدیق شوی حل",
    scoreboard: "د سیمو کچه",
    mapView: "ژوندۍ نقشه",
    adminPortal: "اډمین",
    about: "زموږ موخه",
    signUp: "حساب جوړول",
    signIn: "ننوتل",
    signOut: "وتل",
    duplicateTitle: "ورته ستونزه شتون لري",
    duplicateDesc: "دلته نږدې په {dist} مترۍ کې همدا ستونزه ({type}) راپور شوې ده. ایا دا هماغه ده؟",
    confirmDuplicateBtn: "هو، زما تایید هم ورزیات کړئ",
    submitAnywayBtn: "نه، نوی راپور ثبت کړئ",
    severities: {
      ankle: "د ښپو پورې",
      knee: "د زنګون پورې",
      danger: "خطرناک",
      fixed: "حل شوی",
    },
    types: {
      blocked_drain: "بنده نالۍ",
      standing_water: "ولاړې اوبه",
      open_manhole: "خلاص مین هول",
      garbage_in_drain: "په نالۍ کې کثافات",
      other: "نور مشکلات",
    },
    status: {
      open: "ثبت شوی",
      sent: "ډبلیو ایس ایس پی ته ولېږل شو",
      marked_fixed: "د کارکوونکو لخوا حل وښودل شو",
      verified_fixed: "د خلکو تایید شوی حل",
    },
    scoreboardPitch: "په پېښور کې د شکایتونو کمی نشته، د داسې نقشې اړتیا ده چې څوک ترې سترګې پټې نه کړي.",
    daysToFix: "د حل اوسط وخت (ورځې)",
    worstAreas: "۳ تر ټولو ځنډېدلې سیمې",
    reportedVsFixed: "د ثبت شوو او حل شوو پرتله",
    safeRoute: "خوندي لاره",
    planSafeRoute: "خوندي لاره وټاکئ",
    startLocation: "د حرکت ځای",
    endLocation: "منزل",
    calculateSafeRoute: "خوندي لاره پیدا کړئ",
    radarActive: "د مین هول خبرداری فعال دی",
    radarProximityAlert: "⚠️ خبرداری: نږدې خلاص مین هول یا ولاړې اوبه شته!",
    routeSafeTitle: "خوندي لاره (له خطره پاکه)",
    routeDirectTitle: "مستقيمه لاره (خطرناکه)",
    avoidedHazardsLabel: "مخنیوی شوي خطرونه",
    emergencyHelplines: "بېړنۍ شمېرې (SOS)",
    floodSimulator: "د سېلاب د وړاندوینې AI سمیلیټر",
    floodSimTagline: "په پیښور کې د دروند باران د راټولېدو او نالو د خلاصولو ساینسي وړاندوینه",
  },
};
