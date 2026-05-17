import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Creator Ledger',
  description: 'What we collect, how we use it, and what we don\'t do with it.',
}

const LAST_UPDATED = 'May 16, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 mb-10 text-sm text-amber-900">
          <p className="font-medium">Plain-English version while we&apos;re in beta.</p>
          <p className="mt-1">
            We&apos;ll replace this with a formal policy before going to public launch. The short
            version of how we handle your data is below.
          </p>
        </div>

        <Section title="1. What we collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account info</strong> — your email, name, and (if you use email signup) a hashed password.</li>
            <li><strong>The data you enter</strong> — revenue, expenses, deals, invoices, contracts.</li>
            <li><strong>Connected services</strong> — if you connect YouTube, we store an encrypted refresh token so we can sync your AdSense revenue.</li>
            <li><strong>Basic logs</strong> — request times, IP addresses (briefly), and error traces, used to keep the Service running.</li>
          </ul>
        </Section>

        <Section title="2. What we don&apos;t do">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We don&apos;t sell your data.</li>
            <li>We don&apos;t share your data with advertisers.</li>
            <li>We don&apos;t train AI models on your private information.</li>
            <li>We don&apos;t store your AdSense numbers anywhere other than your private Revenue tab.</li>
          </ul>
        </Section>

        <Section title="3. AI features">
          <p>
            When you use the contract analyzer, receipt OCR, or email-to-deal extractor, the content
            you submit is sent to Google&apos;s Gemini API for processing. Google&apos;s privacy terms apply
            to that processing. We send only what&apos;s needed to perform the analysis, we don&apos;t store
            the AI conversation, and we don&apos;t use it to train anything.
          </p>
        </Section>

        <Section title="4. Security">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Sensitive credentials (YouTube refresh tokens, Stripe keys) are encrypted at rest using AES-256-GCM.</li>
            <li>Passwords are hashed with bcrypt (cost 12). We never store plaintext passwords.</li>
            <li>All traffic is over HTTPS.</li>
            <li>The database is hosted on Supabase. Access is limited to the application.</li>
          </ul>
          <p>
            That said: we&apos;re a small beta product. We&apos;re not SOC 2 certified, and you should treat
            anything you put here with the level of trust you&apos;d give a small startup. If you wouldn&apos;t
            put it in a private Notion doc, don&apos;t put it here yet.
          </p>
        </Section>

        <Section title="5. Your rights">
          <p>
            You can delete your account from <Link href="/settings" className="text-primary hover:underline">Settings</Link> at any time. When you do, we delete your account and associated data within 30 days. If you want a copy of your data first, email the founder.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use one essential cookie: an HTTP-only session cookie that keeps you logged in. No
            tracking cookies, no analytics cookies, no third-party ad cookies.
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            If we change anything material about how we handle data, we&apos;ll email you. The &quot;last
            updated&quot; date at the top reflects the most recent change.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>Email the founder directly. The address is in the welcome email you received when you signed up.</p>
        </Section>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          See also: <Link href="/legal/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
