import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-950">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      </div>

      <Sidebar />
      <div className="flex-1 ml-[290px] flex flex-col transition-all duration-400 ease-in-out min-h-screen">
        <Navbar />
        <main className="flex-1 px-8 pb-10 w-full max-w-7xl relative z-10 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
