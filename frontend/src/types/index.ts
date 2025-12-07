// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    username: string;
    school: string;
    grade: string;
    major?: string;
    phone_number?: string;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

// User Types
export interface UserProfile {
    id: number;
    email: string;
    full_name: string;
    username: string;
    school: string;
    grade: string;
    major: string;
    bio: string;
    avatar: string;
    phone_number: string;
    location: string;
    credit_balance: number;
    is_active: boolean;
    is_verified: boolean;
    total_earned: number;
    total_spent: number;
    total_sessions_as_teacher: number;
    total_sessions_as_student: number;
    average_rating_as_teacher: number;
    average_rating_as_student: number;
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    credit_balance: number;
    total_credits_earned: number;
    total_credits_spent: number;
    total_sessions_as_teacher: number;
    total_sessions_as_student: number;
    average_rating_as_teacher: number;
    average_rating_as_student: number;
    total_teaching_hours: number;
    total_learning_hours: number;
}

// Skill Types
export type SkillCategory = 'academic' | 'technical' | 'creative' | 'language' | 'sports' | 'other';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
    id: number;
    name: string;
    category: SkillCategory;
    description: string;
    icon: string;
    total_teachers: number;
    total_learners: number;
    created_at: string;
}

export interface SkillListResponse {
    skills: Skill[];
    total: number;
    page: number;
    limit: number;
}

// User Skill Types
export interface UserSkill {
    id: number;
    user_id: number;
    skill_id: number;
    skill: Skill;
    user?: UserProfile;
    level: SkillLevel;
    description: string;
    years_of_experience: number;
    proof_url: string;
    proof_type: string;
    hourly_rate: number;
    online_only: boolean;
    offline_only: boolean;
    is_available: boolean;
    total_sessions: number;
    average_rating: number;
    total_reviews: number;
    created_at: string;
    updated_at: string;
}

export interface CreateUserSkillRequest {
    skill_id: number;
    level: SkillLevel;
    description: string;
    years_of_experience: number;
    proof_url: string;
    proof_type: string;
    hourly_rate: number;
    online_only: boolean;
    offline_only: boolean;
    is_available: boolean;
}

export interface UpdateUserSkillRequest {
    level?: SkillLevel;
    description?: string;
    years_of_experience?: number;
    proof_url?: string;
    proof_type?: string;
    hourly_rate?: number;
    online_only?: boolean;
    offline_only?: boolean;
    is_available?: boolean;
}

// Learning Skill Types
export interface LearningSkill {
    id: number;
    user_id: number;
    skill_id: number;
    skill: Skill;
    desired_level: SkillLevel;
    priority: number;
    notes: string;
    created_at: string;
}

export interface CreateLearningSkillRequest {
    skill_id: number;
    desired_level: SkillLevel;
    priority: number;
    notes: string;
}

// User Profile Extended Types
export interface UserStats {
    credit_balance: number;
    total_credits_earned: number;
    total_credits_spent: number;
    total_sessions_as_teacher: number;
    total_sessions_as_student: number;
    average_rating_as_teacher: number;
    average_rating_as_student: number;
    total_teaching_hours: number;
    total_learning_hours: number;
}

export interface UpdateProfileRequest {
    full_name?: string;
    username?: string;
    school?: string;
    grade?: string;
    major?: string;
    bio?: string;
    phone_number?: string;
    location?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

// Session Types
export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type SessionMode = 'online' | 'offline' | 'hybrid';

export interface Session {
    id: number;
    teacher_id: number;
    student_id: number;
    user_skill_id: number;
    title: string;
    description: string;
    duration: number;
    mode: SessionMode;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    status: SessionStatus;
    location: string;
    meeting_link: string;
    credit_amount: number;
    credit_held: boolean;
    credit_released: boolean;
    teacher_confirmed: boolean;
    student_confirmed: boolean;
    materials: string;
    notes: string;
    cancelled_by: number | null;
    cancellation_reason: string;
    teacher?: UserProfile;
    student?: UserProfile;
    user_skill?: UserSkill;
    review?: Review;
    created_at: string;
    updated_at: string;
}

// Review Types
export type ReviewType = 'teacher' | 'student';

export interface Review {
    id: number;
    session_id: number;
    reviewer_id: number;
    reviewee_id: number;
    type: ReviewType;
    rating: number;
    comment: string;
    tags: string;
    communication_rating: number | null;
    punctuality_rating: number | null;
    knowledge_rating: number | null;
    helpful_count: number;
    is_reported: boolean;
    is_hidden: boolean;
    session?: Session;
    reviewer?: UserProfile;
    reviewee?: UserProfile;
    created_at: string;
    updated_at: string;
}

export interface RatingSummary {
    average_rating: number;
    total_reviews: number;
    average_teacher_rating: number;
    teacher_review_count: number;
    average_student_rating: number;
    student_review_count: number;
}

// Badge Types
export type BadgeType = 'achievement' | 'milestone' | 'quality' | 'special';

export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    type: BadgeType;
    requirements: string;
    bonus_credits: number;
    rarity: number;
    total_awarded: number;
    color: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface UserBadge {
    id: number;
    user_id: number;
    badge_id: number;
    badge?: Badge;
    earned_at: string;
    progress: number;
    progress_goal: number;
    progress_percent: number;
    is_pinned: boolean;
    is_completed: boolean;
}

// Session Request Types
export interface CreateSessionRequest {
    user_skill_id: number;
    title: string;
    description: string;
    duration: number;
    mode: SessionMode;
    scheduled_at: string;
    location?: string;
    meeting_link?: string;
}

export interface ApproveSessionRequest {
    scheduled_at?: string;
    meeting_link?: string;
    location?: string;
    notes?: string;
}

export interface RejectSessionRequest {
    reason: string;
}

export interface CancelSessionRequest {
    reason: string;
}

export interface CompleteSessionRequest {
    notes?: string;
}

export interface SessionListResponse {
    sessions: Session[];
    total: number;
    page: number;
    limit: number;
}

// Transaction Types
export type TransactionType = 'earned' | 'spent' | 'bonus' | 'refund' | 'penalty' | 'initial' | 'hold';

export interface Transaction {
    id: number;
    user_id: number;
    type: TransactionType;
    amount: number;
    balance_before: number;
    balance_after: number;
    session_id: number | null;
    description: string;
    metadata: string;
    user?: UserProfile;
    session?: Session;
    created_at: string;
    updated_at: string;
}

export interface UserBadge {
    id: number;
    user_id: number;
    badge_id: number;
    badge?: Badge;
    earned_at: string;
    progress: number;
    progress_goal: number;
    progress_percent: number;
    is_pinned: boolean;
    is_completed: boolean;
}

// Notification Types
export type NotificationType = 'session' | 'credit' | 'achievement' | 'review' | 'social';

export interface Notification {
    id: number;
    user_id: number;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}
