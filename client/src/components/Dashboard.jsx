import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, AlertCircle, Calendar, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('stats.php').then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => console.error(err));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const { balance, next_fee, days_remaining, safe_to_spend_daily, alerts } = stats;
    const isHealthy = safe_to_spend_daily > 50;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, Student</h2>
                <p className="text-slate-500">Here's your financial health update.</p>
            </div>

            {/* Hero Card: Daily Burn Rate */}
            <div className={`relative overflow-hidden p-8 rounded-3xl shadow-xl text-white ${isHealthy
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20'
                : 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-500/20'}`
            }>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium opacity-90">Daily Safe-to-Spend</h3>
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-5xl font-bold tracking-tight">${safe_to_spend_daily}</span>
                        <span className="text-lg opacity-80">/ day</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm leading-relaxed opacity-90">
                            Based on your balance and upcoming <strong>${next_fee?.amount_due || 0} fee</strong> due in <strong>{days_remaining} days</strong>.
                            {isHealthy ? " You are on track! 🎉" : " Budget tight! Use 2-min noodles mode. 🍜"}
                        </p>
                    </div>
                </div>

                {/* Decorative Background Circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    icon={<CreditCard className="text-indigo-600" size={24} />}
                    label="Current Balance"
                    value={`$${balance || 0}`}
                    color="indigo"
                />

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="bg-orange-50 p-3 rounded-xl">
                            <Calendar className="text-orange-600" size={24} />
                        </div>
                        {next_fee && (
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                Due {next_fee?.due_date}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mt-4">Next Installment</p>
                        <h4 className="text-2xl font-bold text-slate-900 mt-1">
                            ${next_fee ? (next_fee.amount_due - next_fee.amount_saved) : 0}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">Remaining to pay</p>
                    </div>
                </div>
            </div>

            {/* Smart Alerts & Insights */}
            <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Smart Alerts</h3>

                {alerts && alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3
                            ${alert.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                    'bg-emerald-50 border-emerald-100 text-emerald-800'}
                        `}>
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">{alert.title}</h4>
                                <p className="text-sm opacity-90">{alert.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-slate-500 text-sm flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        All good! No critical alerts currently.
                    </div>
                )}

                {/* General Insight (Fallback) */}
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-2">Strategy Tip</h3>
                    <p className="text-indigo-700 text-sm leading-relaxed">
                        To meet your next college fee deadline comfortably, try to save an extra
                        <strong> ${(next_fee?.amount_due / days_remaining).toFixed(2)} </strong>
                        each day. Link this to your College Fund bucket.
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-indigo-100 transition-colors">
        <div className="flex justify-between items-start">
            <div className={`bg-${color}-50 p-3 rounded-xl`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium mt-4">{label}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
    </div>
);

export default Dashboard;
