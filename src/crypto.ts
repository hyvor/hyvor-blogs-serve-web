
/**
 * from https://bradyjoslin.com/blog/hmac-sig-webcrypto/
 * except the hexToBuffer it used
 * Uint8Array.from(atob(signature), c => c.charCodeAt(0)) didn't work
 */
export async function verifyHmacSha256(message: string, secret: string, signature: string) {

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    )

    const sigBuf = hexToBuffer(signature)

    return await crypto.subtle.verify(
        'HMAC',
        key,
        sigBuf,
        new TextEncoder().encode(message),
    )

}

function hexToBuffer(hexString: string) {
    return new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
}
