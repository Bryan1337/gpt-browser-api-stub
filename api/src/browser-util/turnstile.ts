export type TurnstileUtil = typeof turnstileUtil;

declare global {
	interface Window {
		turnstile: Turnstile;
	}
}

interface Turnstile {
	execute: () => void;
	reset: () => void;
	remove: () => void;
	render: (...args: unknown[]) => void;
}

const turnstileUtil = () => {
	enum TurnstileStatus {
		Idle = "idle",
		Loading = "loading",
		ScriptLoaded = "script_loaded",
		Ready = "ready",
		Error = "error",
	}

	interface TurnstileData {
		persona: "chatgpt-freeaccount";
		turnstile: {
			required: boolean;
			dx: string;
		};
	}

	const registryHelper = () => {
		let globalRegistry = new Map();

		function processInput(encodedInput: string): Promise<string> {
			return new Promise((resolve, reject) => {
				let processedCount = 0;

				setTimeout(() => resolve("" + processedCount), 100);

				globalRegistry.set(3, (data: unknown) => {
					resolve(btoa("" + data));
				});

				globalRegistry.set(4, (error: unknown) => {
					reject(btoa("" + error));
				});

				try {
					globalRegistry.set(
						9,
						JSON.parse(parseData(atob(encodedInput), "" + globalRegistry.get(16))),
					);

					while (globalRegistry.get(9).length > 0) {
						let [callbackKey, ...args] = globalRegistry.get(9).shift() as [
							number,
							...unknown[],
						];
						globalRegistry.get(callbackKey)(...args);
						processedCount++;
					}

					resolve(btoa("" + processedCount));
				} catch (error) {
					resolve(btoa(processedCount + ": " + error));
				}
			});
		}

		function initializeRegistry(requirementsToken: string) {
			globalRegistry.clear();
			globalRegistry.set(0, processInput);
			globalRegistry.set(1, (firstIndex: number, secondIndex: number) =>
				globalRegistry.set(
					firstIndex,
					parseData(
						"" + globalRegistry.get(firstIndex),
						"" + globalRegistry.get(secondIndex),
					),
				),
			);
			globalRegistry.set(2, (index: number, value: string) =>
				globalRegistry.set(index, value),
			);
			globalRegistry.set(5, (firstIndex: number, secondIndex: number) => {
				const entry = globalRegistry.get(firstIndex);
				Array.isArray(entry)
					? entry.push(globalRegistry.get(secondIndex))
					: globalRegistry.set(firstIndex, entry + globalRegistry.get(secondIndex));
			});
			globalRegistry.set(6, (firstIndex: number, secondIndex: number, lastIndex: number) =>
				globalRegistry.set(
					firstIndex,
					globalRegistry.get(secondIndex)[globalRegistry.get(lastIndex)],
				),
			);
			globalRegistry.set(7, function (index: number) {
				for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
					n[i - 1] = arguments[i];
				return globalRegistry.get(index)(...n.map((_index) => globalRegistry.get(_index)));
			});
			globalRegistry.set(17, function (firstIndex: number, secondIndex: number) {
				for (var n = arguments.length, i = Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
					i[o - 2] = arguments[o];
				return globalRegistry.set(
					firstIndex,
					globalRegistry.get(secondIndex)(
						...i.map((_index) => globalRegistry.get(_index)),
					),
				);
			});
			globalRegistry.set(13, function (firstIndex: number, secondIndex: number) {
				try {
					for (var n = arguments.length, i = Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
						i[o - 2] = arguments[o];
					globalRegistry.get(secondIndex)(...i);
				} catch (error) {
					globalRegistry.set(firstIndex, "" + error);
				}
			});
			globalRegistry.set(8, (firstIndex: number, secondIndex: number) =>
				globalRegistry.set(firstIndex, globalRegistry.get(secondIndex)),
			);
			globalRegistry.set(10, window);
			globalRegistry.set(11, (firstIndex: number, secondIndex: number) =>
				globalRegistry.set(
					firstIndex,
					(Array.from(document.scripts || [])
						.map((e) => e?.src?.match(globalRegistry.get(secondIndex)))
						.filter((e) => e?.length)[0] ?? [])[0] ?? null,
				),
			);
			globalRegistry.set(12, (index: number) => globalRegistry.set(index, globalRegistry));
			globalRegistry.set(14, (firstIndex: number, secondIndex: number) =>
				globalRegistry.set(firstIndex, JSON.parse("" + globalRegistry.get(secondIndex))),
			);
			globalRegistry.set(15, (firstIndex: number, secondIndex: number) =>
				globalRegistry.set(firstIndex, JSON.stringify(globalRegistry.get(secondIndex))),
			);
			globalRegistry.set(18, (index: number) =>
				globalRegistry.set(index, atob("" + globalRegistry.get(index))),
			);
			globalRegistry.set(19, (index: number) =>
				globalRegistry.set(index, btoa("" + globalRegistry.get(index))),
			);
			globalRegistry.set(
				20,
				function (firstIndex: number, secondIndex: number, lastIndex: number) {
					for (var i = arguments.length, o = Array(i > 3 ? i - 3 : 0), a = 3; a < i; a++)
						o[a - 3] = arguments[a];
					globalRegistry.get(firstIndex) === globalRegistry.get(secondIndex) &&
						globalRegistry.get(lastIndex)(...o);
				},
			);
			globalRegistry.set(
				21,
				function (
					firstIndex: number,
					secondIndex: number,
					thirdIndex: number,
					fourthIndex: number,
				) {
					for (var o = arguments.length, a = Array(o > 4 ? o - 4 : 0), s = 4; s < o; s++)
						a[s - 4] = arguments[s];
					return Math.abs(
						globalRegistry.get(firstIndex) - globalRegistry.get(secondIndex),
					) > globalRegistry.get(thirdIndex)
						? globalRegistry.get(fourthIndex)(...a)
						: null;
				},
			);
			globalRegistry.set(23, function (firstIndex: number, secondIndex: number) {
				for (var n = arguments.length, i = Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
					i[o - 2] = arguments[o];
				return void 0 !== globalRegistry.get(firstIndex)
					? globalRegistry.get(secondIndex)(...i)
					: null;
			});
			globalRegistry.set(24, (firstIndex: number, secondIndex: number, thirdIndex: number) =>
				globalRegistry.set(
					firstIndex,
					globalRegistry
						.get(secondIndex)
						[globalRegistry.get(thirdIndex)].bind(globalRegistry.get(secondIndex)),
				),
			);
			globalRegistry.set(22, () => {});
			globalRegistry.set(25, () => {});
			globalRegistry.set(16, requirementsToken);
		}

		function parseData(e: string, t: string) {
			let n = "";
			for (let r = 0; r < e.length; r++)
				n += String.fromCharCode(e.charCodeAt(r) ^ t.charCodeAt(r % t.length));
			return n;
		}

		return {
			parseData,
			initializeRegistry,
			processInput,
		};
	};

	class Serializable {
		toString(): string {
			return JSON.stringify(this.toJSON());
		}
		toJSON(): object {
			throw new Error("toJSON method must be implemented in subclass");
		}
	}

	class TurnstileInternalError extends Serializable {
		private message: string;

		constructor(message: string) {
			super();
			this.message = message;
		}

		override toJSON(): object {
			return {
				"Turnstile-Internal-Error": this.message,
			};
		}
	}

	class TurnstileClientError extends Serializable {
		private errorCode: string;

		constructor(errorCode: string) {
			super();
			this.errorCode = errorCode;
		}

		override toJSON(): object {
			return {
				"Turnstile-Client-Error": this.errorCode,
			};
		}
	}

	const registry = registryHelper();

	class TurnstileUtil {
		private app = "0x4AAAAAAASbHVR44GU82lOI";
		private status = TurnstileStatus.Idle;
		private turnstileInstancePromise: Promise<Turnstile | Serializable> | null = null;
		private enforcementTokenPromise: Promise<unknown> | null = null;
		private onCompleted: ((result: Serializable | null) => void) | null = null;
		private onError: ((result: Serializable | null) => void) | null = null;

		private setStatus(newStatus: TurnstileStatus) {
			this.status = newStatus;
		}

		private setOnCompleted = (callback: (result: Serializable | null) => void) => {
			this.onCompleted = callback;
		};

		private setOnError = (callback: (args: unknown) => Promise<void>) => {
			this.onError = callback;
		};

		private onExpired = () => {
			this.enforcementTokenPromise = null;
		};

		private async _getOrCreateInstance(data: TurnstileData) {
			if (!data.turnstile?.required || data.turnstile.dx) {
				return null;
			}

			if (this.app !== data.persona) {
				this.app = data.persona;
				this.turnstileInstancePromise = this._getTurnstileInstancePromise();
				return this.turnstileInstancePromise;
			}
			return new TurnstileInternalError("Turnstile instance not initialized.");
		}
		async getEnforcementToken(data: TurnstileData, requirementsToken: string) {
			registry.initializeRegistry(requirementsToken);
			if (data.turnstile.dx) {
				return registry.processInput(data.turnstile.dx);
			}

			const enforcementToken = await this.startEnforcement(data);
			return `${enforcementToken}`;
		}

		async startEnforcement(data: TurnstileData) {
			if (data.turnstile.required) {
				if (this.enforcementTokenPromise !== null) {
					return this.enforcementTokenPromise;
				} else {
					this.enforcementTokenPromise = this._getEnforcementToken(data);
					return this.enforcementTokenPromise;
				}
			}
			return null;
		}

		async _getEnforcementToken(data: TurnstileData, retryOnError?: boolean) {
			const instance = await this._getOrCreateInstance(data);

			if (instance instanceof Serializable || instance === null) {
				return instance;
			}

			return new Promise((resolve, reject) => {
				this.setOnCompleted((result: Serializable | null) => {
					resolve(result);
				});

				this.setOnError(async (error: any) => {
					if (retryOnError) {
						resolve(new TurnstileClientError(error));
					} else {
						try {
							let retryResult = await this._getEnforcementToken(data, true);
							resolve(retryResult);
						} catch (retryError) {
							reject(retryError);
						}
					}
				});

				this.setStatus(TurnstileStatus.Ready);

				instance.reset();
				instance.execute();
			});
		}

		_getTurnstileInstancePromise = async (newInstance?: boolean) => {
			if (null !== this.turnstileInstancePromise) {
				if (!newInstance) {
					return this.turnstileInstancePromise;
				}

				const instance = await this.turnstileInstancePromise;
				if (!(instance instanceof Serializable)) {
					instance.remove();
					this.turnstileInstancePromise = null;
				}
			}

			this.turnstileInstancePromise = new Promise((resolve, reject) => {
				const turnstileCallback = "onloadTurnstileCallback";
				const turnstileContainerId = "cf-turnstile";
				const turnstileScriptContainerId = "cf-turnstile-script";

				Object.defineProperty(window, turnstileCallback, {
					value: () => {
						if (this.status === TurnstileStatus.Ready) return;
						this.setStatus(TurnstileStatus.ScriptLoaded);
						const { turnstile: turnstileCallback } = window;
						if (null === turnstileCallback) {
							this.setStatus(TurnstileStatus.Error);
							if (newInstance) {
								console.log("turnstile_instance_missing", {
									app_release: "1345fbf754073222e84579c5a9f2b6396c475b12",
									app: this.app.toString(),
								});
								resolve(new TurnstileInternalError("Turnstile instance missing"));
								return;
							}

							this._getTurnstileInstancePromise(true).then(resolve, reject);
						}

						turnstileCallback.render(`#${turnstileContainerId}`, {
							"sitekey": "0x4AAAAAAASbHVR44GU82lOI",
							"execution": "execute",
							"callback": this.onCompleted,
							"error-callback": this.onError,
							"expired-callback": this.onExpired,
						});
						resolve(turnstileCallback);
					},
				});

				document.getElementById(turnstileContainerId)?.remove();
				document.getElementById(turnstileScriptContainerId)?.remove();

				const turnstileContainer = document.createElement("div");
				turnstileContainer.id = turnstileContainerId;
				turnstileContainer.hidden = true;
				document.body.appendChild(turnstileContainer);

				this.setStatus(TurnstileStatus.Loading);

				const turnstileScriptTag = document.createElement("script");
				turnstileScriptTag.id = turnstileScriptContainerId;
				turnstileScriptTag.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${turnstileCallback}`;
				turnstileScriptTag.async = true;
				turnstileScriptTag.defer = true;
				turnstileScriptTag.onerror = () => {
					this.setStatus(TurnstileStatus.Error);
					if (!newInstance) {
						resolve(new TurnstileInternalError("Turnstile script failed to load"));
					} else {
						this._getTurnstileInstancePromise(true).then(resolve, reject);
					}
				};
				document.body.appendChild(turnstileScriptTag);
			});

			return this.turnstileInstancePromise;
		};
	}

	return new TurnstileUtil();
};

export default turnstileUtil;
