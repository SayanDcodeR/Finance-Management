import { useState, useEffect } from 'react';
import { transactionAPI, categoryAPI } from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ page: 0, size: 10, type: '', categoryId: '', startDate: '', endDate: '', search: '' });

  useEffect(() => { categoryAPI.getAll().then(res => setCategories(res.data.data)).catch(() => {}); }, []);
  useEffect(() => { fetchTransactions(); }, [filters.page, filters.size]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, size: filters.size };
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!filters.search) { fetchTransactions(); return; }
    setLoading(true);
    try {
      const res = await transactionAPI.search(filters.search);
      setTransactions(res.data.data);
      setTotalPages(0);
    } catch (err) { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => { setFilters({ ...filters, page: 0 }); fetchTransactions(); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Transactions</h1><p className="text-slate-400 text-sm mt-1">Complete transaction history</p></div>

      {/* Filters */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="form-label">Search</label>
            <div className="relative">
              <input className="form-input pl-10" placeholder="Search transactions..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div><label className="form-label">Type</label><select className="form-input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">All</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></div>
          <div><label className="form-label">Category</label><select className="form-input" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}><option value="">All</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="form-label">From</label><input type="date" className="form-input" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} /></div>
          <div><label className="form-label">To</label><input type="date" className="form-input" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} /></div>
          <button onClick={applyFilters} className="btn-primary"><HiOutlineFilter className="w-4 h-4" /> Filter</button>
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-hidden border border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {transactions.length > 0 ? transactions.map(t => (
                  <tr key={t.id} className="group/row">
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${t.type === 'INCOME' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {t.type === 'INCOME' ? <HiOutlineTrendingUp className="w-3.5 h-3.5" /> : <HiOutlineTrendingDown className="w-3.5 h-3.5" />} {t.type}
                      </div>
                    </td>
                    <td className="font-semibold text-slate-200">{t.description || '—'}</td>
                    <td className="text-slate-400">{t.categoryName || '—'}</td>
                    <td className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                    <td className="text-slate-400 text-sm">{formatDate(t.date)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <div className="empty-state m-8">
                         <HiOutlineFilter className="w-12 h-12 text-slate-600 mb-3" />
                         <p className="text-slate-300 font-medium tracking-wide">No transactions found</p>
                         <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or date range.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={filters.page === 0} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-slate-400">Page {filters.page + 1} of {totalPages}</span>
          <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
