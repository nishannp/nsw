import React from 'react';
import { LayoutDashboard, Wallet, PiggyBank, ArrowRightLeft, Menu, Bell } from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 fixed">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">FinanceFlow</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Overview</p>
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />

                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-8">Finance</p>
                    <NavItem
                        icon={<Wallet size={20} />}
                        label="College Roadmap"
                        active={activeTab === 'fees'}
                        onClick={() => setActiveTab('fees')}
                    />
                    <NavItem
                        icon={<ArrowRightLeft size={20} />}
                        label="Transactions"
                        active={activeTab === 'transactions'}
                        onClick={() => setActiveTab('transactions')}
                    />
                    <NavItem
                        icon={<PiggyBank size={20} />}
                        label="Savings Goals"
                        active={activeTab === 'savings'}
                        onClick={() => setActiveTab('savings')}
                    />
                </nav>

                <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <Bell size={16} />
                        </div>
                        <span className="text-sm font-semibold">Reminders</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Next installment due in 12 days. Keep saving!
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                    <span className="font-bold text-lg text-slate-900">FinanceFlow</span>
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                    <Bell size={24} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto md:p-8 p-4 pb-24 md:pb-8 animate-in fade-in duration-500">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-16">
                    <MobileNavItem
                        icon={<LayoutDashboard />}
                        label="Dash"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <MobileNavItem
                        icon={<Wallet />}
                        label="Fees"
                        active={activeTab === 'fees'}
                        onClick={() => setActiveTab('fees')}
                    />
                    <div className="w-12"></div> {/* Spacer for FAB */}
                    <MobileNavItem
                        icon={<ArrowRightLeft />}
                        label="Txns"
                        active={activeTab === 'transactions'}
                        onClick={() => setActiveTab('transactions')}
                    />
                    <MobileNavItem
                        icon={<PiggyBank />}
                        label="Goals"
                        active={activeTab === 'savings'}
                        onClick={() => setActiveTab('savings')}
                    />
                </div>

                {/* Floating Action Button (FAB) in center */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <ArrowRightLeft size={24} />
                    </button>
                </div>
            </nav>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <span className={`transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </span>
        {label}
    </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
        ${active ? 'text-indigo-600' : 'text-slate-400'}`}
    >
        {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default Layout;
