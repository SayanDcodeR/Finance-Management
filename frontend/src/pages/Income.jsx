import { useState, useEffect } from 'react';
import { incomeAPI, categoryAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTrendingUp } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ source: '', amount: '', date: '', description: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [incRes, catRes] = await Promise.all([incomeAPI.getAll(), categoryAPI.getByType('INCOME')]);
      setIncomes(incRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ source: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ source: item.source, amount: item.amount, date: item.date, description: item.description || '', categoryId: item.categoryId || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount), categoryId: form.categoryId ? parseInt(form.categoryId) : null };
    try {
      if (editItem) { await incomeAPI.update(editItem.id, payload); toast.success('Income updated!'); }
      else { await incomeAPI.create(payload); toast.success('Income added!'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this income record?')) return;
    try { await incomeAPI.delete(id); toast.success('Income deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Income</h1><p className="text-slate-400 text-sm mt-1">Track your income sources</p></div>
        <button onClick={openAdd} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Add Income</button>
      </div>

      <div className="glass-card overflow-hidden border border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Source</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {incomes.length > 0 ? incomes.map((item) => (
                <tr key={item.id} className="group/row">
                  <td className="font-semibold text-slate-200">{item.source}</td>
                  <td><span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wide uppercase">{item.categoryName || '—'}</span></td>
                  <td>
                    <span className="text-emerald-400 font-bold bg-emerald-400/5 px-2.5 py-1 rounded-md">{formatCurrency(item.amount)}</span>
                  </td>
                  <td className="text-slate-400 text-sm">{formatDate(item.date)}</td>
                  <td className="text-slate-400 max-w-[200px] truncate text-sm">{item.description || '—'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-0">
                    <div className="empty-state m-8">
                      <HiOutlineTrendingUp className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-slate-300 font-medium tracking-wide">No income records found</p>
                      <p className="text-slate-500 text-sm mt-1">Add your first income source using the button above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Source *</label><input className="form-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required /></div>
          <div><label className="form-label">Amount *</label><input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="form-label">Date *</label><input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
          <div><label className="form-label">Category</label><select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Add'} Income</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Income;
