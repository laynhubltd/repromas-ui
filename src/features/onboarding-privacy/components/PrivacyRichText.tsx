import { Link } from "react-router-dom";
import type { PrivacyText } from "../types";

/** Renders copy that mixes plain text and links: internal paths use the router, others open as normal links. */
export function PrivacyRichText({ text }: { text: PrivacyText[] }) {
  return (
    <>
      {text.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        }
        if (part.href.startsWith("/")) {
          return (
            <Link key={index} to={part.href}>
              {part.text}
            </Link>
          );
        }
        const isExternal = part.href.startsWith("http");
        return (
          <a key={index} href={part.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
            {part.text}
          </a>
        );
      })}
    </>
  );
}
