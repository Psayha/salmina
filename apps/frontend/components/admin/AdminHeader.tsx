'use client';

export const AdminHeader = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 md:left-64"
      style={{
        paddingTop: 'var(--safe-top, env(safe-area-inset-top))',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center">
        {/* Admin Badge - centered like user MENU button */}
        <div className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg">
          <span className="text-xs font-medium tracking-wide">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-semibold">
              SALMINA
            </span>{' '}
            <span className="text-gray-800 dark:text-gray-200">ADMIN</span>
          </span>
        </div>
      </div>
    </header>
  );
};
