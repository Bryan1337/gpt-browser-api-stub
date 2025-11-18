export type SentinelModule = typeof sentinelModule;

declare global {
	interface Performance {
		memory: {
			jsHeapSizeLimit: number;
			totalJSHeapSize: number;
			usedJSHeapSize: number;
		};
	}
	interface Window {
		hashwasm: {
			sha3: (input: string, bits: number) => Promise<string>;
		};
		sentinelModule: SentinelModule;
	}
}

const sentinelModule = () => {
	const answers: Map<string, Promise<string>> = new Map();
	const maxAttempts: number = 5e5;
	const requirementsSeed: string = `${Math.random()}`;

	const getRandomElement = <T>(inputArray: Array<T>): T => {
		return inputArray[Math.floor(Math.random() * inputArray.length)];
	};

	const encodeString = (
		input: Record<string, string | number> | Array<string | number>
	): string => {
		return btoa(unescape(encodeURIComponent(JSON.stringify(input))));
	};

	const getAnswer = async (proofofwork: ProofOfWork) => {
		if (!proofofwork.required) {
			return "";
		}
		const { seed, difficulty } = proofofwork;
		if (typeof seed !== "string" || typeof difficulty !== "string") {
			return "";
		}
		if (!answers.has(seed)) {
			answers.set(seed, generateAnswer(seed, difficulty));
		}
		const answer = await answers.get(seed);
		return `gAAAAAB${answer}`;
	};
	const generateAnswer = async (seed: string, difficulty: string) => {
		const timing = performance.now();
		const config = getConfig();
		const difficultyLength = difficulty.length;
		const configAttemptIndex = 3;
		const configTimingIndex = 9;
		const sha3Bits = 512;
		for (let attemptIndex = 0; attemptIndex < maxAttempts; attemptIndex++) {
			config[configAttemptIndex] = attemptIndex;
			config[configTimingIndex] = Math.round(performance.now() - timing);
			const encoded = encodeString(config);
			const str = seed + encoded;
			const hashedStr = await window["hashwasm"].sha3(str, sha3Bits);
			if (hashedStr.substring(0, difficultyLength) <= difficulty) {
				return encoded;
			}
		}
		throw new Error(`Didn't find answer in ${maxAttempts} attempts...`);
	};

	const getConfig = (): Array<string | number> => [
		screen.height + screen.width + 1,
		`${new Date()}`,
		performance.memory.jsHeapSizeLimit / 8,
		Math.random(),
		navigator.userAgent,
		getRandomElement(
			Array.from(document.scripts)
				.filter((e) => Boolean(e.src))
				.map((e) => e.src)
		),
		(() => {
			const dplScriptMatches = Array.from(document.scripts)
				.map((scriptTag) => `${scriptTag.src}`.match("dpl.*"))
				.filter(Boolean);
			const [dplScriptMatch] = dplScriptMatches.length
				? dplScriptMatches
				: [[""]];
			const [dplTag] = dplScriptMatch || [""];
			return dplTag;
		})(),
		navigator.language,
		navigator.languages.join(","),
		Math.random(),
		(() => {
			const proto = Object.getPrototypeOf(navigator);
			const keys = Object.keys(proto);
			const e = getRandomElement(keys);
			const value = (navigator as unknown as Record<string, unknown>)[e];
			return `${e}-${String(value)}`;
		})(),
		getRandomElement(Object.keys(document)),
		getRandomElement(Object.keys(window)),
	];

	const getEnforcementToken = async (proofofwork: ProofOfWork) => {
		const { difficulty } = proofofwork;
		console.time(`Enforcement token (difficulty: ${difficulty})`);
		const enforcementToken = await getAnswer(proofofwork);
		console.timeEnd(`Enforcement token (difficulty: ${difficulty})`);
		return enforcementToken;
	};

	const getRequirementsToken = async () => {
		console.time("Requirements token");
		if (!answers.has(requirementsSeed)) {
			const generatedAnswer = generateAnswer(requirementsSeed, "0");
			answers.set(requirementsSeed, generatedAnswer);
		}
		const answer = await answers.get(requirementsSeed);
		console.timeEnd("Requirements token");
		return `gAAAAAC${answer}`;
	};

	return {
		getRequirementsToken,
		getEnforcementToken,
	};
};

export default sentinelModule;
