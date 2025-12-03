'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout";
import { useSkillStore } from "@/stores/skill.store";
import type { Skill } from "@/types";

const categories = [
    { value: 'all', label: 'All Skills' },
    { value: 'academic', label: 'Academic' },
    { value: 'technical', label: 'Technical' },
    { value: 'creative', label: 'Creative' },
    { value: 'language', label: 'Language' },
    { value: 'sports', label: 'Sports' },
];

export default function MarketplacePage() {
    const { skills, skillsTotal, isLoading, fetchSkills } = useSkillStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch skills when filters change
    useEffect(() => {
        fetchSkills({
            limit: 20,
            offset: 0,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: debouncedSearch || undefined,
        }).catch(console.error);
    }, [fetchSkills, selectedCategory, debouncedSearch]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col space-y-8">
                    {/* Page Title */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Skill Marketplace</h1>
                        <p className="text-muted-foreground text-lg">Discover skills to learn or find students to teach</p>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <Input 
                                placeholder="Search skills..." 
                                className="w-full pl-10 bg-muted/50 border-border/50 focus:bg-background" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center bg-muted/50 px-4 py-2 rounded-lg">
                            <span className="font-medium text-foreground">{skillsTotal}</span>&nbsp;skills found
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
                        <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-row gap-2">
                            {categories.map((cat) => (
                                <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
                            ))}
                        </TabsList>
                        
                        <div className="mt-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2 text-muted-foreground">Loading skills...</p>
                                </div>
                            ) : skills.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <p className="text-lg font-medium">No skills found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {skills.map((skill: Skill) => (
                                        <Card key={skill.id} className="group overflow-hidden bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
                                            <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                                                {skill.icon ? (
                                                    <span className="text-5xl group-hover:scale-110 transition-transform">{skill.icon}</span>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40 group-hover:text-primary/60 transition-colors">
                                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                                    </svg>
                                                )}
                                            </div>
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg">{skill.name}</CardTitle>
                                                        <CardDescription className="line-clamp-2">{skill.description || 'No description'}</CardDescription>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize shrink-0 border-border/50">{skill.category}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                        <span>{skill.total_teachers || 0} teachers</span>
                                                    </div>
                                                    <span className="text-border">•</span>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <span>{skill.total_learners || 0} learners</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span className="font-semibold text-sm">1 Credit/hour</span>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Link href={`/marketplace/${skill.id}`} className="w-full">
                                                    <Button className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                                                        View Tutors
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}