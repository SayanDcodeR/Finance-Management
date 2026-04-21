const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin"></div>
    </div>
  </div>
);

export default LoadingSpinner;
