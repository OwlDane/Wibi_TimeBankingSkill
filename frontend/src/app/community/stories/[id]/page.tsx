'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { communityService } from '@/lib/services/community.service';
import { useCommunityStore } from '@/stores/community.store';
import type { SuccessStory, StoryComment } from '@/types';
import { toast } from 'sonner';

export default function StoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const storyId = parseInt(params.id as string);

    const { selectedStory, setSelectedStory, storyComments, setStoryComments, loading, setLoading, error, setError } =
        useCommunityStore();

    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        fetchStory();
        fetchComments();
    }, [storyId]);

    const fetchStory = async () => {
        try {
            setLoading(true);
            const data = await communityService.getStory(storyId);
            setSelectedStory(data);
        } catch (err) {
            setError('Failed to load story');
            toast.error('Failed to load story');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await communityService.getComments(storyId);
            setStoryComments(data.comments);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const handleComment = async () => {
        if (!commentContent.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        try {
            setSubmitting(true);
            const newComment = await communityService.createComment(storyId, commentContent);
            setStoryComments([newComment, ...storyComments]);
            setCommentContent('');
            toast.success('Comment posted successfully!');
        } catch (err) {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async () => {
        try {
            if (isLiked) {
                await communityService.unlikeStory(storyId);
                setIsLiked(false);
            } else {
                await communityService.likeStory(storyId);
                setIsLiked(true);
            }
            if (selectedStory) {
                setSelectedStory({
                    ...selectedStory,
                    like_count: isLiked ? selectedStory.like_count - 1 : selectedStory.like_count + 1,
                });
            }
        } catch (err) {
            toast.error('Failed to like story');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await communityService.deleteComment(commentId);
            setStoryComments(storyComments.filter((c) => c.id !== commentId));
            toast.success('Comment deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete comment');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !selectedStory) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">{error || 'Story not found'}</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="w-full max-w-4xl mx-auto">
                {/* Back button */}
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {/* Story */}
                <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
                    {/* Image */}
                    {selectedStory.images && selectedStory.images.length > 0 && (
                        <div className="relative h-96 w-full overflow-hidden bg-muted">
                            <img
                                src={selectedStory.images[0]}
                                alt={selectedStory.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-4">{selectedStory.title}</h1>

                        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                            <span>By {selectedStory.user?.full_name || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{new Date(selectedStory.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-6">
                            <p>{selectedStory.description}</p>
                        </div>

                        {selectedStory.tags && selectedStory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedStory.tags.map((tag) => (
                                    <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats and Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    <span>{selectedStory.like_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{selectedStory.comment_count}</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleLike}
                                className={isLiked ? 'text-red-500' : ''}
                            >
                                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                                {isLiked ? 'Unlike' : 'Like'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comment form */}
                <div className="bg-card rounded-lg border border-border p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Leave a Comment</h2>
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write your comment here..."
                        className="w-full p-3 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                    />
                    <Button onClick={handleComment} disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>

                {/* Comments */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Comments ({storyComments.length})</h2>
                    {storyComments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                        storyComments.map((comment) => (
                            <div key={comment.id} className="bg-card rounded-lg border border-border p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{comment.author?.full_name || 'Anonymous'}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Delete
                                    </Button>
                                </div>
                                <p className="text-muted-foreground">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
