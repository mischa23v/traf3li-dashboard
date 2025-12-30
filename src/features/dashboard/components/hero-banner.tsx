import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, CheckSquare, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeroBannerProps } from '../types'
import { ROUTES } from '@/constants/routes'

export const HeroBanner = memo(function HeroBanner({
  t,
  greeting,
  userName,
}: HeroBannerProps) {
  return (
    <div className="bg-[#022c22] rounded-2xl p-6 relative overflow-hidden text-white shadow-lg">
      {/* Subtle Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(-45deg, #022c22, #064e3b, #022c22, #0f766e)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 20s ease infinite'
          }}
        />
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-wave.png"
          alt=""
          className="w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
      </div>

      {/* Subtle accent glow */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -me-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <CheckSquare className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {t('dashboard.hero.greeting', { greeting, name: userName })}
              </h1>
              <p className="text-sm text-white/60 mt-0.5">
                {t('dashboard.hero.welcomeMessage', 'Welcome to your dashboard')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 border-0 text-sm">
              <Link to={ROUTES.dashboard.cases.new}>
                <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                {t('dashboard.hero.newCase', 'New Case')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-semibold border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
              <Link to={ROUTES.dashboard.tasks.events.list}>
                <CalendarIcon className="ms-2 h-4 w-4" />
                {t('hero.calendar', 'Calendar')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
