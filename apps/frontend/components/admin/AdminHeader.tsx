'use client';

import { Bell, Search } from 'lucide-react';

export const AdminHeader = () => {
  return (
    <header className="h-16 bg-white/50 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:bg-white transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-400 to-blue-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-700">
              AU
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
