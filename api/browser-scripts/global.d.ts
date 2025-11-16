interface ProofOfWork {
	difficulty: string;
	seed: string;
	required: boolean;
}

interface Author {
	role: string;
	name: string | null;
	metadata: Record<string, any>;
}

interface Content {
	content_type: string;
	parts: string[];
}

interface Message {
	id: string;
	author: Author;
	create_time: number | null;
	update_time: number | null;
	content: Content;
	status: string;
	end_turn: boolean | null;
	weight: number;
	metadata: Record<string, any>;
	recipient: string | null;
	channel: string | null;
}

interface Node {
	id: string;
	message: Message | null;
	parent: string | null;
	children: string[];
}

interface ChatConversationIdResponse {
	title: string;
	create_time: number;
	update_time: number;
	mapping: Record<string, Node>;
	moderation_results: any[];
	current_node: string;
	plugin_ids: string[] | null;
	conversation_id: string;
	conversation_template_id: string | null;
	gizmo_id: string | null;
	gizmo_type: string | null;
	is_archived: boolean;
	is_starred: boolean | null;
	safe_urls: string[];
	blocked_urls: string[];
	default_model_slug: string;
	conversation_origin: string | null;
	is_read_only: boolean | null;
	voice: string | null;
	async_status: string | null;
	disabled_tool_ids: string[];
	is_do_not_remember: boolean;
	memory_scope: string;
	context_scopes: any;
	sugar_item_id: string | null;
	sugar_item_visible: boolean;
	is_study_mode: boolean;
	owner: string | null;
}

interface ProofOfWork {
	required: boolean;
	seed: string;
	difficulty: string;
}

interface ChatRequirementsResponse {
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

interface UserInfo {
	id: string;
	name: string;
	email: string;
	image: string;
	picture: string;
	idp: string;
	iat: number;
	mfa: boolean;
	lastAuthorizationCheck: number;
}

interface AccountInfo {
	id: string;
	planType: string;
	structure: string;
	workspaceType: string | null;
	organizationId: string | null;
	isDelinquent: boolean;
	gracePeriodId: string | null;
}

interface LightAccountTag {
	fetched: boolean;
}

interface RumViewTags {
	light_account: LightAccountTag;
}

interface SessionResponse {
	user: UserInfo;
	expires: string;
	account: AccountInfo;
	accessToken: string;
	authProvider: string;
	rumViewTags: RumViewTags;
}

interface ChatCompletionData {
	requirementsResponseToken: string;
	turnstileToken: string;
	enforcementToken: string;
	conversationId?: string;
	newMessageId: string;
	prompt: string;
	parentMessageId: string;
}

type Encoding = {
	path: string;
} | null;

interface Encodings {
	source: Encoding;
	source_wm: Encoding;
	thumbnail: Encoding;
	unfurl: Encoding;
	md: Encoding;
	gif: Encoding;
}

interface CreationConfig {
	remix_target_post: string | null;
	style_id: string | null;
	inpaint_image: string | null;
	prompt: string;
	task_id: string | null;
	cameo_profiles: string[] | null;
	orientation: "portrait" | "landscape" | string;
	n_frames: number;
	storyboard_id: string | null;
}

interface Item {
	id: string;
	kind: string;
	url: string;
	downloadable_url: string;
	width: number;
	height: number;
	generation_type: string;
	created_at: number;
	prompt: string;
	title: string | null;
	encodings: Encodings;
	draft_reviewed: boolean;
	task_id: string;
	creation_config: CreationConfig;
	can_remix: boolean;
	storyboard_id: string | null;
	can_create_character: boolean;
	post_visibility: string | null;
	post: string | null;
	tags: string[];
	generation_id: string;
}

interface VideoDraftsResponse {
	items: Item[];
	cursor: string;
}

interface RateLimitBalance {
	rate_limit_reached: boolean;
	access_resets_in_seconds: number;
	credit_remaining: number;
	estimated_num_videos_remaining: number;
	estimated_num_purchased_videos_remaining: number;
}

interface VideoUsageResponse {
	rate_limit_and_credit_balance: RateLimitBalance;
	type: string;
}

interface VideoResponse {
	id: string;
	priority: number;
	rate_limit_and_credit_balance: RateLimitBalance;
}

interface ModerationResult {
	type: string;
	results_by_frame_index: Record<number, unknown>;
	code: string | null;
	is_output_rejection: boolean;
	task_id: string;
}

interface Task {
	id: string;
	user: string;
	created_at: string;
	status: string;
	progress_pct: number;
	progress_pos_in_queue: number | null;
	estimated_queue_wait_time: number | null;
	queue_status_message: string | null;
	priority: number;
	type: string;
	prompt: string;
	storyboard_id: string | null;
	actions: unknown | null;
	n_variants: number;
	n_frames: number;
	height: number;
	width: number;
	seed: number | null;
	guidance: string | null;
	inpaint_items: unknown[];
	interpolation: string | null;
	sdedit: string | null;
	model: string;
	operation: string;
	is_storyboard: boolean | null;
	preset_id: string | null;
	remix_config: unknown | null;
	story_id: string | null;
	organization_id: string | null;
	project_id: string | null;
	request_id: string | null;
	tracking_id: string | null;
	generations: unknown[];
	num_unsafe_generations: number;
	title: string;
	moderation_result: ModerationResult;
	failure_reason: string | null;
	needs_user_review: boolean;
}

type VideoPendingResponse = Task[];
