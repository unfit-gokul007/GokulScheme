const AADHAAR_REGEX = /(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g;
const PAN_REGEX = /\b[A-Za-z]{5}\d{4}[A-Za-z]\b/g;
const IFSC_REGEX = /\b[A-Za-z]{4}0[A-Za-z0-9]{6}\b/g;
const OTP_CONTEXT_REGEX =
  /\b(?:otp|one[\s-]?time[\s-]?password|verification[\s-]?code|security[\s-]?code)\b[^.\n]{0,20}(?:\b\d{4,8}\b)|(?:\b\d{4,8}\b)[^.\n]{0,20}\b(?:is\s+(?:my|the)\s+otp|otp)\b/i;
const BANK_CONTEXT_REGEX =
  /\b(?:bank\s*account|account\s*(?:no|number|num|#)|a\/c\s*(?:no|number)?|acc\s*(?:no|number)|acct)\b[^.\n]{0,25}\b\d{9,18}\b/i;
const CARD_OR_LONG_ACCOUNT_REGEX =
  /(?<!\d)(?:\d{4}[\s-]){3}\d{4}(?!\d)|(?<!\d)\d{13,18}(?!\d)/g;

export interface PiiResult {
  blocked: boolean;
  reasons: string[];
  message: string;
}

export function detectPII(input: string): PiiResult {
  if (typeof input !== 'string' || !input.trim()) {
    return { blocked: false, reasons: [], message: '' };
  }

  const reasons: string[] = [];

  if (AADHAAR_REGEX.test(input)) reasons.push('aadhaar');
  if (PAN_REGEX.test(input)) reasons.push('pan');
  if (OTP_CONTEXT_REGEX.test(input)) reasons.push('otp');
  if (IFSC_REGEX.test(input) || BANK_CONTEXT_REGEX.test(input) || CARD_OR_LONG_ACCOUNT_REGEX.test(input)) {
    reasons.push('bank_account');
  }

  AADHAAR_REGEX.lastIndex = 0;
  PAN_REGEX.lastIndex = 0;
  IFSC_REGEX.lastIndex = 0;
  CARD_OR_LONG_ACCOUNT_REGEX.lastIndex = 0;

  if (reasons.length === 0) {
    return { blocked: false, reasons: [], message: '' };
  }

  return {
    blocked: true,
    reasons,
    message:
      'For your safety, do not enter Aadhaar numbers, PAN numbers, OTPs, or bank account details. Please remove sensitive numbers and ask your question again.',
  };
}
