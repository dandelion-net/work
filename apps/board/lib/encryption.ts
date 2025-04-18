import { box, randomBytes } from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

export interface EncryptedPayload {
  encrypted: string;
  nonce: string;
}

export function generateKeyPair() {
  const keyPair = box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
}

export function encryptPayload(
  payload: any,
  recipientPublicKey: string,
  senderSecretKey: string
): EncryptedPayload {
  const nonce = randomBytes(box.nonceLength);
  const messageUint8 = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = box(
    messageUint8,
    nonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(senderSecretKey)
  );

  return {
    encrypted: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptPayload(
  encryptedPayload: EncryptedPayload,
  senderPublicKey: string,
  recipientSecretKey: string
): any {
  const decrypted = box.open(
    decodeBase64(encryptedPayload.encrypted),
    decodeBase64(encryptedPayload.nonce),
    decodeBase64(senderPublicKey),
    decodeBase64(recipientSecretKey)
  );

  if (!decrypted) {
    throw new Error('Failed to decrypt payload');
  }

  return JSON.parse(new TextDecoder().decode(decrypted));
}