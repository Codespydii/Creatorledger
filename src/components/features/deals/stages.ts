export const STAGES = [
  { id: 'prospect',    label: 'Prospect',    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200',     dot: 'bg-slate-400' },
  { id: 'outreach',    label: 'Outreach',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',         dot: 'bg-blue-400' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',     dot: 'bg-amber-400' },
  { id: 'contracted',  label: 'Contracted',  color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200', dot: 'bg-violet-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200', dot: 'bg-orange-400' },
  { id: 'completed',   label: 'Completed',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200', dot: 'bg-emerald-500' },
  { id: 'lost',        label: 'Lost',        color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',             dot: 'bg-red-400' },
] as const

export type StageId = typeof STAGES[number]['id']

export function getStage(id: string): typeof STAGES[number] {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export const TERMINAL_STAGES = ['completed', 'lost'] as const
