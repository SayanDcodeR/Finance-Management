import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
    <div className="text-center animate-fade-in">
      <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
      <p className="text-xl text-slate-400 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">Back to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;
