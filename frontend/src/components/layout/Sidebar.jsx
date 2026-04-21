import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineTag, HiOutlineCreditCard, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineFlag, HiOutlineRefresh, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const navItems = [
  { path: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/income', icon: HiOutlineTrendingUp, label: 'Income' },
  { path: '/expenses', icon: HiOutlineTrendingDown, label: 'Expenses' },
  { path: '/categories', icon: HiOutlineTag, label: 'Categories' },
  { path: '/budgets', icon: HiOutlineCreditCard, label: 'Budgets' },
  { path: '/transactions', icon: HiOutlineClipboardList, label: 'Transactions' },
  { path: '/goals', icon: HiOutlineFlag, label: 'Goals' },
  { path: '/recurring', icon: HiOutlineRefresh, label: 'Recurring' },
  { path: '/reports', icon: HiOutlineChartBar, label: 'Reports' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 z-40 flex flex-col transition-all duration-400 ease-in-out rounded-2xl ${
        collapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
      style={{ 
        background: 'rgba(15, 21, 34, 0.6)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(24px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Premium Logo Section */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-6 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-float"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <span className="text-white font-bold text-xl">₹</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col ml-1 animate-fade-in text-left">
            <span className="font-extrabold text-xl tracking-tight gradient-text leading-none">FinanceFlow</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1">Enterprise</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto no-scrollbar pb-6 space-y-1.5 pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? 'text-white bg-white/5 active-nav-item'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-md"></div>
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-emerald-400 scale-110' : 'group-hover:scale-110 group-hover:text-slate-300'}`} />
                {!collapsed && (
                  <span className="whitespace-nowrap z-10">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-14 mt-auto border-t border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.02] transition-colors rounded-b-2xl"
      >
        {collapsed ? <HiOutlineChevronRight className="w-5 h-5" /> : <HiOutlineChevronLeft className="w-5 h-5" />}
      </button>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .active-nav-item {
          box-shadow: inset 0 0 20px rgba(255,255,255,0.02);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
