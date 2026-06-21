// Small, reusable structured-data helpers + a render component. Centralising
// these keeps JSON-LD consistent across the marketing pages (pillar, comparison
// pages, blog) and machine-extractable for both Google rich results and answer
// engines (ChatGPT, Perplexity, Gemini).

const SITE_URL = 'https://usecaelo.com'

export interface FaqItem {
  q: string
  a: string
}

/** FAQPage schema from a list of question/answer pairs. */
export function faqPageSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

/** BreadcrumbList schema. `path` is the absolute site path, e.g. "/blog". */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

/** Renders one or more JSON-LD blocks. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
