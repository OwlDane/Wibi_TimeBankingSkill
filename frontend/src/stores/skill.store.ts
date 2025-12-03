import { create } from 'zustand';
import { skillService } from '@/lib/services/skill.service';
import type { Skill, UserSkill, LearningSkill } from '@/types';
import type { AddUserSkillRequest, UpdateUserSkillRequest, AddLearningSkillRequest } from '@/lib/services/skill.service';

interface SkillState {
    // Master skills list
    skills: Skill[];
    skillsTotal: number;

    // User's teaching skills
    userSkills: UserSkill[];

    // User's learning wishlist
    learningSkills: LearningSkill[];

    // Loading states
    isLoading: boolean;
    isLoadingUserSkills: boolean;
    isLoadingLearningSkills: boolean;

    error: string | null;

    // Actions - Master Skills
    fetchSkills: (params?: { limit?: number; offset?: number; category?: string; search?: string }) => Promise<void>;

    // Actions - User Teaching Skills
    fetchUserSkills: () => Promise<void>;
    addUserSkill: (data: AddUserSkillRequest) => Promise<void>;
    updateUserSkill: (skillId: number, data: UpdateUserSkillRequest) => Promise<void>;
    deleteUserSkill: (skillId: number) => Promise<void>;

    // Actions - Learning Skills
    fetchLearningSkills: () => Promise<void>;
    addLearningSkill: (data: AddLearningSkillRequest) => Promise<void>;
    deleteLearningSkill: (skillId: number) => Promise<void>;

    clearError: () => void;
    reset: () => void;
}

const initialState = {
    skills: [],
    skillsTotal: 0,
    userSkills: [],
    learningSkills: [],
    isLoading: false,
    isLoadingUserSkills: false,
    isLoadingLearningSkills: false,
    error: null,
};

export const useSkillStore = create<SkillState>((set, get) => ({
    ...initialState,

    // Fetch master skills list
    fetchSkills: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await skillService.getAllSkills(params);
            set({
                skills: response.skills,
                skillsTotal: response.total,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch skills' });
            throw error;
        }
    },

    // Fetch user's teaching skills
    fetchUserSkills: async () => {
        set({ isLoadingUserSkills: true, error: null });
        try {
            const userSkills = await skillService.getUserSkills();
            set({ userSkills, isLoadingUserSkills: false });
        } catch (error: any) {
            set({ isLoadingUserSkills: false, error: error.message || 'Failed to fetch user skills' });
            throw error;
        }
    },

    // Add a teaching skill
    addUserSkill: async (data) => {
        set({ isLoadingUserSkills: true, error: null });
        try {
            const newSkill = await skillService.addUserSkill(data);
            set((state) => ({
                userSkills: [...state.userSkills, newSkill],
                isLoadingUserSkills: false,
            }));
        } catch (error: any) {
            set({ isLoadingUserSkills: false, error: error.message || 'Failed to add skill' });
            throw error;
        }
    },

    // Update a teaching skill
    updateUserSkill: async (skillId, data) => {
        set({ isLoadingUserSkills: true, error: null });
        try {
            const updatedSkill = await skillService.updateUserSkill(skillId, data);
            set((state) => ({
                userSkills: state.userSkills.map((s) =>
                    s.skill_id === skillId ? updatedSkill : s
                ),
                isLoadingUserSkills: false,
            }));
        } catch (error: any) {
            set({ isLoadingUserSkills: false, error: error.message || 'Failed to update skill' });
            throw error;
        }
    },

    // Delete a teaching skill
    deleteUserSkill: async (skillId) => {
        set({ isLoadingUserSkills: true, error: null });
        try {
            await skillService.deleteUserSkill(skillId);
            set((state) => ({
                userSkills: state.userSkills.filter((s) => s.skill_id !== skillId),
                isLoadingUserSkills: false,
            }));
        } catch (error: any) {
            set({ isLoadingUserSkills: false, error: error.message || 'Failed to delete skill' });
            throw error;
        }
    },

    // Fetch learning skills
    fetchLearningSkills: async () => {
        set({ isLoadingLearningSkills: true, error: null });
        try {
            const learningSkills = await skillService.getLearningSkills();
            set({ learningSkills, isLoadingLearningSkills: false });
        } catch (error: any) {
            set({ isLoadingLearningSkills: false, error: error.message || 'Failed to fetch learning skills' });
            throw error;
        }
    },

    // Add a learning skill
    addLearningSkill: async (data) => {
        set({ isLoadingLearningSkills: true, error: null });
        try {
            const newSkill = await skillService.addLearningSkill(data);
            set((state) => ({
                learningSkills: [...state.learningSkills, newSkill],
                isLoadingLearningSkills: false,
            }));
        } catch (error: any) {
            set({ isLoadingLearningSkills: false, error: error.message || 'Failed to add learning skill' });
            throw error;
        }
    },

    // Delete a learning skill
    deleteLearningSkill: async (skillId) => {
        set({ isLoadingLearningSkills: true, error: null });
        try {
            await skillService.deleteLearningSkill(skillId);
            set((state) => ({
                learningSkills: state.learningSkills.filter((s) => s.skill_id !== skillId),
                isLoadingLearningSkills: false,
            }));
        } catch (error: any) {
            set({ isLoadingLearningSkills: false, error: error.message || 'Failed to delete learning skill' });
            throw error;
        }
    },

    clearError: () => set({ error: null }),

    reset: () => set(initialState),
}));
