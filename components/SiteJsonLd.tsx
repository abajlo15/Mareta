const SITE_URL = "https://www.maretasunglasses.com/";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mareta Sunglasses",
  alternateName: ["Mareta", "maretasunglasses.com"],
  url: SITE_URL,
};

export default function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
    />
  );
}
