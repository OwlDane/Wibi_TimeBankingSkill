'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStore } from '@/stores/admin.store';
import { toast } from 'sonner';
import { Lock, Mail, Loader2, Shield } from 'lucide-react';

// Validation schema
const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAdminStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Wibi Administration Dashboard</p>
                </div>

                {/* Login Card */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-white">Admin Login</CardTitle>
                        <CardDescription>Enter your admin credentials to access the dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Login as Admin
                                    </>
                                )}
                            </Button>

                            {/* Demo Credentials */}
                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-300 font-medium mb-2">Demo Credentials:</p>
                                <p className="text-xs text-blue-200">Email: admin@wibi.com</p>
                                <p className="text-xs text-blue-200">Password: Admin123456</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Back to User Login */}
                <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                        Not an admin?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-primary hover:underline font-medium"
                        >
                            Go to user login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
