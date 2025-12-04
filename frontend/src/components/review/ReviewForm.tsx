'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Star, Loader2 } from 'lucide-react'
import { useReviewStore } from '@/stores'
import { toast } from 'sonner'
import type { Session } from '@/types'

interface ReviewFormProps {
    session: Session;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * ReviewForm component for creating reviews after a session
 */
export default function ReviewForm({ session, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [communicationRating, setCommunicationRating] = useState<number | null>(null)
    const [punctualityRating, setPunctualityRating] = useState<number | null>(null)
    const [knowledgeRating, setKnowledgeRating] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { createReview } = useReviewStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!rating) {
            toast.error('Please select a rating')
            return
        }

        try {
            setIsSubmitting(true)
            await createReview({
                session_id: session.id,
                rating,
                comment,
                communication_rating: communicationRating,
                punctuality_rating: punctualityRating,
                knowledge_rating: knowledgeRating,
            })
            toast.success('Review submitted successfully!')
            onSuccess?.()
        } catch (error) {
            toast.error('Failed to submit review')
        } finally {
            setIsSubmitting(false)
        }
    }

    const revieweeType = session.teacher_id === session.student_id ? 'Teacher' : 'Student'
    const revieweeName = revieweeType === 'Teacher' ? session.teacher?.full_name : session.student?.full_name

    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overall Rating */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Overall Rating</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-3xl transition-transform hover:scale-110 ${
                                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{rating}/5 stars</p>
                    </div>

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Communication Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="communication">Communication</Label>
                            <Select
                                value={communicationRating?.toString() || ''}
                                onValueChange={(val) => setCommunicationRating(parseInt(val))}
                            >
                                <SelectTrigger id="communication">
                                    <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <SelectItem key={val} value={val.toString()}>
                                            {val} ⭐
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Punctuality Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="punctuality">Punctuality</Label>
                            <Select
                                value={punctualityRating?.toString() || ''}
                                onValueChange={(val) => setPunctualityRating(parseInt(val))}
                            >
                                <SelectTrigger id="punctuality">
                                    <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <SelectItem key={val} value={val.toString()}>
                                            {val} ⭐
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Knowledge Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="knowledge">Knowledge</Label>
                            <Select
                                value={knowledgeRating?.toString() || ''}
                                onValueChange={(val) => setKnowledgeRating(parseInt(val))}
                            >
                                <SelectTrigger id="knowledge">
                                    <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <SelectItem key={val} value={val.toString()}>
                                            {val} ⭐
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Review (Optional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">{comment.length}/500 characters</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
