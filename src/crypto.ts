
// https://bradyjoslin.com/blog/hmac-sig-webcrypto/
export async function verifyHmacSha256(message: string, secret: string, signature: string) {

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    )

    const sigBuf = Uint8Array.from(atob(signature), c => c.charCodeAt(0))

    return await crypto.subtle.verify(
        'HMAC',
        key,
        sigBuf,
        new TextEncoder().encode(message),
    )

}