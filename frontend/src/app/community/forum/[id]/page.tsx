'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { communityService } from '@/lib/services/community.service';
import { useCommunityStore } from '@/stores/community.store';
import type { ForumThread, ForumReply } from '@/types';
import { toast } from 'sonner';

export default function ForumThreadPage() {
    const params = useParams();
    const router = useRouter();
    const threadId = parseInt(params.id as string);

    const { selectedThread, setSelectedThread, replies, setReplies, loading, setLoading, error, setError } =
        useCommunityStore();

    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchThread();
        fetchReplies();
    }, [threadId]);

    const fetchThread = async () => {
        try {
            setLoading(true);
            const data = await communityService.getThread(threadId);
            setSelectedThread(data);
        } catch (err) {
            setError('Failed to load thread');
            toast.error('Failed to load thread');
        } finally {
            setLoading(false);
        }
    };

    const fetchReplies = async () => {
        try {
            const data = await communityService.getReplies(threadId);
            setReplies(data.replies);
        } catch (err) {
            console.error('Failed to fetch replies:', err);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        try {
            setSubmitting(true);
            const newReply = await communityService.createReply(threadId, replyContent);
            setReplies([newReply, ...replies]);
            setReplyContent('');
            toast.success('Reply posted successfully!');
        } catch (err) {
            toast.error('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;

        try {
            await communityService.deleteReply(replyId);
            setReplies(replies.filter((r) => r.id !== replyId));
            toast.success('Reply deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete reply');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !selectedThread) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">{error || 'Thread not found'}</p>
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

                {/* Thread */}
                <div className="bg-card rounded-lg border border-border p-6 mb-8">
                    <h1 className="text-3xl font-bold mb-4">{selectedThread.title}</h1>

                    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                        <span>By {selectedThread.author?.full_name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(selectedThread.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {selectedThread.reply_count} replies
                        </span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-6">
                        <p>{selectedThread.content}</p>
                    </div>

                    {selectedThread.tags && selectedThread.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedThread.tags.map((tag) => (
                                <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reply form */}
                <div className="bg-card rounded-lg border border-border p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Post a Reply</h2>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply here..."
                        className="w-full p-3 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                    />
                    <Button onClick={handleReply} disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Reply'}
                    </Button>
                </div>

                {/* Replies */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Replies ({replies.length})</h2>
                    {replies.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No replies yet. Be the first to reply!</p>
                    ) : (
                        replies.map((reply) => (
                            <div key={reply.id} className="bg-card rounded-lg border border-border p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{reply.author?.full_name || 'Anonymous'}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteReply(reply.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Delete
                                    </Button>
                                </div>
                                <p className="text-muted-foreground">{reply.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
