import { useAuth } from '../../hooks/useAuth';
import { HiOutlineLogout, HiOutlineUser, HiOutlineSearch, HiOutlineBell } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 w-full flex items-center justify-between px-8 mb-4">
      {/* Frosted Glass Background */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl border-b border-white/[0.05] -z-10" />

      {/* Left side: Context/Greeting */}
      <div className="animate-fade-in flex flex-col">
        <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">Overview Space</h2>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Welcome back, {user?.username || 'User'}
        </h1>
      </div>

      {/* Right side: Tools & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Quick Actions / Icons */}
        <div className="flex items-center gap-3 text-slate-400 hidden sm:flex">
          <button className="p-2 rounded-full hover:bg-white/5 hover:text-white transition cursor-pointer">
            <HiOutlineSearch className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 hover:text-white transition cursor-pointer relative">
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/[0.1] hidden sm:block"></div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-4 bg-slate-800/40 border border-white/[0.05] p-1.5 pr-4 rounded-full shadow-inner hover:bg-slate-800/60 transition cursor-pointer">
          <div className="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-90 group-hover:opacity-100 transition"></div>
            <HiOutlineUser className="w-4 h-4 text-white relative z-10" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white leading-tight">{user?.username || 'Account'}</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">{user?.email}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all shadow-sm group"
          title="Logout"
        >
          <HiOutlineLogout className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
