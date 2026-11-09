// Проверка шифрования Web Push: шифруем encryptPayload и расшифровываем как браузер (RFC 8291) + проверяем подпись VAPID.
import { encryptPayload, vapidJwt, b64u } from '../src/webpush.js';
const { subtle } = globalThis.crypto;
const enc = new TextEncoder();
const hkdf = async (salt, ikm, info, n) => new Uint8Array(await subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, await subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), n * 8));
const cat = (...p) => { const o = new Uint8Array(p.reduce((a, b) => a + b.length, 0)); let i = 0; for (const x of p) { o.set(x, i); i += x.length; } return o; };

// «браузер»: ключи подписки
const ua = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPub = new Uint8Array(await subtle.exportKey('raw', ua.publicKey));
const auth = crypto.getRandomValues(new Uint8Array(16));
const msg = JSON.stringify({ title: 'Отдых окончен', body: 'тест' });
const body = await encryptPayload(msg, b64u.encode(uaPub), b64u.encode(auth));

const salt = body.slice(0, 16), idlen = body[20], asPub = body.slice(21, 21 + idlen), cipher = body.slice(21 + idlen);
const asKey = await subtle.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
const ecdh = new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: asKey }, ua.privateKey, 256));
const ikm = await hkdf(auth, ecdh, cat(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
const plain = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: nonce }, await subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), cipher));
const text = new TextDecoder().decode(plain.slice(0, plain.lastIndexOf(2)));
console.log(text === msg ? 'ok   шифрование' : 'FAIL шифрование: ' + text);

// VAPID: подписываем и проверяем публичным ключом
const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwt = await vapidJwt('https://web.push.apple.com/abc', 'mailto:x@y.z', await subtle.exportKey('jwk', kp.privateKey));
const [h, p, s] = jwt.split('.');
const good = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, kp.publicKey, b64u.decode(s), enc.encode(`${h}.${p}`));
const claims = JSON.parse(new TextDecoder().decode(b64u.decode(p)));
console.log(good && claims.aud === 'https://web.push.apple.com' ? 'ok   VAPID' : 'FAIL VAPID');
