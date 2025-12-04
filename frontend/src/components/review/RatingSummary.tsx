'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useReviewStore } from '@/stores'
import type { RatingSummary } from '@/types'

interface RatingSummaryProps {
    userId: number;
}

/**
 * RatingSummary component for displaying user's rating statistics
 */
export default function RatingSummaryComponent({ userId }: RatingSummaryProps) {
    const { ratingSummary, isLoading, error, fetchUserRatingSummary } = useReviewStore()

    useEffect(() => {
        fetchUserRatingSummary(userId)
    }, [userId, fetchUserRatingSummary])

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (error || !ratingSummary) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">{error || 'Failed to load rating summary'}</p>
                </CardContent>
            </Card>
        )
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
        if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400'
        if (rating >= 2.5) return 'text-orange-600 dark:text-orange-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getRatingBadgeColor = (rating: number) => {
        if (rating >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        if (rating >= 2.5) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Rating */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overall Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold ${getRatingColor(ratingSummary.average_rating)}`}>
                                {ratingSummary.average_rating.toFixed(1)}
                            </span>
                            <div className="text-2xl">⭐</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Based on {ratingSummary.total_reviews} review{ratingSummary.total_reviews !== 1 ? 's' : ''}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Teacher Rating */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">As a Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold ${getRatingColor(ratingSummary.average_teacher_rating)}`}>
                                {ratingSummary.average_teacher_rating.toFixed(1)}
                            </span>
                            <div className="text-2xl">👨‍🏫</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {ratingSummary.teacher_review_count} review{ratingSummary.teacher_review_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Student Rating */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">As a Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold ${getRatingColor(ratingSummary.average_student_rating)}`}>
                                {ratingSummary.average_student_rating.toFixed(1)}
                            </span>
                            <div className="text-2xl">👨‍🎓</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {ratingSummary.student_review_count} review{ratingSummary.student_review_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
