export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KayanLive Questionnaire",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "KayanLive",
      "url": "https://kayanlive.com",
      "logo": "https://questionnaire.kayanlive.com/kayan-logo-official.png",
      "description": "KayanLive specializes in creating extraordinary booths that captivate audiences at exhibitions worldwide.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "availableLanguage": ["en", "ar"]
      }
    },
    "about": {
      "@type": "Thing",
      "name": "Exhibition Booth Design",
      "description": "Professional booth design and construction services for trade shows and exhibitions"
    },
    "url": "https://questionnaire.kayanlive.com",
    "description": "Submit your booth and exhibition project requirements to KayanLive's expert team",
    "screenshot": "https://questionnaire.kayanlive.com/og-image.png"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}