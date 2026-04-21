const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    emerald: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
    cyan: { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    purple: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" 
          style={{ 
            background: c.bg, 
            boxShadow: `0 0 15px ${c.glow}, inset 0 0 10px ${c.glow}40`,
            border: `1px solid ${c.glow}80` 
          }}
        >
          {Icon && <Icon className="w-5 h-5 drop-shadow-md" style={{ color: c.text }} />}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-400 mb-1 tracking-wide uppercase">{title}</p>
        <p className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">{value}</p>
        {subtitle && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.text, boxShadow: `0 0 5px ${c.text}` }}></div>
            <p className="text-xs font-semibold" style={{ color: c.text }}>{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
