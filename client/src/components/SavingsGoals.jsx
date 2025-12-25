import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PiggyBank, Plus, Target, Trophy, X, DollarSign } from 'lucide-react';

const SavingsGoals = () => {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '' });

    // Contribute Modal
    const [contributeModal, setContributeModal] = useState(null);
    const [contributionAmount, setContributionAmount] = useState('');

    const fetchGoals = () => {
        api.get('savings_goals.php').then(setGoals).catch(console.error);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        await api.post('savings_goals.php', newGoal);
        setNewGoal({ name: '', target_amount: '' });
        setShowForm(false);
        fetchGoals();
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!contributeModal) return;

        const txn = {
            category: `Deposit to ${contributeModal.name}`,
            amount: contributionAmount,
            type: 'Expense', // Money leaving "Spending" to go to "Savings"
            bucket: 'Savings',
            linked_goal_id: contributeModal.id
        };

        await api.post('transactions.php', txn);
        setContributeModal(null);
        setContributionAmount('');
        fetchGoals();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Savings Envelopes</h2>
                    <p className="text-slate-500 text-sm">Visualize and reach your targets</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} /> New Goal
                </button>
            </div>

            {/* Create Goal Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-top-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl w-full"
                            placeholder="Goal Name (e.g. New Macbook)"
                            value={newGoal.name}
                            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                        <input
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl w-full"
                            type="number"
                            placeholder="Target Amount ($)"
                            value={newGoal.target_amount}
                            onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                        />
                        <button className="col-span-2 bg-slate-900 text-white py-3 rounded-xl font-bold">Create Envelope</button>
                    </div>
                </form>
            )}

            {/* Contribution Modal */}
            {contributeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Deposit Savings</h3>
                            <button onClick={() => setContributeModal(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        <p className="text-slate-500 mb-4 text-sm">Add funds to <strong>{contributeModal.name}</strong> envelope.</p>

                        <form onSubmit={handleContribute} className="space-y-4">
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    type="number"
                                    placeholder="0.00"
                                    autoFocus
                                    value={contributionAmount}
                                    onChange={e => setContributionAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
                                Confirm Deposit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const percent = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                    return (
                        <div key={goal.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-56 relative overflow-hidden group hover:border-indigo-200 transition-all">
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                                        <PiggyBank size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target</p>
                                        <p className="font-bold text-slate-900">${goal.target_amount}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mt-2">{goal.name}</h3>
                            </div>

                            <div className="relative z-10 w-full mt-auto space-y-3">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-indigo-600">${goal.current_amount} Saved</span>
                                    <span className="text-slate-400">{percent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <button
                                    onClick={() => setContributeModal(goal)}
                                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                                >
                                    + Deposit
                                </button>
                            </div>

                            <Target className="absolute -bottom-4 -right-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform" size={120} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SavingsGoals;
