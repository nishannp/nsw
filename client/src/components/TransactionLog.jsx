import React, { useEffect, useState, useRef } from 'react';
import { api, BASE_URL } from '../api';
import { ArrowUpRight, ArrowDownLeft, Filter, Upload, Plus, Search, Trash2, Edit2, X, AlertCircle, ShoppingCart, Car, Utensils, Briefcase, Gamepad2 } from 'lucide-react';

const TransactionLog = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTxns, setFilteredTxns] = useState([]);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBucket, setFilterBucket] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTxn, setEditingTxn] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewData, setReviewData] = useState([]);

    // Form State
    const [txnForm, setTxnForm] = useState({ category: '', amount: '', type: 'Expense', bucket: 'Spending' });
    const fileInputRef = useRef(null);

    const CATEGORY_ICONS = {
        'Groceries': <ShoppingCart size={20} />,
        'Food': <Utensils size={20} />,
        'Transport': <Car size={20} />,
        'Salary': <Briefcase size={20} />,
        'Income': <Briefcase size={20} />,
        'Entertainment': <Gamepad2 size={20} />
    };

    const fetchTxns = () => {
        api.get('transactions.php').then(data => {
            setTransactions(data);
        }).catch(console.error);
    };

    useEffect(() => {
        fetchTxns();
    }, []);

    // Filter & Search Logic
    useEffect(() => {
        let res = transactions;

        if (filterBucket !== 'All') {
            res = res.filter(t => t.bucket === filterBucket);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(t =>
                t.category.toLowerCase().includes(q) ||
                t.amount.toString().includes(q)
            );
        }

        setFilteredTxns(res);
    }, [transactions, filterBucket, searchQuery]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (editingTxn) {
            await api.put('transactions.php', { ...txnForm, id: editingTxn.id });
        } else {
            await api.post('transactions.php', txnForm);
        }
        closeForm();
        fetchTxns();
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await api.delete(`transactions.php?id=${id}`);
            fetchTxns();
        }
    };

    const openEdit = (txn) => {
        setTxnForm(txn);
        setEditingTxn(txn);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setTxnForm({ category: '', amount: '', type: 'Expense', bucket: 'Spending' });
        setEditingTxn(null);
        setIsFormOpen(false);
    };

    // CSV Handling (Use Backend Parser)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csv_file', file);

        try {
            const res = await fetch(`${BASE_URL}/parse_csv.php`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setReviewData(data);
                setIsReviewOpen(true);
            } else {
                alert('Failed to parse CSV');
            }
        } catch (error) {
            console.error('Parse failed:', error);
            alert('Parse failed');
        }
        e.target.value = null;
    };

    const confirmImport = async () => {
        const toImport = reviewData.filter(i => i.selected);
        for (const item of toImport) {
            const payload = {
                category: item.category,
                type: item.type,
                bucket: item.bucket,
                amount: item.amount,
                timestamp: item.date,
                running_balance: item.running_balance // Ensure we pass this too if we want to save it
            };
            await api.post('transactions.php', payload);
        }
        setIsReviewOpen(false);
        setReviewData([]);
        fetchTxns();
    };

    const groupTransactions = (txns) => {
        const groups = {};
        txns.forEach(t => {
            const date = new Date(t.timestamp).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(t);
        });
        return groups;
    };

    const groupedTxns = groupTransactions(filteredTxns);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Wallet Activity</h2>
                    <p className="text-slate-500 text-sm">Manage your expenses & income</p>
                </div>

                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
                    <button onClick={() => fileInputRef.current.click()} className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-50">
                        <Upload size={16} /> CBA Import
                    </button>
                    <button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                        <Plus size={16} /> Log Txn
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2">
                <div className="bg-slate-50 flex items-center px-3 rounded-lg flex-1">
                    <Search size={18} className="text-slate-400" />
                    <input
                        className="bg-transparent p-2 outline-none w-full text-sm"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-slate-50 border-none rounded-lg text-sm px-4 outline-none font-medium text-slate-600"
                    value={filterBucket}
                    onChange={e => setFilterBucket(e.target.value)}
                >
                    <option value="All">All Buckets</option>
                    <option value="Spending">Spending</option>
                    <option value="Income">Income</option>
                    <option value="College">College</option>
                    <option value="Savings">Savings</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-6">
                {Object.keys(groupedTxns).map(date => (
                    <div key={date}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{date}</h3>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {groupedTxns[date].map((txn, idx) => (
                                <div key={txn.id} className={`p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors ${idx !== groupedTxns[date].length - 1 ? 'border-b border-slate-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                            ${txn.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}
                                        `}>
                                            {CATEGORY_ICONS[txn.category] || (txn.type === 'Income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{txn.category}</p>
                                            <div className="flex gap-2 text-xs">
                                                <p className="text-slate-500 flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full 
                                                        ${txn.bucket === 'Income' ? 'bg-emerald-500' :
                                                            txn.bucket === 'College' ? 'bg-indigo-500' :
                                                                txn.bucket === 'Savings' ? 'bg-violet-500' : 'bg-slate-300'}
                                                    `}></span>
                                                    {txn.bucket}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`font-bold text-lg ${txn.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {txn.type === 'Income' ? '+' : '-'}${Number(txn.amount).toFixed(2)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(txn)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(txn.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* CSV Review Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Review Import</h3>
                            <button onClick={() => setIsReviewOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-900" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl relative">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 bg-white z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3">Import</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Bucket</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviewData.map((row, idx) => (
                                        <tr key={idx} className={`border-b border-slate-50 ${!row.selected ? 'opacity-50' : ''}`}>
                                            <td className="p-3">
                                                <input type="checkbox" checked={row.selected} onChange={e => {
                                                    const newData = [...reviewData];
                                                    newData[idx].selected = e.target.checked;
                                                    setReviewData(newData);
                                                }} />
                                            </td>
                                            <td className="p-3">{row.raw_date}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    className="bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-full"
                                                    value={row.category}
                                                    onChange={e => {
                                                        const newData = [...reviewData];
                                                        newData[idx].category = e.target.value;
                                                        setReviewData(newData);
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    className="bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-full"
                                                    value={row.bucket}
                                                    onChange={e => {
                                                        const newData = [...reviewData];
                                                        newData[idx].bucket = e.target.value;
                                                        setReviewData(newData);
                                                    }}
                                                >
                                                    <option value="Spending">Spending</option>
                                                    <option value="Income">Income</option>
                                                    <option value="College">College</option>
                                                    <option value="Savings">Savings</option>
                                                </select>
                                            </td>
                                            <td className={`p-3 text-right font-mono ${row.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {row.type === 'Income' ? '+' : '-'}${row.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setIsReviewOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button onClick={confirmImport} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">Confirm Import</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editingTxn ? 'Edit Transaction' : 'New Transaction'}</h3>
                            <button onClick={closeForm}><X size={20} className="text-slate-400 hover:text-slate-900" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                <input className="w-full p-3 bg-slate-50 rounded-xl" value={txnForm.category} onChange={e => setTxnForm({ ...txnForm, category: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                                    <input type="number" className="w-full p-3 bg-slate-50 rounded-xl" value={txnForm.amount} onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl" value={txnForm.type} onChange={e => setTxnForm({ ...txnForm, type: e.target.value })}>
                                        <option value="Expense">Expense</option>
                                        <option value="Income">Income</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Bucket</label>
                                <select className="w-full p-3 bg-slate-50 rounded-xl" value={txnForm.bucket} onChange={e => setTxnForm({ ...txnForm, bucket: e.target.value })}>
                                    <option value="Spending">Spending</option>
                                    <option value="Income">Income</option>
                                    <option value="College">College</option>
                                    <option value="Savings">Savings</option>
                                </select>
                            </div>
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionLog;
