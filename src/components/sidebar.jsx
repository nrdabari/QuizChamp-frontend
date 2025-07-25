import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

import routes from '../routes';

export default function Sidebar() {
  const location = useLocation();



  return (
    <div className="w-64 bg-purple-800 text-white flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-6 bg-purple-900">
        <h1 className="text-xl font-bold">Olympiad App</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 px-4">
        <div className="space-y-2">
          {routes
            .filter((route) => route.sideBarVisible)
            .map((route) => {
              const Icon = route.icon;
              const fullPath = `${route.layout}/${route.path}`;
              const isActive = location.pathname === fullPath;

              return (
                <Link
                  key={route.name}
                  to={fullPath}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-700 text-white'
                      : 'text-purple-100 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{route.name}</span>
                </Link>
              );
            })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 bg-purple-900">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">Nikita Dabari</p>
            <p className="text-xs text-purple-200">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
