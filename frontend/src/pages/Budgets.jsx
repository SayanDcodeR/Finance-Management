import { useState, useEffect } from 'react';
import { budgetAPI, categoryAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../utils/formatters';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ amountLimit: '', month: getCurrentMonth(), year: getCurrentYear(), categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([budgetAPI.getAll(), categoryAPI.getByType('EXPENSE')]);
      setBudgets(budRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetAPI.create({ ...form, amountLimit: parseFloat(form.amountLimit), categoryId: form.categoryId ? parseInt(form.categoryId) : null });
      toast.success('Budget created!');
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create budget'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try { await budgetAPI.delete(id); toast.success('Budget deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Budgets</h1><p className="text-slate-400 text-sm mt-1">Set and track your spending limits</p></div>
        <button onClick={() => { setForm({ amountLimit: '', month: getCurrentMonth(), year: getCurrentYear(), categoryId: '' }); setModalOpen(true); }} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Set Budget</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {budgets.length > 0 ? budgets.map(b => (
          <div key={b.id} className={`glass-card p-6 md:p-8 flex flex-col group/card border ${b.percentageUsed >= 100 ? 'border-red-500/30 bg-red-500/5' : b.percentageUsed >= 80 ? 'border-amber-500/30' : 'border-white/[0.05]'}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 tracking-wide">{b.categoryName || 'General'}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">{new Date(0, b.month - 1).toLocaleString('en', { month: 'short' })} {b.year}</p>
              </div>
              <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg opacity-40 group-hover/card:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"><HiOutlineTrash className="w-4 h-4" /></button>
            </div>
            <div className="mb-4 flex-1">
              <div className="flex justify-between text-sm mb-2 font-bold tracking-wide">
                <span className="text-slate-400 uppercase text-xs">Used</span>
                <span className={`${b.percentageUsed >= 100 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : b.percentageUsed >= 80 ? 'text-amber-400' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}>{b.percentageUsed?.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 shadow-inner overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${Math.min(b.percentageUsed, 100)}%`, background: b.percentageUsed >= 100 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : b.percentageUsed >= 80 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #10b981, #06b6d4)' }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                  </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.05]">
              <div className="flex justify-between text-[13px] font-medium mb-1">
                <span className="text-slate-400">Spent: <span className="text-slate-200">{formatCurrency(b.amountSpent)}</span></span>
                <span className="text-slate-500">Limit: {formatCurrency(b.amountLimit)}</span>
              </div>
              <p className="text-[13px] font-bold" style={{ color: b.remaining >= 0 ? '#10b981' : '#ef4444' }}>
                {b.remaining >= 0 ? `${formatCurrency(b.remaining)} remaining` : `Over spent by ${formatCurrency(Math.abs(b.remaining))}`}
              </p>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <div className="empty-state">
              <p className="text-slate-300 font-medium tracking-wide">No active budgets</p>
              <p className="text-slate-500 text-sm mt-1">Take control of your spending by setting some budget limits.</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Budget Limit *</label><input type="number" step="0.01" className="form-input" value={form.amountLimit} onChange={(e) => setForm({ ...form, amountLimit: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Month</label><select className="form-input" value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>)}</select></div>
            <div><label className="form-label">Year</label><input type="number" className="form-input" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} /></div>
          </div>
          <div><label className="form-label">Category</label><select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">All Expenses</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">Create Budget</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
