import { cn } from '@/utils/cn'

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex gap-1 border-b border-slate-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
            active === tab.value ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {tab.icon && <tab.icon className="size-4" />}
          {tab.label}
          {active === tab.value && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
          )}
        </button>
      ))}
    </div>
  )
}
