import { useState, useEffect } from 'react';
import { recurringAPI, categoryAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Recurring = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ type: 'EXPENSE', title: '', amount: '', frequency: 'MONTHLY', startDate: '', endDate: '', categoryId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [recRes, catRes] = await Promise.all([recurringAPI.getAll(), categoryAPI.getAll()]);
      setItems(recRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ type: 'EXPENSE', title: '', amount: '', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', categoryId: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ type: item.type, title: item.title, amount: item.amount, frequency: item.frequency, startDate: item.startDate || '', endDate: item.endDate || '', categoryId: item.categoryId || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount), categoryId: form.categoryId ? parseInt(form.categoryId) : null, endDate: form.endDate || null };
    try {
      if (editItem) { await recurringAPI.update(editItem.id, payload); toast.success('Updated!'); }
      else { await recurringAPI.create(payload); toast.success('Created!'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleToggle = async (id) => {
    try { await recurringAPI.toggle(id); toast.success('Status toggled!'); fetchData(); }
    catch (err) { toast.error('Toggle failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await recurringAPI.delete(id); toast.success('Deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Recurring Transactions</h1><p className="text-slate-400 text-sm mt-1">Manage automatic repeated entries</p></div>
        <button onClick={openAdd} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Add Recurring</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className={`glass-card p-6 md:p-8 flex flex-col group/card border transition-all ${!item.active ? 'opacity-50 grayscale border-white/[0.02]' : item.type === 'INCOME' ? 'border-emerald-500/10' : 'border-red-500/10'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${item.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <HiOutlineRefresh className={`w-5 h-5 ${item.active ? 'animate-spin-slow' : ''}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">{item.title}</h3>
                  <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${item.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{item.type}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-30 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight mb-4 ${item.type === 'INCOME' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}>{formatCurrency(item.amount)}</p>
            <div className="space-y-1.5 text-sm text-slate-400 font-medium flex-1">
               <div className="flex justify-between border-b border-white/[0.02] pb-1.5"><span className="text-slate-500">Frequency.</span> <span className="text-slate-300 font-bold tracking-wide">{item.frequency}</span></div>
               <div className="flex justify-between border-b border-white/[0.02] pb-1.5"><span className="text-slate-500">Category.</span> <span className="text-slate-300 bg-white/5 px-2 rounded-md font-bold tracking-wide text-xs">{item.categoryName || '—'}</span></div>
               {item.nextExecutionDate && <div className="flex justify-between pt-1"><span className="text-slate-500">Next Due.</span> <span className="text-cyan-400 font-bold">{formatDate(item.nextExecutionDate)}</span></div>}
            </div>
            <button onClick={() => handleToggle(item.id)} className={`mt-5 w-full text-sm font-bold py-2.5 rounded-lg transition-all ${item.active ? 'bg-slate-800/50 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}>
              {item.active ? 'Pause Tracking' : 'Resume Tracking'}
            </button>
          </div>
        )) : (
          <div className="col-span-full">
            <div className="empty-state">
               <HiOutlineRefresh className="w-12 h-12 text-slate-600 mb-3" />
               <p className="text-slate-300 font-medium tracking-wide">No recurring transactions</p>
               <p className="text-slate-500 text-sm mt-1">Automate your finances by setting up recurring items.</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Recurring' : 'Add Recurring'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></div>
          <div><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="form-label">Amount *</label><input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="form-label">Frequency</label><select className="form-input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Start Date *</label><input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div><label className="form-label">End Date</label><input type="date" className="form-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div><label className="form-label">Category</label><select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}</select></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Create'}</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Recurring;
