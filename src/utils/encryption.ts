import CryptoJS from 'crypto-js';

export const encrypt = (plaintext: string, secret: string): string => {
	const ciphertext = CryptoJS.AES.encrypt(plaintext, secret).toString();
	return ciphertext;
};

export const decrypt = (ciphertext: string, secret: string): string => {
	const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
	const plaintext = bytes.toString(CryptoJS.enc.Utf8);
	return plaintext;
};
