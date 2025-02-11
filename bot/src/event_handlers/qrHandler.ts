import qrcode from "qrcode-terminal";

export const qrHandler = (qr: string) => {
	qrcode.generate(qr, { small: true });
};
