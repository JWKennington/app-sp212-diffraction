import { NavLink } from 'react-router-dom';

const links = [
  { to: '/single-slit', label: 'Single Slit' },
  { to: '/circular-aperture', label: 'Circular Aperture' },
  { to: '/rayleigh', label: 'Rayleigh Criterion' },
  { to: '/comparison', label: 'Double vs. Single' },
  { to: '/sandbox', label: 'N-Slit Sandbox' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-usna-deep">
      {/* Nav bar */}
      <nav className="bg-usna-navy px-6 py-3 flex items-center gap-8 sticky top-0 z-50 shadow-lg">
        <h1 className="text-usna-gold font-semibold text-lg whitespace-nowrap tracking-tight">
          Optical Diffraction Explorer
        </h1>
        <div className="flex gap-1 overflow-x-auto">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-usna-gold border-b-2 border-usna-gold'
                    : 'text-usna-text hover:text-usna-gold-light'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-usna-muted text-xs py-4 border-t border-usna-grid">
        Built for SP212 &middot; USNA Physics Department &middot; J. Kennington
      </footer>
    </div>
  );
}
