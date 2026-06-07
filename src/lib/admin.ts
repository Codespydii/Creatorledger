// Single source of truth for who can reach admin-only surfaces (e.g. /spiral).
//
// The owner email is always allowed. ADMIN_EMAILS (comma-separated) can add more
// admins without a code change. Note: ADMIN_EMAILS is server-only — on the client
// only OWNER_EMAIL is in effect, which is all the menu visibility check needs.

const OWNER_EMAIL = 'mahipalsinghrajput476@gmail.com'

const ENV_ADMINS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const ADMIN_EMAILS: readonly string[] = Array.from(
  new Set([OWNER_EMAIL, ...ENV_ADMINS]),
)

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
