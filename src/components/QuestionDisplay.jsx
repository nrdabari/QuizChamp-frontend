import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function QuestionContent({ question }) {
  if (!question) return null;

  const q = String(question); // keep as-is, no newline stripping

  const hasHTML = /<\/?[a-z][\s\S]*>/i.test(q);
  if (hasHTML) {
    // Render provided HTML as-is, preserving its own line breaks/spacing
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: question,
        }}
      />
    );
  }

  // Detect LaTeX; if none, print EXACTLY as typed (line breaks preserved)
  const hasMath = /(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/s.test(q);
  if (!hasMath) {
    return <span style={{ whiteSpace: "pre-wrap" }}>{q}</span>;
  }

  // If math exists, split and render math inline; preserve line breaks in text parts
  const parts = q.split(/(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/gs);

  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, idx) => {
        if (!part) return null;

        const isInlineParen = part.startsWith("\\(") && part.endsWith("\\)");
        const isBlockBracket = part.startsWith("\\[") && part.endsWith("\\]");
        const isDollar =
          (part.startsWith("$$") && part.endsWith("$$")) ||
          (part.startsWith("$") && part.endsWith("$"));

        if (isInlineParen || isBlockBracket || isDollar) {
          const math = isDollar
            ? part.slice(
                part.startsWith("$$") ? 2 : 1,
                part.endsWith("$$") ? -2 : -1
              )
            : part.slice(2, -2);
          return <InlineMath key={idx} math={math} />;
        }

        // Plain text: keep its original newlines (your requested pattern)
        return part.split("\n").map((line, i) => (
          <React.Fragment key={`${idx}-${i}`}>
            {line}
            {i < part.split("\n").length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </span>
  );
}
