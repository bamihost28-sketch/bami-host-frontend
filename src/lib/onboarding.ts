// Phone number is required for everyone we onboard; email is optional (many people have none).
export const phoneOk = (p: string) => p.replace(/\D/g, '').length >= 10;
export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

type Credentials = { channels?: string[]; login?: string; tempPassword?: string } | undefined;

/** One line telling the admin how the new person was sent their login. A phone-only person's temporary
 *  password is shown so it can be passed on if the text message did not arrive. */
export function credentialsNote(c: Credentials): string {
  if (!c) return '';
  const via = (c.channels ?? []).map((x) => (x === 'sms' ? 'text message' : x)).join(' and ');
  const sent = via ? `Login details sent by ${via}.` : 'Login details could not be sent automatically.';
  return c.tempPassword ? `${sent} They sign in with their phone number. Temporary password: ${c.tempPassword}` : sent;
}
