import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, CheckCircle2, DollarSign, Calendar, X } from 'lucide-react';

const FeeLedger = () => {
    const [fees, setFees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newFee, setNewFee] = useState({ term_name: '', amount_due: '', due_date: '' });

    // Contribution State
    const [contributeModal, setContributeModal] = useState(null); // The fee object being contributed to
    const [contributionAmount, setContributionAmount] = useState('');

    const fetchFees = () => {
        api.get('college_fees.php').then(setFees).catch(console.error);
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('college_fees.php', newFee);
        setShowForm(false);
        setNewFee({ term_name: '', amount_due: '', due_date: '' });
        fetchFees();
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!contributeModal) return;

        // Create a transaction linked to this fee
        const txn = {
            category: `Contribution to ${contributeModal.term_name}`,
            amount: contributionAmount,
            type: 'Expense',
            bucket: 'College',
            linked_fee_id: contributeModal.id
        };

        await api.post('transactions.php', txn);
        setContributeModal(null);
        setContributionAmount('');
        fetchFees();
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Installment Roadmap</h2>
                    <p className="text-slate-500 text-sm">Track your college fee milestones</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                >
                    <Plus size={18} /> Add Fee
                </button>
            </div>

            {/* New Fee Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-in slide-in-from-top-4 space-y-4">
                    {/* ... (Existing Form Inputs) ... */}
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Term Name</label>
                            <input
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Semester 2 - 2024"
                                value={newFee.term_name}
                                onChange={e => setNewFee({ ...newFee, term_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount Due</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    <input
                                        className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl"
                                        type="number"
                                        placeholder="0.00"
                                        value={newFee.amount_due}
                                        onChange={e => setNewFee({ ...newFee, amount_due: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    type="date"
                                    value={newFee.due_date}
                                    onChange={e => setNewFee({ ...newFee, due_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-medium mt-2">
                            Save to Roadmap
                        </button>
                    </div>
                </form>
            )}

            {/* Contribution Modal */}
            {contributeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Add Funds</h3>
                            <button onClick={() => setContributeModal(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        <p className="text-slate-500 mb-4 text-sm">Contribute to <strong>{contributeModal.term_name}</strong>. This will be recorded as an expense.</p>

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
                                Confirm Contribution
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Timeline List */}
            <div className="relative space-y-8 pl-4 before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 before:content-['']">
                {fees.map((fee) => {
                    const percent = Math.min((fee.amount_saved / fee.amount_due) * 100, 100);
                    const isPaid = fee.status === 'Paid' || fee.status === 'Funded';

                    return (
                        <div key={fee.id} className="relative pl-8">
                            {/* Dot */}
                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                                ${isPaid ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 border-indigo-100 ring-4 ring-indigo-50'}
                            `}>
                                {isPaid ? <CheckCircle2 size={16} /> : <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{fee.term_name}</h3>
                                        <div className="flex items-center text-slate-500 text-sm mt-1 gap-2">
                                            <Calendar size={14} />
                                            <span>Due {new Date(fee.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {!isPaid && (
                                        <button
                                            onClick={() => setContributeModal(fee)}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            + Add Funds
                                        </button>
                                    )}
                                    {isPaid && (
                                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            {fee.status}
                                        </div>
                                    )}
                                </div>

                                {/* Progress Stats */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-slate-500">
                                            Saved: <span className="text-slate-900">${fee.amount_saved}</span>
                                        </span>
                                        <span className="text-slate-900">${fee.amount_due}</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${isPaid ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeeLedger;
