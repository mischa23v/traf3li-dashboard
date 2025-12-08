import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Bell, X } from 'lucide-react'

interface DynamicIslandProps {
    className?: string
}

export function DynamicIsland({ className }: DynamicIslandProps) {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div
            className={cn(
                'relative flex items-center justify-between transition-all duration-500 ease-spring',
                'h-12 min-w-[300px] rounded-full px-4',
                'bg-black/20 backdrop-blur-lg border border-white/10 shadow-xl',
                className
            )}
        >
            {/* Content */}
            <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-emerald-400" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center text-start">
                    <p className="text-[10px] font-bold text-slate-300 leading-tight uppercase tracking-wider">
                        {t('dynamicIsland.newMessage')}
                    </p>
                    <p className="text-sm font-bold text-white truncate leading-tight">
                        Sarah Al-Ahmad
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    aria-label={t('dynamicIsland.close', 'Close notification')}
                >
                    <X className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}
