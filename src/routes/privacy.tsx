import { createFileRoute } from "@tanstack/react-router";
import legalHtml from "../adsimple/legal.html?raw";
import "../adsimple/style.css";

const TITLE = "Privacy Policy — AD Simple";
const DESC =
  "How AD Simple collects, uses and protects your personal data, and your rights under the GDPR.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { name: "twitter:card", content: "summary" },
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
  component: Privacy,
});

function Privacy() {
  return <div dangerouslySetInnerHTML={{ __html: legalHtml }} />;
}
