import { apiClient } from '@/lib/api';
import type { Skill, UserSkill, LearningSkill } from '@/types';

export interface SkillsResponse {
    skills: Skill[];
    total: number;
    limit: number;
    offset: number;
}

export interface AddUserSkillRequest {
    skill_id: number;
    level: string;
    description?: string;
    years_of_experience?: number;
    proof_url?: string;
    proof_type?: string;
    hourly_rate?: number;
    online_only?: boolean;
    offline_only?: boolean;
    is_available?: boolean;
}

export interface UpdateUserSkillRequest {
    level?: string;
    description?: string;
    years_of_experience?: number;
    proof_url?: string;
    proof_type?: string;
    hourly_rate?: number;
    online_only?: boolean;
    offline_only?: boolean;
    is_available?: boolean;
}

export interface AddLearningSkillRequest {
    skill_id: number;
    desired_level?: string;
    notes?: string;
    priority?: number;
}

export const skillService = {
    // Get all skills (master list) with filters
    getAllSkills: async (params?: {
        limit?: number;
        offset?: number;
        category?: string;
        search?: string;
    }): Promise<SkillsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        return apiClient.get<SkillsResponse>(`/skills${query ? `?${query}` : ''}`);
    },

    // Get skill by ID
    getSkillById: async (id: number): Promise<Skill> => {
        return apiClient.get<Skill>(`/skills/${id}`);
    },

    // Get teachers for a specific skill
    getSkillTeachers: async (skillId: number): Promise<UserSkill[]> => {
        return apiClient.get<UserSkill[]>(`/skills/${skillId}/teachers`);
    },

    // Get current user's teaching skills
    getUserSkills: async (): Promise<UserSkill[]> => {
        return apiClient.get<UserSkill[]>('/user/skills');
    },

    // Add a teaching skill
    addUserSkill: async (data: AddUserSkillRequest): Promise<UserSkill> => {
        return apiClient.post<UserSkill>('/user/skills', data);
    },

    // Update a teaching skill
    updateUserSkill: async (skillId: number, data: UpdateUserSkillRequest): Promise<UserSkill> => {
        return apiClient.put<UserSkill>(`/user/skills/${skillId}`, data);
    },

    // Delete a teaching skill
    deleteUserSkill: async (skillId: number): Promise<void> => {
        return apiClient.delete(`/user/skills/${skillId}`);
    },

    // Get current user's learning skills (wishlist)
    getLearningSkills: async (): Promise<LearningSkill[]> => {
        return apiClient.get<LearningSkill[]>('/user/learning-skills');
    },

    // Add a learning skill
    addLearningSkill: async (data: AddLearningSkillRequest): Promise<LearningSkill> => {
        return apiClient.post<LearningSkill>('/user/learning-skills', data);
    },

    // Delete a learning skill
    deleteLearningSkill: async (skillId: number): Promise<void> => {
        return apiClient.delete(`/user/learning-skills/${skillId}`);
    },
};
