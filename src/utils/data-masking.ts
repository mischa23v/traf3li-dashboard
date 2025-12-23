/**
 * Data Masking Utilities
 *
 * Functions to mask sensitive personal data for PDPL compliance
 * Use these functions when displaying sensitive information in lists or views
 */

/**
 * Masks a phone number, showing only the last 4 digits
 * @param phone - The phone number to mask
 * @returns Masked phone number (e.g., "****1234")
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }

  const lastFour = digits.slice(-4);
  const maskedPart = '*'.repeat(digits.length - 4);

  return maskedPart + lastFour;
}

/**
 * Masks an email address, showing only the first character and domain
 * @param email - The email address to mask
 * @returns Masked email (e.g., "j****@example.com")
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';

  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email; // Invalid email

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (localPart.length <= 1) {
    return '*' + domain;
  }

  const firstChar = localPart[0];
  const maskedPart = '*'.repeat(localPart.length - 1);

  return firstChar + maskedPart + domain;
}

/**
 * Masks an IBAN, showing only the country code and last 4 characters
 * @param iban - The IBAN to mask
 * @returns Masked IBAN (e.g., "SA**************1234")
 */
export function maskIBAN(iban: string | null | undefined): string {
  if (!iban) return '';

  // Remove spaces
  const cleanIban = iban.replace(/\s/g, '');

  if (cleanIban.length <= 6) {
    return '*'.repeat(cleanIban.length);
  }

  // Show first 2 characters (country code) and last 4 digits
  const countryCode = cleanIban.substring(0, 2);
  const lastFour = cleanIban.slice(-4);
  const maskedPart = '*'.repeat(cleanIban.length - 6);

  return countryCode + maskedPart + lastFour;
}

/**
 * Masks a national ID, showing only the last 4 digits
 * @param nationalId - The national ID to mask
 * @returns Masked national ID (e.g., "**********1234")
 */
export function maskNationalId(nationalId: string | null | undefined): string {
  if (!nationalId) return '';

  const digits = nationalId.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }

  const lastFour = digits.slice(-4);
  const maskedPart = '*'.repeat(digits.length - 4);

  return maskedPart + lastFour;
}

/**
 * Masks a credit card number, showing only the last 4 digits
 * @param cardNumber - The card number to mask
 * @returns Masked card number (e.g., "************1234")
 */
export function maskCardNumber(cardNumber: string | null | undefined): string {
  if (!cardNumber) return '';

  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }

  const lastFour = digits.slice(-4);
  const maskedPart = '*'.repeat(digits.length - 4);

  return maskedPart + lastFour;
}

/**
 * Masks a bank account number, showing only the last 4 digits
 * @param accountNumber - The account number to mask
 * @returns Masked account number (e.g., "************1234")
 */
export function maskAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '';

  const digits = accountNumber.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }

  const lastFour = digits.slice(-4);
  const maskedPart = '*'.repeat(digits.length - 4);

  return maskedPart + lastFour;
}

/**
 * Alias for maskNationalId to match naming convention
 * @param nationalID - The national ID to mask
 * @returns Masked national ID (e.g., "**********1234")
 */
export const maskNationalID = maskNationalId;
