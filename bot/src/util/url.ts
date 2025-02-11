import { logWarning } from "@/util/log";
import { pause } from "@/util/time";

export const waitForUrlAvailability = async (url: string) => {
	while (true) {
		const response = await fetch(url);

		if (response.status === 403) {
			logWarning(
				`Received 403 response from url (${url}). Re-fetching after timeout...`
			);
			await pause(3000);

			continue;
		}

		if (response.status === 200) {
			return;
		}
	}
};
