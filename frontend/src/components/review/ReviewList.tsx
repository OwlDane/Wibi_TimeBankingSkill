'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, Edit2 } from 'lucide-react'
import { useReviewStore } from '@/stores'
import { toast } from 'sonner'
import type { Review } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ReviewListProps {
    userId: number;
    reviewType?: 'teacher' | 'student';
    limit?: number;
}

/**
 * ReviewList component for displaying user reviews
 */
export default function ReviewList({ userId, reviewType, limit = 10 }: ReviewListProps) {
    const [offset, setOffset] = useState(0)
    const { userReviews, total, isLoading, error, fetchUserReviews, fetchUserReviewsByType, deleteReview } = useReviewStore()

    useEffect(() => {
        if (reviewType) {
            fetchUserReviewsByType(userId, reviewType, limit, offset)
        } else {
            fetchUserReviews(userId, limit, offset)
        }
    }, [userId, reviewType, limit, offset])

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            await deleteReview(reviewId)
            toast.success('Review deleted successfully')
        } catch (error) {
            toast.error('Failed to delete review')
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (reviewType) {
                                fetchUserReviewsByType(userId, reviewType, limit, offset)
                            } else {
                                fetchUserReviews(userId, limit, offset)
                            }
                        }}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (userReviews.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                        {reviewType === 'teacher'
                            ? 'No reviews as a teacher yet. Complete sessions and get reviewed!'
                            : reviewType === 'student'
                            ? 'No reviews as a student yet. Complete sessions and get reviewed!'
                            : 'No reviews yet. Complete sessions and get reviewed!'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.floor(offset / limit) + 1

    return (
        <div className="space-y-4">
            {/* Reviews */}
            {userReviews.map((review) => (
                <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber
                            if (totalPages <= 5) {
                                pageNumber = i + 1
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i
                            } else {
                                pageNumber = currentPage - 2 + i
                            }

                            return (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setOffset((pageNumber - 1) * limit)}
                                >
                                    {pageNumber}
                                </Button>
                            )
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setOffset(offset + limit)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

/**
 * ReviewCard component for displaying individual review
 */
function ReviewCard({ review, onDelete }: { review: Review; onDelete: (id: number) => void }) {
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600'
        if (rating >= 3.5) return 'text-yellow-600'
        if (rating >= 2.5) return 'text-orange-600'
        return 'text-red-600'
    }

    const getDetailedRatings = () => {
        const ratings = []
        if (review.communication_rating) ratings.push(`Communication: ${review.communication_rating}⭐`)
        if (review.punctuality_rating) ratings.push(`Punctuality: ${review.punctuality_rating}⭐`)
        if (review.knowledge_rating) ratings.push(`Knowledge: ${review.knowledge_rating}⭐`)
        return ratings
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {review.reviewer?.avatar && (
                                <img
                                    src={review.reviewer.avatar}
                                    alt={review.reviewer.full_name}
                                    className="w-10 h-10 rounded-full"
                                />
                            )}
                            <div>
                                <p className="font-semibold">{review.reviewer?.full_name}</p>
                                <p className="text-sm text-muted-foreground">@{review.reviewer?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`text-lg font-bold ${getRatingColor(review.rating)}`}>
                                {'⭐'.repeat(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                            <Badge variant="secondary" className="text-xs">
                                {review.type === 'teacher' ? 'Review as Teacher' : 'Review as Student'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" disabled>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(review.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Comment */}
                {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                )}

                {/* Detailed Ratings */}
                {getDetailedRatings().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {getDetailedRatings().map((rating, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {rating}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                    {review.helpful_count > 0 && (
                        <span>👍 {review.helpful_count} found this helpful</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
