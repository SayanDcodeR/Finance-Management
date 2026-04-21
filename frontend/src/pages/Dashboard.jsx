import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/axios';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash, HiOutlineChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Income" value={formatCurrency(data?.totalIncome)} icon={HiOutlineTrendingUp} color="emerald" subtitle={`This month: ${formatCurrency(data?.monthlyIncome)}`} />
        <StatCard title="Total Expenses" value={formatCurrency(data?.totalExpenses)} icon={HiOutlineTrendingDown} color="red" subtitle={`This month: ${formatCurrency(data?.monthlyExpenses)}`} />
        <StatCard title="Net Balance" value={formatCurrency(data?.balance)} icon={HiOutlineCash} color="cyan" subtitle={`Monthly: ${formatCurrency(data?.monthlyBalance)}`} />
        <StatCard title="Monthly Savings" value={formatCurrency(data?.monthlyBalance)} icon={HiOutlineChartBar} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Transactions */}
        <div className="glass-card p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Recent Transactions</h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          
          {data?.recentTransactions?.length > 0 ? (
            <div className="space-y-3.5 flex-1">
              {data.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between pb-3.5 border-b border-white/[0.03] last:border-0 last:pb-0 hover:bg-white/[0.01] transition-colors p-2 -mx-2 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${t.type === 'INCOME' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      {t.type === 'INCOME'
                        ? <HiOutlineTrendingUp className="w-5 h-5 text-emerald-400" />
                        : <HiOutlineTrendingDown className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100 tracking-wide">{t.description || t.categoryName || t.type}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={`text-[15px] font-bold ${t.type === 'INCOME' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-red-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state flex-1">
              <HiOutlineCash className="empty-state-icon" />
              <p className="text-slate-400 text-sm font-medium">No transactions yet</p>
              <p className="text-slate-500 text-xs mt-1">Start by adding income or expenses.</p>
            </div>
          )}
        </div>

        {/* Budget Alerts & Goals */}
        <div className="space-y-6 lg:space-y-8 flex flex-col">
          {/* Budget Alerts */}
          <div className="glass-card p-6 md:p-8 flex-1">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200 mb-6">Budget Alerts</h3>
            {data?.budgetAlerts?.length > 0 ? (
              <div className="space-y-4">
                {data.budgetAlerts.map((b) => (
                  <div key={b.id} className="p-4 md:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] transition hover:bg-amber-500/10">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-bold text-slate-200 tracking-wide">{b.categoryName || 'General'}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">{b.percentageUsed?.toFixed(0)}% Used</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 shadow-inner overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%`, background: b.percentageUsed >= 100 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}>
                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2.5">
                      <p className="text-xs font-medium text-slate-400">Spent: <span className="text-slate-300">{formatCurrency(b.amountSpent)}</span></p>
                      <p className="text-xs font-medium text-slate-500">Limit: {formatCurrency(b.amountLimit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="text-emerald-400 text-sm font-semibold tracking-wide">No budget alerts — you're on track! 🎉</p>
              </div>
            )}
          </div>

          {/* Active Goals */}
          <div className="glass-card p-6 md:p-8 flex-1">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-6">Active Goals</h3>
            {data?.activeGoals?.length > 0 ? (
              <div className="space-y-4">
                {data.activeGoals.map((g) => (
                  <div key={g.id} className="p-4 md:p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition hover:bg-cyan-500/10">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-bold text-slate-200 tracking-wide">{g.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400">{g.progressPercentage?.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 shadow-inner overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${Math.min(g.progressPercentage, 100)}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}>
                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2.5">
                      <p className="text-xs font-medium text-slate-400">Saved: <span className="text-slate-300">{formatCurrency(g.currentAmount)}</span></p>
                      <p className="text-xs font-medium text-slate-500">Target: {formatCurrency(g.targetAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="text-slate-400 text-sm font-medium tracking-wide">No active goals set</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
