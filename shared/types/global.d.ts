declare namespace API {
	namespace GenericResponse {
		interface SessionResponse {
			expires: string;
			accessToken: string;
			authProvider: string;
		}
	}

	namespace ChatGPTResponse {
		interface ChatConversationId {
			title: string;
			create_time: number;
			current_node: string;
			conversation_id: string;
		}

		interface ChatRequirements {
			persona: "chatgpt-freeaccount";
			token: string;
			expire_after: number;
			expire_at: number;
			turnstile: {
				required: boolean;
				dx: string;
			};
			proofofwork: ProofOfWork;
		}
	}

	interface RateLimitBalance {
		rate_limit_reached: boolean;
		access_resets_in_seconds: number;
		credit_remaining: number;
		estimated_num_videos_remaining: number;
		estimated_num_purchased_videos_remaining: number;
	}

	interface ProofOfWork {
		difficulty: string;
		seed: string;
		required: boolean;
	}

	interface VideoTask {
		id: string;
		kind: string;
		downloadable_url: string;
		created_at: number;
		prompt: string;
		task_id: string;
		progress_pct: string | null;
	}

	namespace SoraResponse {
		interface Usage {
			rate_limit_and_credit_balance: RateLimitBalance;
			type: string;
		}

		type Drafts = {
			items: VideoTask[];
			cursor: string;
		};

		interface Video {
			id: string;
			priority: number;
			rate_limit_and_credit_balance: RateLimitBalance;
		}

		type Pending = VideoTask[];
	}
}

namespace Bot {}
