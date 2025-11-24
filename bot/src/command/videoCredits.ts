import { CommandHandleData } from "@/command";
import { reactPending, reactSuccess, reply } from "@/util/message";
import { getLocalVideoCreditsResponse } from "@/util/request";
import { formatSeconds } from "@/util/time";

export const videoCreditsCommand = async (data: CommandHandleData) => {
	const { message } = data;

	reactPending(message);

	const videoCreditsResponse = await getLocalVideoCreditsResponse();

	const balance = videoCreditsResponse.rate_limit_and_credit_balance;

	const { estimated_num_videos_remaining, rate_limit_reached, access_resets_in_seconds } =
		balance;

	if (rate_limit_reached) {
		const formattedResetTime = formatSeconds(access_resets_in_seconds);

		reactSuccess(message);
		reply(
			message,
			`No video credits remaining. Please wait ${formattedResetTime} before trying again.`,
		);
	} else {
		reactSuccess(message);
		reply(message, `~*${estimated_num_videos_remaining}* video generations remaining.`);
	}
};
