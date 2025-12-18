'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/stores/admin.store';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Eye, EyeOff, BarChart3, Users, TrendingUp, Shield } from 'lucide-react';

const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAdminStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [stayLoggedIn, setStayLoggedIn] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginFormData>({
        resolver: zodResolver(adminLoginSchema),
    });

    const onSubmit = async (data: AdminLoginFormData) => {
        setIsSubmitting(true);
        try {
            await login(data);
            toast.success('Admin login successful!');
            router.push('/admin');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Orange Pattern Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-orange-600 via-amber-500 to-orange-400 p-12 flex-col justify-between relative overflow-hidden">
                {/* Dot Pattern Overlay */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Dark Geometric Shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-black/40 transform rotate-45 translate-x-48 -translate-y-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/30 transform -rotate-12 -translate-x-32 translate-y-32"></div>
                </div>

                {/* Back Button */}
                <div className="relative z-10">
                    <button 
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                        Exchange skills,<br />
                        build community.
                    </h1>
                    <p className="text-white/90 text-lg max-w-md">
                        Connect with peers, share knowledge, and grow together using time as your currency.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-white/70 text-sm">
                    2024 Wibi. Time Banking & Skill Exchange Platform
                </div>
            </div>

            {/* Right Side - Dark Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Shield className="w-7 h-7 text-orange-500" />
                        </div>
                        <span className="text-2xl font-bold text-white">Wibi Admin</span>
                    </div>

                    {/* Logo for Desktop */}
                    <div className="hidden lg:flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-white font-semibold">Waktu Indonesia Berbagi Ilmu</span>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                        <p className="text-slate-400">Sign in to your account to continue your journey with Wibi</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Email</label>
                            <div className="relative">
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Your Email"
                                    className="h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-400 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Password</label>
                            <div className="relative">
                                <Input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Your Password"
                                    className="h-12 pr-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-400 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-slate-950 px-2 text-slate-600">OR CONTINUE WITH</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => router.push('/register')}
                                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="text-orange-500 hover:text-orange-400 font-medium text-sm mt-4 transition-colors block mx-auto"
                        >
                            Forgot password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
