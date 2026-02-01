'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useMemo } from 'react';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: any;
}

interface RevenueChartProps {
    orders: Order[];
}

export default function RevenueChart({ orders }: RevenueChartProps) {
    const chartData = useMemo(() => {
        interface MonthData {
            name: string;
            monthIndex: number;
            year: number;
            total: number;
        }

        // 1. Initialize last 6 months
        const months: MonthData[] = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                total: 0
            });
        }

        // 2. Aggregate data
        orders.forEach(order => {
            // Only count valid orders
            if (!['success', 'settlement', 'capture', 'completed'].includes(order.status?.toLowerCase())) {
                return;
            }

            const date = order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000)
                : new Date(order.createdAt); // fallback if string/date object

            if (isNaN(date.getTime())) return;

            // Find matching month in our range
            const monthData = months.find(m =>
                m.monthIndex === date.getMonth() && m.year === date.getFullYear()
            );

            if (monthData) {
                monthData.total += order.total;
            }
        });

        return months;
    }, [orders]);

    // Handle empty state visual
    if (orders.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-50/50 rounded-xl">
                No revenue data available yet.
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'IDR', // Using IDR but short format (e.g., 10M would be ideal but simple k/m logic is complex here, sticking to basic)
                                notation: "compact",
                                compactDisplay: "short"
                            }).format(value)
                        }
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value: any) => [
                            new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value) || 0),
                            'Revenue'
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
