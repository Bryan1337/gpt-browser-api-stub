import { getContext } from "@/data_handlers/context/getContext";
import { ConversationDetails, getLocalResponse } from "@/util/request";
import { logInfo } from "@/util/log";

const UNUSUAL_ACTIVITY_ERROR =
	"Our systems have detected unusual activity coming from your system. Please try again later.";

export const getChatGPTResponse = async (
	prompt: string,
	conversationDetails: ConversationDetails
) => {
	const { whatsappIdentifier } = conversationDetails;

	const context = getContext(whatsappIdentifier);

	if (context) {
		logInfo("Using context:", context);

		prompt = `${context}\n ${prompt}`;
	}

	logInfo("Querying prompt:", prompt);

	const response = await getLocalResponse(prompt, conversationDetails);

	if (response.answer.includes(UNUSUAL_ACTIVITY_ERROR)) {
		throw Error(response.answer);
	}

	return response;
};
