'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import type { ForumCategory } from '@/types';

interface ForumCategoryCardProps {
    category: ForumCategory;
}

export function ForumCategoryCard({ category }: ForumCategoryCardProps) {
    return (
        <Link href={`/community/forum/${category.id}`}>
            <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary">
                {/* Background accent */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: category.color }}
                />

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                {category.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                    </p>

                    {/* Thread count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{category.thread_count} threads</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
