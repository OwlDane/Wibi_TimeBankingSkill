'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { VideoCallModal } from '@/components/video'
import { useSessionStore } from '@/stores/session.store'
import { useAuthStore } from '@/stores/auth.store'
import { sessionService } from '@/lib/services/session.service'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, User, MapPin, Link as LinkIcon, FileText, Loader2, Video } from 'lucide-react'
import type { Session } from '@/types'

function SessionDetailContent() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string
    const { user } = useAuthStore()
    const { cancelSession, startSession, confirmCompletion } = useSessionStore()
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [showCancelForm, setShowCancelForm] = useState(false)
    const [showVideoCall, setShowVideoCall] = useState(false)

    useEffect(() => {
        // Fetch session details
        const fetchSession = async () => {
            if (!sessionId) return
            try {
                setIsLoading(true)
                const sessionData = await sessionService.getSession(parseInt(sessionId))
                setSession(sessionData)
            } catch (error) {
                console.error('Failed to load session:', error)
                toast.error('Failed to load session')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSession()
    }, [sessionId])

    const handleStartSession = async () => {
        if (!session) return
        setIsSubmitting(true)
        try {
            await startSession(session.id)
            toast.success('Session started')
            router.refresh()
        } catch (error) {
            toast.error('Failed to start session')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmCompletion = async () => {
        if (!session) return
        setIsSubmitting(true)
        try {
            await confirmCompletion(session.id)
            toast.success('Session marked as completed')
            router.push('/dashboard/sessions')
        } catch (error) {
            toast.error('Failed to complete session')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelSession = async () => {
        if (!session || !cancelReason.trim()) {
            toast.error('Please provide a cancellation reason')
            return
        }
        setIsSubmitting(true)
        try {
            await cancelSession(session.id, { reason: cancelReason })
            toast.success('Session cancelled')
            router.push('/dashboard/sessions')
        } catch (error) {
            toast.error('Failed to cancel session')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading session...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <p className="text-lg font-medium">Session not found</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    const isTeacher = session.teacher_id === user?.id
    const isStudent = session.student_id === user?.id
    const canStart = session.status === 'approved' && (isTeacher || isStudent)
    const canConfirmCompletion = session.status === 'in_progress' && (isTeacher || isStudent)
    const canCancel = ['pending', 'approved'].includes(session.status) && (isTeacher || isStudent)
    // Allow video call for approved or in_progress sessions with online/hybrid mode
    const canJoinVideoCall = ['approved', 'in_progress'].includes(session.status) && 
                            ['online', 'hybrid'].includes(session.mode) && 
                            (isTeacher || isStudent)

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{session.title}</h1>
                            <p className="text-muted-foreground mt-1">{session.user_skill?.skill?.name}</p>
                        </div>
                        <Badge className="text-base">{session.status}</Badge>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Session Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Scheduled</p>
                                            <p className="text-sm font-medium">
                                                {session.scheduled_at
                                                    ? new Date(session.scheduled_at).toLocaleString()
                                                    : 'Not scheduled'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                            <p className="text-sm font-medium">{session.duration} hours</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Credits</p>
                                            <p className="text-sm font-medium">{session.credit_amount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{session.mode}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {session.mode === 'online' && session.meeting_link && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Meeting Link</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            {session.meeting_link}
                                        </a>
                                    </CardContent>
                                </Card>
                            )}

                            {session.mode === 'offline' && session.location && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Location</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <p>{session.location}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Participants</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Teacher</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <p className="text-sm font-medium">{session.teacher?.full_name}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Student</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <p className="text-sm font-medium">{session.student?.full_name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {session.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{session.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {session.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{session.description}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!showCancelForm ? (
                                <div className="flex flex-wrap gap-2">
                                    {canStart && (
                                        <Button onClick={handleStartSession} disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Start Session
                                        </Button>
                                    )}

                                    {canJoinVideoCall && (
                                        <Button
                                            onClick={() => setShowVideoCall(true)}
                                            disabled={isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Video className="mr-2 h-4 w-4" />
                                            {session.status === 'in_progress' ? 'Join Video Call' : 'Start Video Call'}
                                        </Button>
                                    )}

                                    {canConfirmCompletion && (
                                        <Button onClick={handleConfirmCompletion} disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm Completion
                                        </Button>
                                    )}

                                    {canCancel && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowCancelForm(true)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel Session
                                        </Button>
                                    )}

                                    {!canStart && !canConfirmCompletion && !canCancel && (
                                        <p className="text-sm text-muted-foreground">No actions available for this session</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium">Cancellation Reason</label>
                                        <textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Please explain why you're cancelling this session..."
                                            rows={3}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowCancelForm(false)}
                                            disabled={isSubmitting}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleCancelSession}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm Cancellation
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Video Call Modal */}
                {session && (
                    <VideoCallModal
                        isOpen={showVideoCall}
                        onClose={() => setShowVideoCall(false)}
                        sessionId={session.id}
                        partnerName={isTeacher ? session.student?.full_name || 'Student' : session.teacher?.full_name || 'Teacher'}
                    />
                )}
            </main>
        </div>
    )
}

export default function SessionDetailPage() {
    return (
        <ProtectedRoute>
            <SessionDetailContent />
        </ProtectedRoute>
    )
}
