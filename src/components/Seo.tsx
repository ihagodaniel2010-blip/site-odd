import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

type SchemaInput = Record<string, unknown> | Array<Record<string, unknown>>;

type SeoProps = {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article";
  schema?: SchemaInput;
};

const ensureMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
};

const ensureLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
};

export const Seo = ({
  title,
  description,
  keywords,
  canonicalPath,
  image,
  type = "website",
  schema,
}: SeoProps) => {
  const location = useLocation();
  const keywordsContent = useMemo(() => (keywords?.length ? keywords.join(", ") : ""), [keywords]);
  const schemaContent = useMemo(() => (schema ? JSON.stringify(schema) : ""), [schema]);

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const canonicalUrl = `${siteUrl}${canonicalPath || location.pathname}`;
    const imageUrl = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : undefined;

    document.title = title;
    document.documentElement.lang = "en";

    ensureMeta('meta[name="description"]', { name: "description" }).content = description;
    ensureMeta('meta[name="author"]', { name: "author" }).content = "Paiva Cleaners Co.";
    ensureMeta('meta[name="robots"]', { name: "robots" }).content = "index, follow, max-image-preview:large";
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card" }).content = "summary_large_image";
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }).content = title;
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }).content = description;
    ensureMeta('meta[property="og:title"]', { property: "og:title" }).content = title;
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).content = description;
    ensureMeta('meta[property="og:type"]', { property: "og:type" }).content = type;
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).content = canonicalUrl;
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name" }).content = "Paiva Cleaners Co.";

    if (keywordsContent) {
      ensureMeta('meta[name="keywords"]', { name: "keywords" }).content = keywordsContent;
    }

    if (imageUrl) {
      ensureMeta('meta[property="og:image"]', { property: "og:image" }).content = imageUrl;
      ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" }).content = imageUrl;
    }

    ensureLink('link[rel="canonical"]', { rel: "canonical" }).href = canonicalUrl;

    if (schemaContent) {
      let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-schema="true"]');
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seoSchema = "true";
        document.head.appendChild(script);
      }
      script.textContent = schemaContent;
    }
  }, [canonicalPath, description, image, keywordsContent, location.pathname, schemaContent, title, type]);

  return null;
};