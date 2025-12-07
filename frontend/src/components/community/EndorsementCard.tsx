'use client';

import Link from 'next/link';
import { Award, X } from 'lucide-react';
import type { Endorsement } from '@/types';
import { Button } from '@/components/ui/button';

interface EndorsementCardProps {
    endorsement: Endorsement;
    onDelete?: (endorsementId: number) => void;
    canDelete?: boolean;
}

export function EndorsementCard({
    endorsement,
    onDelete,
    canDelete = false,
}: EndorsementCardProps) {
    return (
        <div className="relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
            {/* Delete button */}
            {canDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(endorsement.id)}
                    className="absolute top-2 right-2"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}

            {/* Content */}
            <div className="flex gap-4">
                {/* Endorser Avatar */}
                {endorsement.endorser?.avatar ? (
                    <img
                        src={endorsement.endorser.avatar}
                        alt={endorsement.endorser.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {endorsement.endorser?.full_name?.[0] || 'U'}
                    </div>
                )}

                {/* Details */}
                <div className="flex-1">
                    {/* Endorser name and skill */}
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={`/profile/${endorsement.endorser?.id}`}>
                            <p className="font-semibold hover:text-primary transition-colors">
                                {endorsement.endorser?.full_name}
                            </p>
                        </Link>
                        <Award className="h-4 w-4 text-yellow-500" />
                        {endorsement.skill && (
                            <span className="text-sm text-muted-foreground">
                                endorsed your {endorsement.skill.name}
                            </span>
                        )}
                    </div>

                    {/* Message */}
                    {endorsement.message && (
                        <p className="text-sm text-muted-foreground mb-2 italic">
                            "{endorsement.message}"
                        </p>
                    )}

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                        {new Date(endorsement.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
