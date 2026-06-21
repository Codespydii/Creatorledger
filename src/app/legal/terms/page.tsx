import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — Caelo',
  description: 'The terms that govern your use of Caelo.',
  alternates: { canonical: '/legal/terms' },
}

const LAST_UPDATED = 'June 7, 2026'
const CONTACT_EMAIL = 'support@usecaelo.com'
// Set this to the jurisdiction where Caelo is legally based. Confirm with counsel.
const GOVERNING_LAW = 'India'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 mb-10 text-sm text-foreground">
          <p className="font-medium">In short.</p>
          <p className="mt-1 text-muted-foreground">
            You own your data. We provide the Service as described, we will give you notice before any
            material change, and we will never charge you without telling you first. The full terms are
            below.
          </p>
        </div>

        <Section title="1. Agreement to these terms">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Caelo application
            and website at usecaelo.com (the &quot;Service&quot;), operated by a small team (&quot;Caelo,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). By creating an account or using the Service, you agree to these Terms. If
            you do not agree, please do not use the Service.
          </p>
        </Section>

        <Section title="2. Who can use Caelo">
          <p>
            You must be at least 16 years old and able to form a binding contract to use the Service. You
            are responsible for the information you provide, for keeping your login credentials secure,
            and for all activity that occurs under your account. Please notify us promptly if you suspect
            any unauthorized use of your account.
          </p>
        </Section>

        <Section title="3. Your content and data">
          <p>
            Caelo is a financial dashboard for creators. You provide information about your business —
            such as revenue, expenses, deals, invoices, and contracts — and we organize, analyze, and
            help you make sense of it.
          </p>
          <p>
            You retain all ownership of the content and data you submit. You grant us a limited license
            to host, store, process, and display that content solely for the purpose of operating and
            providing the Service to you. You are responsible for ensuring you have the rights to the
            content you upload and that it does not violate any law or third-party right.
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Break the law, or help anyone else break the law.</li>
            <li>Attack, disrupt, reverse-engineer, or attempt to gain unauthorized access to the Service, its systems, or other users.</li>
            <li>Upload unlawful content, malware, or content you do not have the right to upload.</li>
            <li>Misrepresent your identity or use the Service to defraud others.</li>
          </ul>
        </Section>

        <Section title="5. Beta services">
          <p>
            Parts of the Service are offered on a beta basis. This means features may change, be added,
            or be removed, and occasional issues may occur. We will make reasonable efforts to give you
            advance notice of material changes, particularly any change that affects your stored data.
          </p>
        </Section>

        <Section title="6. Plans, pricing, and billing">
          <p>
            The Service is free during the beta period. When we introduce paid plans, we will notify you
            at least 30 days before any charge applies. We will never automatically bill you without
            telling you first — you can upgrade, continue on an available plan, or export your data and
            leave.
          </p>
          <p className="mt-3">
            <strong>Founding-member rate.</strong> If you join during the beta as one of the first 50
            creators, you lock in the founding rate of $9 per month for the Pro plan once it launches —
            approximately half off the standard Pro price — for as long as your subscription remains
            active and continuous. If you cancel or let the subscription lapse, the founding rate ends and
            standard pricing applies should you resubscribe. The founding rate covers the Pro plan as it
            exists at launch; genuinely new, separately-priced add-ons are not included.
          </p>
          <p className="mt-3">
            Paid plans, when available, will be processed through a third-party payment processor, and
            prices are exclusive of any applicable taxes unless stated otherwise.
          </p>
        </Section>

        <Section title="7. AI features">
          <p>
            Some features — including the contract analyzer, receipt scanner, and email-to-deal extractor
            — use artificial intelligence. AI can make mistakes. Its output is provided to assist you and
            does not constitute legal, accounting, tax, or financial advice. You should review anything
            important with a qualified professional before relying on it.
          </p>
        </Section>

        <Section title="8. Third-party services">
          <p>
            The Service integrates with third-party services such as Google/YouTube and Stripe. Your use
            of those services is subject to their own terms and privacy policies. We are not responsible
            for the practices, availability, or content of third-party services.
          </p>
        </Section>

        <Section title="9. Intellectual property">
          <p>
            The Service, including its software, design, and the Caelo name and logo, is owned by Caelo
            and protected by intellectual-property laws. We grant you a limited, non-exclusive,
            non-transferable right to use the Service in accordance with these Terms. These Terms do not
            grant you any right to our trademarks or branding.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            You may stop using the Service and delete your account at any time from{' '}
            <Link href="/settings" className="text-primary hover:underline">Settings</Link>. We may suspend
            or terminate your access if you violate these Terms or use the Service in a way that may cause
            harm to us or others. Following termination, you will have a reasonable opportunity to export
            your data before it is deleted as described in our{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="11. Disclaimers">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
            whether express or implied, including any implied warranties of merchantability, fitness for a
            particular purpose, and non-infringement. We do not warrant that the Service will be
            uninterrupted, error-free, or completely secure.
          </p>
        </Section>

        <Section title="12. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Caelo and its team will not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or for any loss of
            profits, revenue, data, or goodwill arising from your use of the Service. Our total liability
            for any claim relating to the Service will not exceed the greater of the amount you paid us in
            the twelve months before the claim or, during the free beta period, zero.
          </p>
        </Section>

        <Section title="13. Indemnification">
          <p>
            You agree to indemnify and hold harmless Caelo and its team from any claims, damages, or
            expenses arising out of your misuse of the Service, your content, or your violation of these
            Terms or any law or third-party right.
          </p>
        </Section>

        <Section title="14. Governing law and disputes">
          <p>
            These Terms are governed by the laws of {GOVERNING_LAW}, without regard to its conflict-of-laws
            principles. Before bringing any formal claim, you agree to first contact us so we can try to
            resolve the matter informally. Any disputes that cannot be resolved this way will be subject
            to the exclusive jurisdiction of the competent courts located in {GOVERNING_LAW}.
          </p>
        </Section>

        <Section title="15. Changes to these terms">
          <p>
            We may update these Terms from time to time. When we do, we will update the &quot;last updated&quot;
            date above and, if the change is material, notify you by email or within the Service. Your
            continued use of the Service after a change takes effect constitutes acceptance of the updated
            Terms.
          </p>
        </Section>

        <Section title="16. Contact us">
          <p>
            Questions about these Terms? Contact our team at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>.
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
