export interface LanguageOption {
  code: string;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
  status: 'verified' | 'unverified' | 'fallback';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr', status: 'verified' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', dir: 'ltr', status: 'fallback' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', dir: 'ltr', status: 'unverified' },
  { code: 'brx', nativeName: "बर'", englishName: 'Bodo', dir: 'ltr', status: 'fallback' },
  { code: 'doi', nativeName: 'डोगरी', englishName: 'Dogri', dir: 'ltr', status: 'fallback' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr', status: 'unverified' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr', status: 'unverified' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', dir: 'ltr', status: 'unverified' },
  { code: 'ks', nativeName: 'کٲشُر', englishName: 'Kashmiri', dir: 'rtl', status: 'fallback' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', dir: 'ltr', status: 'fallback' },
  { code: 'mai', nativeName: 'मैथिली', englishName: 'Maithili', dir: 'ltr', status: 'fallback' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', dir: 'ltr', status: 'unverified' },
  { code: 'mni', nativeName: 'ꯃꯩꯇꯩꯂꯣꯟ', englishName: 'Manipuri (Meitei)', dir: 'ltr', status: 'fallback' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', dir: 'ltr', status: 'unverified' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', dir: 'ltr', status: 'fallback' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', dir: 'ltr', status: 'unverified' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', dir: 'ltr', status: 'unverified' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', dir: 'ltr', status: 'fallback' },
  { code: 'sat', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', dir: 'ltr', status: 'fallback' },
  { code: 'sd', nativeName: 'سنڌي', englishName: 'Sindhi', dir: 'rtl', status: 'fallback' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', dir: 'ltr', status: 'unverified' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', dir: 'ltr', status: 'unverified' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', dir: 'rtl', status: 'unverified' },
];

export function getLanguageMeta(code: string): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
