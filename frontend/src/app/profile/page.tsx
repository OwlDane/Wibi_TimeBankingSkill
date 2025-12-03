'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { useAuthStore } from "@/stores/auth.store";
import { useSkillStore } from "@/stores/skill.store";
import type { UserSkill, LearningSkill } from "@/types";

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ProfileContent() {
  const { user } = useAuthStore();
  const { userSkills, learningSkills, isLoadingUserSkills, isLoadingLearningSkills, fetchUserSkills, fetchLearningSkills } = useSkillStore();

  useEffect(() => {
    fetchUserSkills().catch(console.error);
    fetchLearningSkills().catch(console.error);
  }, [fetchUserSkills, fetchLearningSkills]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex flex-col space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{getInitials(user.full_name || 'U')}</span>
                )}
              </div>
            </div>
            <div className="grow space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.full_name}</h1>
                  <p className="text-muted-foreground">@{user.username} • Joined {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      <path d="m15 5 3 3" />
                    </svg>
                    Edit Profile
                  </Button>
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="M9 15h6" />
                    </svg>
                    Add Skill
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                    <path d="M13 13h4" />
                    <path d="M13 17h4" />
                    <path d="M9 13h.01" />
                    <path d="M9 17h.01" />
                  </svg>
                  <span>{user.school || 'Not specified'}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  <span>Grade {user.grade || '-'} • {user.major || '-'}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{user.credit_balance?.toFixed(1) || '0.0'} Credits</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-yellow-400">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{user.average_rating_as_teacher?.toFixed(1) || 'N/A'} Rating</span>
                </div>
              </div>
              <p className="text-muted-foreground">{user.bio || 'No bio yet'}</p>
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="teaching" className="w-full">
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-row gap-2">
              <TabsTrigger value="teaching">Teaching Skills</TabsTrigger>
              <TabsTrigger value="learning">Learning Wishlist</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            {/* Teaching Skills Tab */}
            <TabsContent value="teaching" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingUserSkills ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading skills...</p>
                  </div>
                ) : userSkills.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p>You haven't added any teaching skills yet.</p>
                  </div>
                ) : (
                  userSkills.map((skill: UserSkill) => (
                    <Card key={skill.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{skill.skill?.name || 'Unknown Skill'}</CardTitle>
                            <CardDescription>{skill.level} Level</CardDescription>
                          </div>
                          <Badge>{skill.skill?.category || 'General'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{skill.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 text-yellow-400">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{skill.average_rating?.toFixed(1) || 'N/A'} ({skill.total_sessions || 0} sessions)</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                            <span>{skill.years_of_experience || 0} year{skill.years_of_experience !== 1 ? "s" : ""} experience</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full ${skill.is_available ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                          <span className="text-sm">{skill.is_available ? 'Available' : 'Unavailable'}</span>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
                <Card className="border-dashed flex flex-col items-center justify-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">Add New Skill</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">Share your knowledge and earn time credits</p>
                  <Button variant="outline">Add Skill</Button>
                </Card>
              </div>
            </TabsContent>

            {/* Learning Wishlist Tab */}
            <TabsContent value="learning" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingLearningSkills ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading learning skills...</p>
                  </div>
                ) : learningSkills.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p>You haven't added any learning goals yet.</p>
                  </div>
                ) : (
                  learningSkills.map((skill: LearningSkill) => (
                    <Card key={skill.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{skill.skill?.name || 'Unknown Skill'}</CardTitle>
                            <CardDescription>Desired Level: {skill.desired_level || 'Any'}</CardDescription>
                          </div>
                          <Badge variant="outline">{skill.skill?.category || 'General'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{skill.notes || 'No notes'}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">Remove</Button>
                        <Button size="sm">Find Tutors</Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
                <Card className="border-dashed flex flex-col items-center justify-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">Add Learning Goal</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">What skills would you like to learn?</p>
                  <Button variant="outline">Add Skill</Button>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Complete sessions to receive reviews from students!</p>
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                  <path d="M6 10c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8h-8" />
                  <polyline points="15 14 18 10 21 14" />
                  <path d="M6 14H3" />
                  <path d="M6 18H3" />
                  <path d="M6 22H3" />
                </svg>
                <p className="text-lg font-medium">No badges yet</p>
                <p className="text-sm mt-1">Complete sessions and achievements to earn badges!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
