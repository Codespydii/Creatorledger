'use client'

function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; tone: string } {
  if (!pw) return { score: 0, label: '', tone: 'bg-muted' }

  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  // Common-password penalty
  const common = ['password', '12345678', 'qwerty', 'letmein', 'iloveyou', 'admin']
  if (common.some(c => pw.toLowerCase().includes(c))) score = Math.min(score, 1)

  if (pw.length < 8) return { score: 1, label: 'Too short', tone: 'bg-red-500' }

  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4
  const map = [
    { label: '', tone: 'bg-muted' },
    { label: 'Weak', tone: 'bg-red-500' },
    { label: 'OK', tone: 'bg-amber-500' },
    { label: 'Good', tone: 'bg-emerald-500' },
    { label: 'Strong', tone: 'bg-emerald-600' },
  ] as const
  return { score: clamped, ...map[clamped] }
}

interface Props {
  value: string
}

export function PasswordStrength({ value }: Props) {
  if (!value) {
    return (
      <p className="text-xs text-muted-foreground">
        Use 8+ characters. Longer is better — a passphrase like &quot;<span className="font-mono">violet-hummingbird-2026</span>&quot; beats <span className="font-mono">P@ss1!</span>.
      </p>
    )
  }

  const { score, label, tone } = scorePassword(value)
  const bars = [1, 2, 3, 4]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {bars.map(b => (
          <div
            key={b}
            className={`h-1 flex-1 rounded-full transition-colors ${b <= score ? tone : 'bg-muted'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score === 2 ? 'text-amber-600' :
          'text-emerald-600'
        }`}>{label}</span>
        <span className="text-xs text-muted-foreground">{value.length} chars</span>
      </div>
    </div>
  )
}
