import { describe, it, expect } from 'vitest';
import { detectPII } from '../services/piiGuard.js';

describe('PII Guard', () => {
  it('blocks 12-digit Aadhaar-like numbers with or without spaces/hyphens', () => {
    expect(detectPII('My Aadhaar is 1234 5678 9012').blocked).toBe(true);
    expect(detectPII('Check 1234-5678-9012 for PM-KISAN').reasons).toContain('aadhaar');
    expect(detectPII('123456789012').blocked).toBe(true);
  });

  it('blocks PAN-like patterns', () => {
    const res = detectPII('My PAN card is ABCDE1234F');
    expect(res.blocked).toBe(true);
    expect(res.reasons).toContain('pan');
  });

  it('blocks OTP-like phrases', () => {
    expect(detectPII('My OTP is 482910').blocked).toBe(true);
    expect(detectPII('One time password: 1234').reasons).toContain('otp');
    expect(detectPII('459012 is my otp').blocked).toBe(true);
  });

  it('blocks bank account numbers, IFSC codes, and card-like numbers', () => {
    expect(detectPII('My IFSC is SBIN0001234').reasons).toContain('bank_account');
    expect(detectPII('Bank account number 309812345678').blocked).toBe(true);
    expect(detectPII('Card 4111 2222 3333 4444').blocked).toBe(true);
  });

  it('allows normal scheme questions with monetary figures and ages', () => {
    expect(detectPII('How do I get ₹6000 per year in PM-KISAN?').blocked).toBe(false);
    expect(detectPII('Is Ayushman Bharat ₹500000 cover available for age 70?').blocked).toBe(false);
    expect(detectPII('What documents are needed for PMAY Urban for income under 250000?').blocked).toBe(false);
  });
});
