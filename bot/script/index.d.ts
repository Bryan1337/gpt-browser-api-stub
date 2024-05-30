

declare module 'node-gtts' {
	export default function Text2Speech(lang: string, debug?: boolean) : {
		save: (filepath: string, text: string, callback: () => void) => void;
	};
}