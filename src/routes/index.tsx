import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import bodyHtml from "../adsimple/body.html?raw";
import { initAdsimple } from "../adsimple/script";
import "../adsimple/style.css";

const TITLE = "AD Simple — Performance Marketing for Dutch Businesses";
const DESC =
  "AD Simple runs Google Ads, Meta Ads, content production and AI-powered creative for Dutch SMEs — performance marketing priced from €299/month, no lock-in.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const cleanup = initAdsimple();
    return cleanup;
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
