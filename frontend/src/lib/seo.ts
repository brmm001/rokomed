export function updateSEOMetadata(title: string, description: string, jsonLdSchema?: object) {
  // Update document title
  document.title = `${title} — RokoMed`;

  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Update or inject JSON-LD structured data
  let scriptJsonLd = document.getElementById('rokomed-seo-jsonld') as HTMLScriptElement;
  if (jsonLdSchema) {
    if (!scriptJsonLd) {
      scriptJsonLd = document.createElement('script');
      scriptJsonLd.id = 'rokomed-seo-jsonld';
      scriptJsonLd.type = 'application/ld+json';
      document.head.appendChild(scriptJsonLd);
    }
    scriptJsonLd.textContent = JSON.stringify(jsonLdSchema);
  } else {
    // If no schema is provided, clear the previous script content
    if (scriptJsonLd) {
      scriptJsonLd.remove();
    }
  }
}
