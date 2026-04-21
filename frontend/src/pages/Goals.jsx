import { useState, useEffect } from 'react';
import { goalAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', startDate: '', targetDate: '' });
  const [progressAmount, setProgressAmount] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await goalAPI.getAll(); setGoals(res.data.data); }
    catch (err) { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ name: '', targetAmount: '', currentAmount: '0', startDate: new Date().toISOString().split('T')[0], targetDate: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, targetAmount: item.targetAmount, currentAmount: item.currentAmount, startDate: item.startDate || '', targetDate: item.targetDate || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount || 0) };
    try {
      if (editItem) { await goalAPI.update(editItem.id, payload); toast.success('Goal updated!'); }
      else { await goalAPI.create(payload); toast.success('Goal created!'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleProgress = async () => {
    try { await goalAPI.updateProgress(progressModal.id, parseFloat(progressAmount)); toast.success('Progress updated!'); setProgressModal(null); fetchData(); }
    catch (err) { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await goalAPI.delete(id); toast.success('Goal deleted!'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Financial Goals</h1><p className="text-slate-400 text-sm mt-1">Track your savings targets</p></div>
        <button onClick={openAdd} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> New Goal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {goals.length > 0 ? goals.map(g => (
          <div key={g.id} className="glass-card p-6 md:p-8 flex flex-col group/card border border-white/[0.05]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 tracking-wide">{g.name}</h3>
                <div className="mt-1.5">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${g.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : g.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>{g.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-40 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => openEdit(g)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(g.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="mb-4 flex-1">
              <div className="flex justify-between text-sm mb-2 font-bold tracking-wide">
                <span className="text-slate-400">{formatCurrency(g.currentAmount)}</span>
                <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{g.progressPercentage?.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 shadow-inner overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min(g.progressPercentage, 100)}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}>
                   <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                </div>
              </div>
              <p className="text-right text-[13px] font-semibold text-slate-500 mt-2">Target: {formatCurrency(g.targetAmount)}</p>
            </div>
            {g.targetDate && <p className="text-[13px] text-slate-400 font-medium">Deadline: <span className="text-slate-300">{formatDate(g.targetDate)}</span></p>}
            {g.status === 'IN_PROGRESS' && (
              <button onClick={() => { setProgressModal(g); setProgressAmount(g.currentAmount); }} className="mt-5 w-full btn-secondary text-sm text-center justify-center font-bold">Update Progress</button>
            )}
          </div>
        )) : (
          <div className="col-span-full">
            <div className="empty-state">
              <p className="text-slate-300 font-medium tracking-wide">No financial goals set</p>
              <p className="text-slate-500 text-sm mt-1">Start saving by creating a new goal.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Goal Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="form-label">Target Amount *</label><input type="number" step="0.01" className="form-input" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required /></div>
          <div><label className="form-label">Current Amount</label><input type="number" step="0.01" className="form-input" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="form-label">Target Date</label><input type="date" className="form-input" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1 justify-center">{editItem ? 'Update' : 'Create'}</button><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </Modal>

      {/* Progress Modal */}
      <Modal isOpen={!!progressModal} onClose={() => setProgressModal(null)} title="Update Progress">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Update the current saved amount for <strong className="text-white">{progressModal?.name}</strong></p>
          <div><label className="form-label">Current Amount</label><input type="number" step="0.01" className="form-input" value={progressAmount} onChange={(e) => setProgressAmount(e.target.value)} /></div>
          <div className="flex gap-3"><button onClick={handleProgress} className="btn-primary flex-1 justify-center">Save</button><button onClick={() => setProgressModal(null)} className="btn-secondary flex-1">Cancel</button></div>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;
