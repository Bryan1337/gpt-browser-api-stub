import { logError } from "@/util/log";
import { baseUrl } from "@/util/runwayAi";

export const getTeamId = async (token: string) => {
	const teamsUrl = `${baseUrl}/teams`;

	const response = await fetch(teamsUrl, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const json = await response.json();

	if (Boolean(json.teams)) {
		const [team] = json.teams;

		const teamId = team.id;

		return teamId;
	}

	logError(JSON.stringify(json));

	throw new Error("Failed to get team id");
};
