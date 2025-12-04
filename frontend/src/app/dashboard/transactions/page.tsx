'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { useTransactionStore } from '@/stores/transaction.store';
import { transactionService } from '@/lib/services';
import type { Transaction } from '@/types';

// Format date helper
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Get badge variant based on transaction type
function getTransactionBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (type) {
        case 'earned':
        case 'initial':
        case 'bonus':
        case 'refund':
            return 'default';
        case 'spent':
        case 'hold':
        case 'penalty':
            return 'destructive';
        default:
            return 'secondary';
    }
}

function TransactionHistoryContent() {
    const { transactions, total, isLoading, fetchTransactions } = useTransactionStore();
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        fetchTransactions(limit, offset).catch(console.error);
    }, [limit, offset, fetchTransactions]);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main Content */}
            <main className="container py-8">
                <div className="flex flex-col space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Transaction History</h1>
                            <p className="text-muted-foreground">View all your credit transactions</p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </div>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>
                                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No transactions yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-semibold">Date</th>
                                                <th className="text-left p-4 font-semibold">Type</th>
                                                <th className="text-left p-4 font-semibold">Description</th>
                                                <th className="text-right p-4 font-semibold">Amount</th>
                                                <th className="text-right p-4 font-semibold">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((transaction: Transaction) => (
                                                <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 text-sm">{formatDate(transaction.created_at)}</td>
                                                    <td className="p-4">
                                                        <Badge variant={getTransactionBadgeVariant(transaction.type)}>
                                                            {transactionService.formatTransactionType(transaction.type)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm">{transaction.description}</td>
                                                    <td className={`p-4 text-right font-medium ${transactionService.getTransactionTypeColor(transaction.type)}`}>
                                                        {transactionService.formatAmount(transaction.amount)}
                                                    </td>
                                                    <td className="p-4 text-right font-medium">{transaction.balance_after.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setOffset(Math.max(0, offset - limit))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setOffset(offset + limit)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Showing Per Page
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setOffset(0);
                                    }}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Current Page
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentPage}</div>
                                <p className="text-xs text-muted-foreground mt-1">of {totalPages} pages</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function TransactionHistoryPage() {
    return (
        <ProtectedRoute>
            <TransactionHistoryContent />
        </ProtectedRoute>
    );
}
