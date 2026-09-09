import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserBadge from './features/UserBadge';
import Button from './ui/Button';
import { QueueIcon, TargetIcon, LeaderboardIcon } from './ui/Icons';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-cyber-darker border-b border-gray-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAdmin ? "/admin" : "/"} 
            className="flex items-center gap-3 group"
          >
            <img src="/icons8-bug-100.svg" alt="Bug-Bang Logo" className="w-9 h-9" />
            <span className="text-white text-lg font-bold tracking-tight group-hover:text-cyber-green transition-colors">
              Bug-Bang
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <NavLink to="/admin" icon={<QueueIcon className="w-4 h-4" />}>Reports Queue</NavLink>
                <NavLink to="/admin/programs" icon={<TargetIcon className="w-4 h-4" />}>Programs</NavLink>
                <NavLink to="/admin/leaderboard" icon={<LeaderboardIcon className="w-4 h-4" />}>Leaderboard</NavLink>
              </>
            ) : isAuthenticated ? (
              <>
                <NavLink to="/">Programs</NavLink>
                <NavLink to="/submit">Submit Bug</NavLink>
                <NavLink to="/my-submissions">My Reports</NavLink>
                <NavLink to="/leaderboard">Leaderboard</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/">Programs</NavLink>
                <NavLink to="/leaderboard">Leaderboard</NavLink>
              </>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <UserBadge username={user?.username} points={user?.points} />
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={handleLogout}
                  className="shadow-lg"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                <Link 
                  to="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-cyber-green text-cyber-darker font-bold rounded-lg hover:bg-green-400 transition-all shadow-lg hover:shadow-cyber-green/50 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <MobileNavLink to="/admin" icon={<QueueIcon className="w-5 h-5" />}>Reports Queue</MobileNavLink>
                  <MobileNavLink to="/admin/programs" icon={<TargetIcon className="w-5 h-5" />}>Programs</MobileNavLink>
                  <MobileNavLink to="/admin/leaderboard" icon={<LeaderboardIcon className="w-5 h-5" />}>Leaderboard</MobileNavLink>
                </>
              ) : isAuthenticated ? (
                <>
                  <MobileNavLink to="/">Programs</MobileNavLink>
                  <MobileNavLink to="/submit">Submit Bug</MobileNavLink>
                  <MobileNavLink to="/my-submissions">My Reports</MobileNavLink>
                  <MobileNavLink to="/leaderboard">Leaderboard</MobileNavLink>
                </>
              ) : (
                <>
                  <MobileNavLink to="/">Programs</MobileNavLink>
                  <MobileNavLink to="/leaderboard">Leaderboard</MobileNavLink>
                </>
              )}
              
              {isAuthenticated ? (
                <div className="pt-3 mt-3 border-t border-gray-800">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-3 mt-3 border-t border-gray-800 flex gap-2">
                  <Link 
                    to="/login"
                    className="flex-1 text-center px-4 py-2 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex-1 text-center px-4 py-2 bg-cyber-green text-cyber-darker font-bold rounded-lg text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Desktop nav link component
const NavLink = ({ to, children, icon }) => (
  <Link 
    to={to}
    className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </Link>
);

// Mobile nav link component
const MobileNavLink = ({ to, children, icon }) => (
  <Link 
    to={to}
    className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </Link>
);

export default Navbar;