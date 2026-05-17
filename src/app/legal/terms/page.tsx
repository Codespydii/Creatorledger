import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — Creator Ledger',
  description: 'Plain-English terms for using Creator Ledger during beta.',
}

const LAST_UPDATED = 'May 17, 2026'
const CONTACT_EMAIL = 'mahipalsinghrajput476@gmail.com'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 mb-10 text-sm text-amber-900">
          <p className="font-medium">Plain-English version while we&apos;re in beta.</p>
          <p className="mt-1">
            We&apos;ll replace this with a proper legal document before charging anyone. If you have questions, email the founder directly.
          </p>
        </div>

        <Section title="1. What this is">
          <p>
            Creator Ledger (&quot;the Service&quot;) is a financial dashboard for creators. You give us
            information about your business — revenue, expenses, deals, contracts — and we organize
            it, analyze it, and help you make sense of it.
          </p>
        </Section>

        <Section title="2. Your account, your data">
          <p>
            You own everything you put in. We don&apos;t sell your data, share it with advertisers, or
            train AI models on your private information. If you want your data out, ask and we&apos;ll
            export it. If you delete your account, we delete it within 30 days.
          </p>
        </Section>

        <Section title="3. Beta status">
          <p>
            The Service is in beta. That means: it&apos;s free, things may break, and features may
            change. We&apos;ll do our best to give you notice before any major change, especially anything that touches your
            stored data.
          </p>
        </Section>

        <Section title="4. Pricing (none yet)">
          <p>
            The Service is free during beta. When we introduce paid plans, we&apos;ll email you at least
            30 days before any charge. You can keep using your free account, downgrade, or export and
            leave — we&apos;ll never auto-bill you without telling you first.
          </p>
        </Section>

        <Section title="5. What you can&apos;t do">
          <p>Don&apos;t use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Break the law or help someone else break the law.</li>
            <li>Try to attack, reverse-engineer, or harm the Service or its other users.</li>
            <li>Upload illegal content or content you don&apos;t have the right to upload.</li>
          </ul>
        </Section>

        <Section title="6. AI features">
          <p>
            Some features (contract analyzer, receipt OCR, email-to-deal) use AI. AI makes mistakes.
            Treat its output as a smart-but-fallible assistant, not legal or accounting advice. Run
            anything important by a real lawyer or accountant.
          </p>
        </Section>

        <Section title="7. Liability">
          <p>
            We provide the Service &quot;as is.&quot; We&apos;re trying our best but we&apos;re a small team. To
            the extent the law allows, we&apos;re not liable for indirect or consequential damages from
            using the Service. If anything goes wrong, our maximum liability is whatever you&apos;ve paid us — which during beta is $0.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            We&apos;ll update these terms over time. When we do, we&apos;ll bump the &quot;last updated&quot; date
            and email you if the change is material.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Email the founder directly at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>. There is no support team or ticket system — your message comes straight to me.
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          See also: <Link href="/legal/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
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
