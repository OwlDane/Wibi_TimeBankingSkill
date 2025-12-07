'use client';

import { useEffect, useState } from 'react';
import { Loader2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EndorsementCard } from '@/components/community';
import { communityService } from '@/lib/services/community.service';
import { useCommunityStore } from '@/stores/community.store';
import type { Endorsement } from '@/types';
import { toast } from 'sonner';

export default function EndorsementsPage() {
    const { endorsements, setEndorsements, loading, setLoading, error, setError } = useCommunityStore();
    const [topSkills, setTopSkills] = useState<any[]>([]);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchEndorsements();
        fetchTopSkills();
    }, [offset]);

    const fetchEndorsements = async () => {
        try {
            setLoading(true);
            // Fetch current user's endorsements
            const data = await communityService.getUserEndorsements(1, limit, offset);
            setEndorsements(data.endorsements);
            setTotal(data.total);
        } catch (err) {
            setError('Failed to load endorsements');
            toast.error('Failed to load endorsements');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopSkills = async () => {
        try {
            const skills = await communityService.getTopEndorsedSkills(5);
            setTopSkills(skills);
        } catch (err) {
            console.error('Failed to fetch top skills:', err);
        }
    };

    const handleDelete = async (endorsementId: number) => {
        if (!confirm('Are you sure you want to delete this endorsement?')) return;

        try {
            await communityService.deleteEndorsement(endorsementId);
            setEndorsements(endorsements.filter((e) => e.id !== endorsementId));
            toast.success('Endorsement deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete endorsement');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-12 gap-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
                        Skill Endorsements
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl">
                        Get recognized for your skills by your peers
                    </p>
                </div>

                {/* Top Endorsed Skills */}
                {topSkills.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Top Endorsed Skills</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {topSkills.map((skill, index) => (
                                <div
                                    key={skill.id}
                                    className="bg-card rounded-lg border border-border p-4 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="text-2xl font-bold text-primary mb-2">#{index + 1}</div>
                                    <p className="font-semibold mb-2">{skill.name}</p>
                                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                        <Award className="h-4 w-4" />
                                        <span>{skill.endorsement_count || 0} endorsements</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Endorsements List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : endorsements.length === 0 ? (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No endorsements yet</p>
                        <Button variant="outline" onClick={fetchEndorsements}>
                            Refresh
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Your Endorsements ({total})</h2>
                        <div className="space-y-4 mb-8">
                            {endorsements.map((endorsement) => (
                                <div key={endorsement.id} className="relative">
                                    <EndorsementCard
                                        endorsement={endorsement}
                                        onDelete={handleDelete}
                                        canDelete={true}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {total > limit && (
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    disabled={offset === 0}
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {offset + 1} - {Math.min(offset + limit, total)} of {total}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={offset + limit >= total}
                                    onClick={() => setOffset(offset + limit)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
