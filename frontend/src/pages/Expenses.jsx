import { useState, useEffect } from 'react';
import { expenseAPI, categoryAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTrendingDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', date: '', description: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([expenseAPI.getAll(), categoryAPI.getByType('EXPENSE')]);
      setExpenses(expRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ title: item.title, amount: item.amount, date: item.date, description: item.description || '', categoryId: item.categoryId || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount), categoryId: form.categoryId ? parseInt(form.categoryId) : null };
    try {
      if (editItem) { await expenseAPI.update(editItem.id, payload); toast.success('Expense updated!'); }
      else { await expenseAPI.create(payload); toast.success('Expense added!'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await expenseAPI.delete(id); toast.success('Expense deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Expenses</h1><p className="text-slate-400 text-sm mt-1">Track and manage your spending</p></div>
        <button onClick={openAdd} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Add Expense</button>
      </div>

      <div className="glass-card overflow-hidden border border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {expenses.length > 0 ? expenses.map((item) => (
                <tr key={item.id} className="group/row">
                  <td className="font-semibold text-slate-200">{item.title}</td>
                  <td><span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold tracking-wide uppercase">{item.categoryName || '—'}</span></td>
                  <td>
                    <span className="text-red-400 font-bold bg-red-400/5 px-2.5 py-1 rounded-md">{formatCurrency(item.amount)}</span>
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
                      <HiOutlineTrendingDown className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-slate-300 font-medium tracking-wide">No expenses recorded yet</p>
                      <p className="text-slate-500 text-sm mt-1">Keep track of your spending by adding an expense.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="form-label">Amount *</label><input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="form-label">Date *</label><input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
          <div><label className="form-label">Category</label><select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Add'} Expense</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
