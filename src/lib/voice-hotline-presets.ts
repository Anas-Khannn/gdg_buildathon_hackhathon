// Known Peshawar areas with geo-coordinates and Union Council mapping
export const PESHAWAR_LOCATIONS: Record<string, { lat: number; lng: number; areaName: string }> = {
  "kohati gate": { lat: 34.0090, lng: 71.5720, areaName: "Kohati Gate" },
  "saddar": { lat: 34.0080, lng: 71.5450, areaName: "Saddar" },
  "hayatabad": { lat: 33.9850, lng: 71.4420, areaName: "Hayatabad" },
  "university town": { lat: 34.0040, lng: 71.5030, areaName: "University Town" },
  "gulbahar": { lat: 34.0160, lng: 71.5950, areaName: "Gulbahar" },
  "charsadda road": { lat: 34.0380, lng: 71.5850, areaName: "Charsadda Road" },
  "hashtnagri": { lat: 34.0150, lng: 71.5830, areaName: "Hashtnagri" },
  "ring road": { lat: 33.9890, lng: 71.5650, areaName: "Ring Road" },
  "yakatooth": { lat: 34.0060, lng: 71.5810, areaName: "Yakatooth" },
  "dabgari gardens": { lat: 34.0035, lng: 71.5620, areaName: "Dabgari Gardens" },
  "karkhano": { lat: 34.0010, lng: 71.4250, areaName: "Karkhano" },
  "jamrud road": { lat: 33.9980, lng: 71.4850, areaName: "Jamrud Road" },
};

// Dialect Presets for Testing & Evaluators (Pashto, Urdu, Hindko)
export const DIALECT_PRESETS = [
  {
    id: "kohati-underpass-ps",
    title: "Kohati Gate Underpass (Pashto)",
    titleUr: "کوہاٹی گیٹ انڈرپاس (پښتو)",
    text: "سلام، زه کوہاټي ګیټ لاندې انڈرپاس کښې یم۔ دلته سخت باران دی او لوی نالی پوره بنده ده۔ ډک ګاډي په اوبو کښې ولاړ دي، اوبه زیاتیږي او لار بنده ده۔ مهرباني وکړئ سمدستي مرسته راولېږئ!",
    language: "ps",
    location: "Kohati Gate",
  },
  {
    id: "saddar-cantt-ur",
    title: "Saddar Cantt Bazar (Urdu)",
    titleUr: "صدر کینٹ بازار (اردو)",
    text: "السلام علیکم۔ میں صدر کینٹ بازار مین روڈ سے بول رہا ہوں۔ نالہ مکمل طور پر پلاسٹک کچرے سے بند ہے اور سڑک پر گھٹنوں تک پانی کھڑا ہو چکا ہے۔ دکانوں کے اندر گندا پانی جا رہا ہے، فوری ویکیوم ٹرک بھیجیں۔",
    language: "ur",
    location: "Saddar",
  },
  {
    id: "gulbahar-manhole-ur",
    title: "Gulbahar Open Manhole (Urdu/Hindko)",
    titleUr: "گلبہار گٹر کا ڈھکن غائب (خطرناک)",
    text: "ایمرجنسی! گلبہار چارسدہ روڈ موڑ پر گٹر کا بھاری ڈھکن ابلتے پانی میں بہہ گیا ہے۔ گہرا گڑھا پانی کے نیچے چھپا ہوا ہے۔ پیدل اور موٹر سائیکل والے گر سکتے ہیں، خدارا فورا رکاوٹیں لگائیں۔",
    language: "ur",
    location: "Gulbahar",
  },
  {
    id: "hayatabad-phase3-ps",
    title: "Hayatabad Phase 3 (Pashto)",
    titleUr: "حیات آباد فیز 3 (پښتو)",
    text: "حیات آباد فیز 3 کمرشل ایریا کښې د اوبو لویه ډنډه جوړه ده۔ باران سخت دی او د سړک غاړې نالې کثافاتو بندې کړي دي۔ ریسکیو او WSSP ټیم دې ژر ورسیږي۔",
    language: "ps",
    location: "Hayatabad",
  },
];

