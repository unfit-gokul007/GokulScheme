export interface SourceLink {
  label: string;
  url: string;
}

export interface Scheme {
  id: string;
  name_original: string;
  name_en: string;
  level: 'central' | 'state';
  state: string | null;
  category:
    | 'Agriculture'
    | 'Education'
    | 'Healthcare'
    | 'Employment'
    | 'Women & Children'
    | 'Housing';
  summary: string;
  eligibility: {
    description: string;
    rules: Record<string, unknown>;
  };
  benefits: string[];
  documents: string[];
  application_steps: string[];
  source_links: SourceLink[];
  last_verified: string;
  data_status: 'verified' | 'demo';
}

export interface ProfileToggles {
  student: boolean;
  farmer: boolean;
  disability: boolean;
  bpl: boolean;
  minority: boolean;
  widow: boolean;
  senior_citizen: boolean;
}

export interface UserProfile {
  state: string;
  age: string;
  gender: string;
  casteCategory: string;
  incomeRange: string;
  occupation: string;
  toggles: ProfileToggles;
}

export interface SchemeMatch {
  scheme: Scheme;
  score: number;
  confidence: 'Likely' | 'Possible' | 'Check eligibility';
  matchedReasons: string[];
  unconfirmed: string[];
}

export interface ChatSource {
  schemeId: string;
  schemeName: string;
  label: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  isError?: boolean;
}
