import { HiOutlineX } from 'react-icons/hi';
import { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setShow(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dynamic blurred backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>
      
      {/* Modal Content container */}
      <div
        className={`relative w-full max-w-lg glass-card p-8 max-h-[85vh] overflow-y-auto no-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-white/10 hover:rotate-90"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
