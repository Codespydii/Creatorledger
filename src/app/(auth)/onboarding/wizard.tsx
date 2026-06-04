'use client'

import { useActionState, useState } from 'react'
import {
  Video, Camera, Music2, Gamepad2, Mic, FileText, MessageCircle, Globe, Sparkles,
  TrendingUp, BarChart2, Calendar, Wallet, Boxes, HelpCircle,
} from 'lucide-react'
import { completeOnboarding } from '@/app/actions/onboarding'
import { Button } from '@/components/ui/button'

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', Icon: Video },
  { value: 'instagram', label: 'Instagram', Icon: Camera },
  { value: 'tiktok', label: 'TikTok', Icon: Music2 },
  { value: 'twitch', label: 'Twitch', Icon: Gamepad2 },
  { value: 'podcasts', label: 'Podcasts', Icon: Mic },
  { value: 'substack', label: 'Substack', Icon: FileText },
  { value: 'twitter', label: 'X / Twitter', Icon: MessageCircle },
  { value: 'multi', label: 'A mix', Icon: Sparkles },
  { value: 'other', label: 'Other', Icon: Globe },
] as const

const TIERS = [
  { value: 'just_starting', label: 'Just starting' },
  { value: 'under_10k', label: 'Under 10K' },
  { value: '10k_to_100k', label: '10K – 100K' },
  { value: '100k_to_1m', label: '100K – 1M' },
  { value: '1m_plus', label: '1M+' },
] as const

const PAINS = [
  { value: 'sponsorships', label: 'Tracking sponsorships', sub: 'Deals slip through cracks', Icon: TrendingUp },
  { value: 'rates', label: 'Knowing what to charge', sub: 'I undersell every time', Icon: BarChart2 },
  { value: 'taxes', label: 'Tax season chaos', sub: 'Where did my receipts go?', Icon: Calendar },
  { value: 'cashflow', label: 'Cash flow stress', sub: 'When will the next dollar land?', Icon: Wallet },
  { value: 'organize', label: 'Just want to get organized', sub: 'Spreadsheets aren\'t cutting it', Icon: Boxes },
  { value: 'other', label: 'Something else', sub: 'I\'ll tell you later', Icon: HelpCircle },
] as const

interface Props {
  userName: string
}

export function OnboardingWizard({ userName }: Props) {
  const [state, action, pending] = useActionState(completeOnboarding, undefined)
  const [platform, setPlatform] = useState('')
  const [tier, setTier] = useState('')
  const [pain, setPain] = useState('')
  const firstName = userName.split(' ')[0]

  return (
    <div className="min-h-screen bg-muted px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/caelo-logo.png" alt="Caelo" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Hey {firstName} 👋</h1>
          <p className="text-base text-muted-foreground mt-2">
            Three quick questions so we can tailor your dashboard. <span className="block sm:inline mt-1 sm:mt-0">60 seconds, all optional.</span>
          </p>
        </div>

        <form action={action} className="space-y-6">
          {state && !state.success && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
              {state.error}
            </div>
          )}

          {/* Question 1: Platform */}
          <Card>
            <Label num={1} title="What's your main platform?" />
            <input type="hidden" name="primaryPlatform" value={platform} />
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {PLATFORMS.map(({ value, label, Icon }) => (
                <PillButton
                  key={value}
                  selected={platform === value}
                  onClick={() => setPlatform(platform === value ? '' : value)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </PillButton>
              ))}
            </div>
          </Card>

          {/* Question 2: Audience tier */}
          <Card>
            <Label num={2} title="How big is your audience?" />
            <input type="hidden" name="audienceTier" value={tier} />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TIERS.map(({ value, label }) => (
                <PillButton
                  key={value}
                  selected={tier === value}
                  onClick={() => setTier(tier === value ? '' : value)}
                >
                  <span>{label}</span>
                </PillButton>
              ))}
            </div>
          </Card>

          {/* Question 3: Biggest pain */}
          <Card>
            <Label num={3} title="What's your biggest headache right now?" />
            <input type="hidden" name="primaryPain" value={pain} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAINS.map(({ value, label, sub, Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPain(pain === value ? '' : value)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    pain === value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border bg-card hover:border-foreground/20'
                  }`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${pain === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${pain === value ? 'text-foreground' : 'text-foreground'}`}>{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:opacity-50"
              disabled={pending}
              name="_skip"
              value="1"
            >
              Skip — set up later
            </button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Continue to dashboard'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">{children}</div>
  )
}

function Label({ num, title }: { num: number; title: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
          {num}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
    </div>
  )
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition-all ${
        selected
          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30 font-medium'
          : 'border-border bg-card text-foreground hover:border-foreground/20'
      }`}
    >
      {children}
    </button>
  )
}
