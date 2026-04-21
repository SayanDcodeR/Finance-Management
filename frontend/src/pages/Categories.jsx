import { useState, useEffect } from 'react';
import { categoryAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', icon: '', color: '#10b981' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await categoryAPI.getAll(); setCategories(res.data.data); }
    catch (err) { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ name: '', type: 'EXPENSE', icon: '', color: '#10b981' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, type: item.type, icon: item.icon || '', color: item.color || '#10b981' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) { await categoryAPI.update(editItem.id, form); toast.success('Category updated!'); }
      else { await categoryAPI.create(form); toast.success('Category created!'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); toast.success('Category deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Categories</h1><p className="text-slate-400 text-sm mt-1">Organize your income and expense categories</p></div>
        <button onClick={openAdd} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Income Categories</h3>
          <div className="space-y-2">
            {incomeCategories.length > 0 ? incomeCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color || '#10b981' }}></div>
                  <span className="text-sm font-medium text-white">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )) : (
              <div className="empty-state m-4 py-8">
                <p className="text-slate-400 text-sm font-medium">No income categories</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Expense Categories</h3>
          <div className="space-y-2">
            {expenseCategories.length > 0 ? expenseCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color || '#ef4444' }}></div>
                  <span className="text-sm font-medium text-white">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )) : (
              <div className="empty-state m-4 py-8">
                <p className="text-slate-400 text-sm font-medium">No expense categories</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="form-label">Type *</label><select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></div>
          <div><label className="form-label">Color</label><input type="color" className="form-input h-12" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Create'}</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
