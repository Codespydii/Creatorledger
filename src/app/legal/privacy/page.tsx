import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Caelo',
  description: 'How Caelo collects, uses, protects, and shares your information.',
  alternates: { canonical: '/legal/privacy' },
}

const LAST_UPDATED = 'June 7, 2026'
const CONTACT_EMAIL = 'support@usecaelo.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 mb-10 text-sm text-foreground">
          <p className="font-medium">The short version.</p>
          <p className="mt-1 text-muted-foreground">
            Your financial data is yours. We do not sell it, we do not share it with advertisers, and
            we do not use it to train AI models. The full detail is below.
          </p>
        </div>

        <Section title="Introduction">
          <p>
            Caelo (&quot;Caelo,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is built and operated by a small team focused
            on giving creators clear, convenient tools to run the business side of their work. We take
            the privacy of your financial information seriously.
          </p>
          <p>
            This Privacy Policy explains what we collect, how we use it, who we share it with, and the
            rights and choices you have. It applies to the Caelo application and website at
            usecaelo.com (together, the &quot;Service&quot;). By using the Service, you agree to the practices
            described here.
          </p>
        </Section>

        <Section title="1. Information we collect">
          <p><strong>Information you provide</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account information</strong> — your name, email address, and, if you sign up with a password, a securely hashed password. If you sign in with Google, we receive your basic profile and email from Google.</li>
            <li><strong>Profile and business details</strong> — optional information you add, such as your channel name, platform, business address, tax identification number, website, and display currency.</li>
            <li><strong>The data you enter</strong> — the financial and business information you create in the Service, including revenue, expenses, brand deals, invoices, contracts, and media-kit content.</li>
            <li><strong>Communications</strong> — messages you send us, such as support or feedback emails.</li>
          </ul>
          <p className="pt-2"><strong>Information from connected services</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>YouTube / Google</strong> — if you connect your channel, we store an encrypted OAuth refresh token and sync channel statistics and AdSense revenue figures so we can populate your dashboard.</li>
            <li><strong>Stripe</strong> — if you connect Stripe, we store your API key in encrypted form so we can generate payment links on your invoices.</li>
          </ul>
          <p className="pt-2"><strong>Information collected automatically</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Log and usage data</strong> — such as IP address, browser and device type, pages viewed, and timestamps, used to operate, secure, and improve the Service.</li>
            <li><strong>Cookies</strong> — see the Cookies section below.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide, maintain, and operate the Service — including syncing revenue, generating invoices and reports, and powering the features you use.</li>
            <li>Run the AI features you choose to use (see below).</li>
            <li>Authenticate you, keep your account secure, and prevent fraud and abuse.</li>
            <li>Communicate with you — send transactional messages (such as verification, password resets, and account notices) and, where permitted, product updates you can opt out of.</li>
            <li>Understand and improve the Service, generally using aggregated or de-identified data.</li>
            <li>Comply with legal obligations and enforce our terms.</li>
          </ul>
        </Section>

        <Section title="3. AI features">
          <p>
            When you use the contract analyzer, receipt scanner, or email-to-deal extractor, the content
            you submit for that feature is sent to the Google Gemini API for processing. We send only
            what is needed to perform the analysis and return the result to you. We do not retain the AI
            request beyond producing the result you see and save, and your content is not used to train
            our models or, to our knowledge under the applicable API terms, Google&apos;s models. Google&apos;s
            processing is governed by its own terms.
          </p>
        </Section>

        <Section title="4. How we share information">
          <p>
            <strong>We do not sell your personal information.</strong> We share information only in the
            following limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Service providers (subprocessors)</strong> who help us run the Service under
              confidentiality and data-protection obligations:
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
                <li><strong>Supabase</strong> — database hosting.</li>
                <li><strong>Vercel</strong> — application hosting and performance monitoring.</li>
                <li><strong>Resend</strong> — transactional and product email.</li>
                <li><strong>Google</strong> — Gemini AI processing and YouTube data sync.</li>
                <li><strong>Stripe</strong> — payment-link generation, if you connect it.</li>
              </ul>
            </li>
            <li><strong>Legal and safety</strong> — when required by law, legal process, or to protect the rights, safety, and security of our users, the public, or Caelo.</li>
            <li><strong>Business transfers</strong> — if Caelo is involved in a merger, acquisition, or sale of assets, your information may transfer as part of that transaction. We will notify you of any change in ownership or use of your information.</li>
          </ul>
        </Section>

        <Section title="5. Data retention">
          <p>
            We keep your information for as long as your account is active. When you delete your account,
            we delete your account and associated personal data within 30 days, except where we must
            retain limited records to comply with legal obligations, resolve disputes, or enforce our
            agreements. Residual copies may persist in backups for a short period before being
            overwritten on a rolling basis.
          </p>
        </Section>

        <Section title="6. Security">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Sensitive credentials, such as YouTube refresh tokens and Stripe keys, are encrypted at rest using AES-256-GCM.</li>
            <li>Passwords are hashed with bcrypt (cost factor 12). We never store passwords in plain text.</li>
            <li>All traffic between you and the Service is encrypted in transit over HTTPS/TLS.</li>
            <li>Sessions use HTTP-only cookies; database access is restricted to the application under least-privilege principles.</li>
          </ul>
          <p>
            No method of transmission or storage is completely secure, and we cannot guarantee absolute
            security. We work continually to protect your information and to improve our safeguards.
          </p>
        </Section>

        <Section title="7. Your rights and choices">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Access and portability</strong> — you can export your data at any time from <Link href="/settings" className="text-primary hover:underline">Settings</Link>, or by contacting us.</li>
            <li><strong>Correction</strong> — you can edit your account and business information directly in the Service.</li>
            <li><strong>Deletion</strong> — you can permanently delete your account and its data from <Link href="/settings" className="text-primary hover:underline">Settings</Link>.</li>
            <li><strong>Communication preferences</strong> — you can opt out of non-essential emails using the unsubscribe link in those messages.</li>
          </ul>
          <p className="pt-2">
            <strong>EEA / UK users (GDPR).</strong> If you are in the European Economic Area or the United
            Kingdom, you have the right to access, rectify, erase, restrict, and port your personal data,
            and to object to certain processing. We process your data on the legal bases of performing our
            contract with you, our legitimate interests in operating and improving the Service, your
            consent (where applicable), and compliance with legal obligations. You may lodge a complaint
            with your local supervisory authority.
          </p>
          <p>
            <strong>California users (CCPA/CPRA).</strong> If you are a California resident, you have the
            right to know what personal information we collect, to request its deletion or correction, and
            to opt out of its &quot;sale&quot; or &quot;sharing.&quot; We do not sell or share your personal information,
            and we will not discriminate against you for exercising your rights.
          </p>
          <p>To exercise any of these rights, contact us at the address below.</p>
        </Section>

        <Section title="8. International data transfers">
          <p>
            We and our service providers may process and store your information in countries other than
            the one in which you live. Where information is transferred internationally, we rely on
            providers that maintain appropriate safeguards for that data.
          </p>
        </Section>

        <Section title="9. Children&apos;s privacy">
          <p>
            The Service is not directed to individuals under the age of 16, and we do not knowingly
            collect personal information from children. If you believe a child has provided us with
            personal information, please contact us and we will take appropriate steps to delete it.
          </p>
        </Section>

        <Section title="10. Cookies">
          <p>
            We use an essential, HTTP-only session cookie to keep you signed in. We do not use
            third-party advertising cookies. We may use privacy-respecting, aggregated analytics to
            understand overall usage and improve the Service.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. If we make a material change, we will
            update the &quot;last updated&quot; date above and notify you by email or within the Service.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            If you have questions about this Privacy Policy or how we handle your information, contact our
            team at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will be glad to help.
          </p>
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
