import { v4 as uuidv4 } from "uuid";

const HAILUO_AI_BASE_URL = "https://hailuoai.com/api";
const HAILUO_AI_V1_BASE_URL = "https://hailuoai.com/v1/api";

const uuid = uuidv4();

// uuid: '8e96311b-7685-4826-a966-5ba9c1f6cf5d',

const getBaseParamMap = () => {
	const baseParams = new URLSearchParams();

	baseParams.append("device_platform", "web");
	baseParams.append("app_id", "3001");
	baseParams.append("version_code", "22201");
	baseParams.append("uuid", uuid);
	baseParams.append("device_id", "294209157195988993");
	baseParams.append("os_name", "Windows");
	baseParams.append("browser_name", "chrome");
	baseParams.append("device_memory", "8");
	baseParams.append("cpu_core_num", "8");
	baseParams.append("browser_language", "en-US");
	baseParams.append("browser_platform", "Win32");
	baseParams.append("screen_width", "1920");
	baseParams.append("screen_height", "1080");
	baseParams.append("unix", `${new Date().getTime()}`);

	return baseParams;
};

export const pollVideoId = async (id: string, renewalToken: string) => {
	const getParams = getBaseParamMap();

	getParams.append("idList", id);

	const url = `${HAILUO_AI_BASE_URL}/multimodal/video/processing?${getParams}`;

	const pollVideoIdResponse = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Baggage: getSentryHeaders(),
			Cookie: getCookies(),
			Token: renewalToken,
		},
	});

	return await pollVideoIdResponse.json();
};

const getSentryHeaders = () => {
	return [
		"sentry-environment=production",
		"sentry-release=riQQnkDlg6ORHcaU8bxcx",
		"sentry-public_key=6cf106db5c7b7262eae7cc6b411c776a",
		"sentry-trace_id=f9eba755af7f4fbc98902b6391755e7b",
		"sentry-sample_rate=1",
		"sentry-sampled=true",
	].join(",");
};

const getCookies = () => {
	const deviceID =
		"192194920e8aa1-0a94af05686fcf8-26001151-2073600-192194920e9e2e";

	const sensorsDataCookie = {
		distinct_id: deviceID,
		first_id: "",
		props: {
			$latest_traffic_source_type: "直接流量",
			$latest_search_keyword: "未取到值_直接打开",
			$latest_referrer: "",
		},
		identities:
			"eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTkyMTk0OTIwZThhYTEtMGE5NGFmMDU2ODZmY2Y4LTI2MDAxMTUxLTIwNzM2MDAtMTkyMTk0OTIwZTllMmUifQ==",
		history_login_id: { name: "", value: "" },
		$device_id: deviceID,
	};

	const sensorsDataChannelCookie = { prop: { _sa_channel_landing_url: "" } };

	return [
		`sensorsdata2015jssdkchannel=${encodeURIComponent(
			JSON.stringify(sensorsDataChannelCookie)
		)}`,
		"sajssdk_2015_cross_new_user=1",
		`sensorsdata2015jssdkcross=${encodeURIComponent(
			JSON.stringify(sensorsDataCookie)
		)}`,
	].join(";");
};

export const getRenewalToken = async (baseToken: string) => {
	const getParams = getBaseParamMap();

	const url = `${HAILUO_AI_V1_BASE_URL}/user/renewal?${getParams}`;

	const getRenewalTokenResponse = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Baggage: getSentryHeaders(),
			Cookie: getCookies(),
			Token: baseToken,
		},
	});

	return await getRenewalTokenResponse.json();
};

export const generateVideo = async (prompt: string, renewalToken: string) => {
	const getParams = getBaseParamMap();

	const url = `${HAILUO_AI_BASE_URL}/multimodal/generate/video?${getParams}`;

	const generateVideoResponse = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Baggage: getSentryHeaders(),
			Cookie: getCookies(),
			Token: renewalToken,
		},
		body: JSON.stringify({
			desc: prompt,
			useOriginPrompt: false,
		}),
	});

	return await generateVideoResponse.json();
};
