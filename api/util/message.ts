import { v4 as uuidv4 } from "uuid";

export const getMessageId = () => {
	return uuidv4()
		.split("")
		.map((c: string, i: number) => (i <= 2 ? "a" : c))
		.join("");
};
