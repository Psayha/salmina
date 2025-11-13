'use client'

import { Header } from '@/components/Header'
import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        setHeaderColor?: (color: string) => void
        ready: () => void
        expand: () => void
      }
    }
  }
}

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      const setHeaderColor = tg.setHeaderColor
      if (setHeaderColor) {
        const handleScroll = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          
          if (scrollTop > 0) {
            // При прокрутке - скрываем статус бар
            setHeaderColor('#00000000') // Прозрачный цвет
          }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        return () => {
          window.removeEventListener('scroll', handleScroll)
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 pt-8 pb-20 relative z-10">
        {/* Categories Scroll */}
        <div className="mb-8 -mx-4 px-4">
          <div className="overflow-x-auto scrollbar-hide" style={{ padding: '16px 16px 16px 0', margin: '-16px -16px -16px 0' }}>
            <div className="flex gap-3 pl-4">
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Все товары
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Кремы
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Сыворотки
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Маски
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Тонеры
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Для глаз
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Очищение
            </button>
            <button className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-900 tracking-wide whitespace-nowrap shadow-lg hover:bg-white/50 transition-all duration-300">
              Уход за телом
            </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Product 1 */}
          <div className="group bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="w-full aspect-square bg-white/30 backdrop-blur-sm flex items-center justify-center border-b border-white/20 flex-shrink-0">
              <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">✨</span>
            </div>
            <div className="p-2.5 space-y-1 flex flex-col flex-grow">
              <h3 className="text-sm font-normal text-gray-900 tracking-wide uppercase">Крем для лица</h3>
              <p className="text-xs text-gray-700 font-light line-clamp-2 flex-grow">Увлажняющий крем для лица с глубоким проникновением, насыщает кожу влагой и создает защитный барьер от внешних воздействий окружающей среды</p>
                <div className="pt-1.5 flex items-center justify-between border-t border-white/30 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">1 500 ₽</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Добавить в корзину">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
            </div>
          </div>

          {/* Product 2 */}
          <div className="group bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="w-full aspect-square bg-white/30 backdrop-blur-sm flex items-center justify-center border-b border-white/20 flex-shrink-0">
              <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">🌸</span>
            </div>
            <div className="p-2.5 space-y-1 flex flex-col flex-grow">
              <h3 className="text-sm font-normal text-gray-900 tracking-wide uppercase">Сыворотка</h3>
              <p className="text-xs text-gray-700 font-light line-clamp-2 flex-grow">Омолаживающая</p>
                <div className="pt-1.5 flex items-center justify-between border-t border-white/30 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">2 300 ₽</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Добавить в корзину">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
            </div>
          </div>

          {/* Product 3 */}
          <div className="group bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="w-full aspect-square bg-white/30 backdrop-blur-sm flex items-center justify-center border-b border-white/20 flex-shrink-0">
              <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">💅</span>
            </div>
            <div className="p-2.5 space-y-1 flex flex-col flex-grow">
              <h3 className="text-sm font-normal text-gray-900 tracking-wide uppercase">Маска для лица</h3>
              <p className="text-xs text-gray-700 font-light line-clamp-2 flex-grow">Очищающая</p>
                <div className="pt-1.5 flex items-center justify-between border-t border-white/30 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">890 ₽</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Добавить в корзину">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
            </div>
          </div>

          {/* Product 4 */}
          <div className="group bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="w-full aspect-square bg-white/30 backdrop-blur-sm flex items-center justify-center border-b border-white/20 flex-shrink-0">
              <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">🧴</span>
            </div>
            <div className="p-2.5 space-y-1 flex flex-col flex-grow">
              <h3 className="text-sm font-normal text-gray-900 tracking-wide uppercase">Тонер</h3>
              <p className="text-xs text-gray-700 font-light line-clamp-2 flex-grow">Очищающий</p>
                <div className="pt-1.5 flex items-center justify-between border-t border-white/30 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">650 ₽</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Добавить в корзину">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/30 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-xs text-gray-700/70 font-light tracking-wider uppercase">
            © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
