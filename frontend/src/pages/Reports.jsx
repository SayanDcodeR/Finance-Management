import { useState, useEffect } from 'react';
import { reportAPI } from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, getCurrentYear } from '../utils/formatters';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(getCurrentYear());

  useEffect(() => { fetchReport(); }, [year]);

  const fetchReport = async () => {
    setLoading(true);
    try { const res = await reportAPI.getYearly(year); setReport(res.data.data); }
    catch (err) { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  // Chart data
  const trendData = {
    labels: report?.monthlyTrend?.map(m => m.month) || [],
    datasets: [
      { label: 'Income', data: report?.monthlyTrend?.map(m => m.income) || [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981' },
      { label: 'Expenses', data: report?.monthlyTrend?.map(m => m.expenses) || [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#ef4444' },
    ],
  };

  const barData = {
    labels: report?.monthlyTrend?.map(m => m.month) || [],
    datasets: [
      { label: 'Income', data: report?.monthlyTrend?.map(m => m.income) || [], backgroundColor: 'rgba(16, 185, 129, 0.7)', borderRadius: 6 },
      { label: 'Expenses', data: report?.monthlyTrend?.map(m => m.expenses) || [], backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: 6 },
    ],
  };

  const expenseCategories = report?.categoryWiseExpenses ? Object.entries(report.categoryWiseExpenses) : [];
  const doughnutData = {
    labels: expenseCategories.map(([k]) => k),
    datasets: [{ data: expenseCategories.map(([, v]) => v), backgroundColor: chartColors.slice(0, expenseCategories.length), borderWidth: 0, hoverOffset: 8 }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
    scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } } },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Financial Reports</h1><p className="text-slate-400 text-sm mt-1">Yearly overview and analytics</p></div>
        <select className="form-input w-32" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[...Array(5)].map((_, i) => { const y = getCurrentYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="glass-card p-6 md:p-8 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
           <div>
             <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">Total Income</p>
             <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">{formatCurrency(report?.totalIncome)}</p>
           </div>
        </div>
        <div className="glass-card p-6 md:p-8 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
           <div>
             <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">Total Expenses</p>
             <p className="text-3xl font-black text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">{formatCurrency(report?.totalExpenses)}</p>
           </div>
        </div>
        <div className="glass-card p-6 md:p-8 flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
           <div>
             <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">Net Savings</p>
             <p className={`text-3xl font-black ${report?.netSavings >= 0 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}>{formatCurrency(report?.netSavings)}</p>
           </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses Trend</h3>
          <div className="h-72"><Line data={trendData} options={chartOptions} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Comparison</h3>
          <div className="h-72"><Bar data={barData} options={chartOptions} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Expense Breakdown by Category</h3>
          <div className="h-72 flex items-center justify-center">
            {expenseCategories.length > 0 ? <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } } }} /> : <p className="text-slate-400 text-sm">No expense data for this period</p>}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category-wise Details</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {expenseCategories.length > 0 ? expenseCategories.sort((a, b) => b[1] - a[1]).map(([name, amount], i) => (
              <div key={name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: chartColors[i % chartColors.length] }}></div>
                  <span className="text-sm text-white">{name}</span>
                </div>
                <span className="text-sm font-semibold text-red-400">{formatCurrency(amount)}</span>
              </div>
            )) : <p className="text-slate-400 text-sm text-center py-8">No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
