import axios from 'axios';
import type {
    ForumCategory,
    ForumThread,
    ForumReply,
    SuccessStory,
    StoryComment,
    Endorsement,
    ApiResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Community Service - Handles all community-related API calls
 * Includes forum, success stories, and endorsements
 */
export const communityService = {
    // ===== FORUM ENDPOINTS =====

    /**
     * Get all forum categories
     */
    async getCategories(): Promise<ForumCategory[]> {
        try {
            const response = await axios.get<ApiResponse<ForumCategory[]>>(
                `${API_BASE}/forum/categories`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw error;
        }
    },

    /**
     * Create a new forum thread
     */
    async createThread(categoryId: number, title: string, content: string, tags: string[] = []) {
        try {
            const response = await axios.post<ApiResponse<ForumThread>>(
                `${API_BASE}/forum/threads`,
                { category_id: categoryId, title, content, tags },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data;
        } catch (error) {
            console.error('Failed to create thread:', error);
            throw error;
        }
    },

    /**
     * Get a specific forum thread
     */
    async getThread(threadId: number): Promise<ForumThread> {
        try {
            const response = await axios.get<ApiResponse<ForumThread>>(
                `${API_BASE}/forum/threads/${threadId}`
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to fetch thread:', error);
            throw error;
        }
    },

    /**
     * Get threads by category
     */
    async getThreadsByCategory(
        categoryId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ threads: ForumThread[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ threads: ForumThread[]; total: number }>
            >(`${API_BASE}/forum/categories/${categoryId}/threads`, {
                params: { limit, offset },
            });
            return response.data.data || { threads: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch threads:', error);
            throw error;
        }
    },

    /**
     * Update a forum thread
     */
    async updateThread(threadId: number, title: string, content: string, tags: string[] = []) {
        try {
            const response = await axios.put<ApiResponse<ForumThread>>(
                `${API_BASE}/forum/threads/${threadId}`,
                { title, content, tags },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data;
        } catch (error) {
            console.error('Failed to update thread:', error);
            throw error;
        }
    },

    /**
     * Create a forum reply
     */
    async createReply(threadId: number, content: string): Promise<ForumReply> {
        try {
            const response = await axios.post<ApiResponse<ForumReply>>(
                `${API_BASE}/forum/replies`,
                { thread_id: threadId, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to create reply:', error);
            throw error;
        }
    },

    /**
     * Get replies for a thread
     */
    async getReplies(
        threadId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ replies: ForumReply[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ replies: ForumReply[]; total: number }>
            >(`${API_BASE}/forum/threads/${threadId}/replies`, {
                params: { limit, offset },
            });
            return response.data.data || { replies: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch replies:', error);
            throw error;
        }
    },

    /**
     * Delete a forum reply
     */
    async deleteReply(replyId: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE}/forum/replies/${replyId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (error) {
            console.error('Failed to delete reply:', error);
            throw error;
        }
    },

    // ===== STORY ENDPOINTS =====

    /**
     * Create a success story
     */
    async createStory(
        title: string,
        description: string,
        images: string[] = [],
        tags: string[] = [],
        isPublished: boolean = false
    ): Promise<SuccessStory> {
        try {
            const response = await axios.post<ApiResponse<SuccessStory>>(
                `${API_BASE}/stories`,
                { title, description, images, tags, is_published: isPublished },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to create story:', error);
            throw error;
        }
    },

    /**
     * Get a specific story
     */
    async getStory(storyId: number): Promise<SuccessStory> {
        try {
            const response = await axios.get<ApiResponse<SuccessStory>>(
                `${API_BASE}/stories/${storyId}`
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to fetch story:', error);
            throw error;
        }
    },

    /**
     * Get published stories
     */
    async getPublishedStories(
        limit: number = 10,
        offset: number = 0
    ): Promise<{ stories: SuccessStory[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ stories: SuccessStory[]; total: number }>
            >(`${API_BASE}/stories/published`, {
                params: { limit, offset },
            });
            return response.data.data || { stories: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch stories:', error);
            throw error;
        }
    },

    /**
     * Get user's stories
     */
    async getUserStories(
        userId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ stories: SuccessStory[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ stories: SuccessStory[]; total: number }>
            >(`${API_BASE}/stories/user/${userId}`, {
                params: { limit, offset },
            });
            return response.data.data || { stories: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch user stories:', error);
            throw error;
        }
    },

    /**
     * Update a story
     */
    async updateStory(
        storyId: number,
        title: string,
        description: string,
        images: string[] = [],
        tags: string[] = [],
        isPublished: boolean = false
    ): Promise<SuccessStory> {
        try {
            const response = await axios.put<ApiResponse<SuccessStory>>(
                `${API_BASE}/stories/${storyId}`,
                { title, description, images, tags, is_published: isPublished },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to update story:', error);
            throw error;
        }
    },

    /**
     * Delete a story
     */
    async deleteStory(storyId: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE}/stories/${storyId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (error) {
            console.error('Failed to delete story:', error);
            throw error;
        }
    },

    /**
     * Create a story comment
     */
    async createComment(storyId: number, content: string): Promise<StoryComment> {
        try {
            const response = await axios.post<ApiResponse<StoryComment>>(
                `${API_BASE}/stories/comments`,
                { story_id: storyId, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to create comment:', error);
            throw error;
        }
    },

    /**
     * Get story comments
     */
    async getComments(
        storyId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ comments: StoryComment[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ comments: StoryComment[]; total: number }>
            >(`${API_BASE}/stories/${storyId}/comments`, {
                params: { limit, offset },
            });
            return response.data.data || { comments: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            throw error;
        }
    },

    /**
     * Delete a story comment
     */
    async deleteComment(commentId: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE}/stories/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (error) {
            console.error('Failed to delete comment:', error);
            throw error;
        }
    },

    /**
     * Like a story
     */
    async likeStory(storyId: number): Promise<void> {
        try {
            await axios.post(
                `${API_BASE}/stories/${storyId}/like`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
        } catch (error) {
            console.error('Failed to like story:', error);
            throw error;
        }
    },

    /**
     * Unlike a story
     */
    async unlikeStory(storyId: number): Promise<void> {
        try {
            await axios.post(
                `${API_BASE}/stories/${storyId}/unlike`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
        } catch (error) {
            console.error('Failed to unlike story:', error);
            throw error;
        }
    },

    // ===== ENDORSEMENT ENDPOINTS =====

    /**
     * Create an endorsement
     */
    async createEndorsement(
        userId: number,
        skillId: number,
        message: string = ''
    ): Promise<Endorsement> {
        try {
            const response = await axios.post<ApiResponse<Endorsement>>(
                `${API_BASE}/endorsements`,
                { user_id: userId, skill_id: skillId, message },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data!;
        } catch (error) {
            console.error('Failed to create endorsement:', error);
            throw error;
        }
    },

    /**
     * Get endorsements for a user
     */
    async getUserEndorsements(
        userId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ endorsements: Endorsement[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ endorsements: Endorsement[]; total: number }>
            >(`${API_BASE}/endorsements/user/${userId}`, {
                params: { limit, offset },
            });
            return response.data.data || { endorsements: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch endorsements:', error);
            throw error;
        }
    },

    /**
     * Get endorsements for a specific skill
     */
    async getSkillEndorsements(
        userId: number,
        skillId: number,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ endorsements: Endorsement[]; total: number }> {
        try {
            const response = await axios.get<
                ApiResponse<{ endorsements: Endorsement[]; total: number }>
            >(`${API_BASE}/endorsements/user/${userId}/skill/${skillId}`, {
                params: { limit, offset },
            });
            return response.data.data || { endorsements: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch skill endorsements:', error);
            throw error;
        }
    },

    /**
     * Get endorsement count for a skill
     */
    async getEndorsementCount(userId: number, skillId: number): Promise<number> {
        try {
            const response = await axios.get<ApiResponse<{ count: number }>>(
                `${API_BASE}/endorsements/count/${userId}/${skillId}`
            );
            return response.data.data?.count || 0;
        } catch (error) {
            console.error('Failed to fetch endorsement count:', error);
            throw error;
        }
    },

    /**
     * Delete an endorsement
     */
    async deleteEndorsement(endorsementId: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE}/endorsements/${endorsementId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (error) {
            console.error('Failed to delete endorsement:', error);
            throw error;
        }
    },

    /**
     * Get top endorsed skills
     */
    async getTopEndorsedSkills(limit: number = 10): Promise<any[]> {
        try {
            const response = await axios.get<ApiResponse<any[]>>(
                `${API_BASE}/endorsements/top-skills`,
                { params: { limit } }
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch top endorsed skills:', error);
            throw error;
        }
    },
};
