export const Header = () => {
  return (
    <header className="w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-widest uppercase shadow-lg hover:bg-white/50 hover:shadow-xl transition-all duration-300">
              Menu
            </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-full border border-white/30 shadow-lg hover:bg-white/50 hover:shadow-xl transition-all duration-300" aria-label="Корзина">
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};
