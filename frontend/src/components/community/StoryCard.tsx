'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { SuccessStory } from '@/types';
import { Button } from '@/components/ui/button';

interface StoryCardProps {
    story: SuccessStory;
    onLike?: (storyId: number) => void;
    isLiked?: boolean;
}

export function StoryCard({ story, onLike, isLiked = false }: StoryCardProps) {
    return (
        <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
            {/* Image */}
            {story.images && story.images.length > 0 && (
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <img
                        src={story.images[0]}
                        alt={story.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {/* Title and Author */}
                <div className="mb-3">
                    <Link href={`/community/stories/${story.id}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {story.title}
                        </h3>
                    </Link>
                    {story.user && (
                        <p className="text-sm text-muted-foreground mt-1">
                            by {story.user.full_name}
                        </p>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {story.description}
                </p>

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{story.like_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{story.comment_count}</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLike?.(story.id)}
                        className={isLiked ? 'text-red-500' : ''}
                    >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
