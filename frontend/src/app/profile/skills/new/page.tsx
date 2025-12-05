'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { useSkillStore } from '@/stores/skill.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import type { SkillLevel } from '@/types';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function AddSkillContent() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { skills, fetchSkills, addUserSkill, isLoading } = useSkillStore();
    const [skillsLoading, setSkillsLoading] = useState(true);

    const [formData, setFormData] = useState({
        skill_id: '',
        level: '' as SkillLevel,
        description: '',
        hourly_rate: '',
        years_of_experience: '',
        is_available: true,
    });

    useEffect(() => {
        if (!user?.id) {
            router.push('/login');
            return;
        }

        fetchSkills({limit: 100, offset: 0})
            .catch(console.error)
            .finally(() => setSkillsLoading(false));
    }, [user?.id, router, fetchSkills]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.skill_id) {
            toast.error('Please select a skill');
            return;
        }
        if (!formData.level) {
            toast.error('Proficiency level is required');
            return;
        }

        try {
            await addUserSkill({
                skill_id: parseInt(formData.skill_id),
                level: formData.level,
                description: formData.description,
                hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : 0,
                years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
                proof_url: '',
                proof_type: '',
                online_only: false,
                offline_only: false,
                is_available: formData.is_available,
            });

            toast.success('Skill added successfully');
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add skill');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Skill</CardTitle>
                            <CardDescription>Share a skill you can teach with the community</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Skill Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="skill_id">Skill *</Label>
                                    <Select value={formData.skill_id} onValueChange={(value) => handleSelectChange('skill_id', value)}>
                                        <SelectTrigger id="skill_id" disabled={skillsLoading}>
                                            <SelectValue placeholder={skillsLoading ? 'Loading skills...' : 'Select a skill'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {skills.map(skill => (
                                                <SelectItem key={skill.id} value={skill.id.toString()}>
                                                    {skill.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Proficiency Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="level">Proficiency Level *</Label>
                                    <Select value={formData.level} onValueChange={(value) => handleSelectChange('level', value)}>
                                        <SelectTrigger id="level">
                                            <SelectValue placeholder="Select your level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SKILL_LEVELS.map(level => (
                                                <SelectItem key={level} value={level}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe your experience and what students will learn"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>

                                {/* Years of Experience */}
                                <div className="space-y-2">
                                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                                    <Input
                                        id="years_of_experience"
                                        name="years_of_experience"
                                        type="number"
                                        placeholder="e.g., 5"
                                        value={formData.years_of_experience}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Hourly Rate */}
                                <div className="space-y-2">
                                    <Label htmlFor="hourly_rate">Hourly Rate (Credits/Hour)</Label>
                                    <Input
                                        id="hourly_rate"
                                        name="hourly_rate"
                                        type="number"
                                        placeholder="e.g., 10"
                                        value={formData.hourly_rate}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <Button type="submit" disabled={isLoading || skillsLoading}>
                                        {isLoading ? 'Adding...' : 'Add Skill'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/profile')}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function AddSkillPage() {
    return (
        <ProtectedRoute>
            <AddSkillContent />
        </ProtectedRoute>
    );
}
