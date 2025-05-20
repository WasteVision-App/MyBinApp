
// Browser-compatible password hashing using SHA-256 (hex-encoded) to match Supabase's `hash_password` function

/**
 * Returns a SHA-256 hash of the password as a hex string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  // Convert buffer to a hex string
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}
