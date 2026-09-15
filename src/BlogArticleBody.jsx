import React from "react";
import { isBlogImage } from "./blogFormatting.js";
export function InlineText({ runs }) {
  return runs.map((run, index) => {
    let content = run.text;
    if (run.bold) content = <strong>{content}</strong>;
    if (run.italic) content = <em>{content}</em>;
    if (run.underline) content = <u>{content}</u>;
    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}
export default function BlogArticleBody({ body }) {
  return body.map((block, index) => {
    const Heading = block.level === 3 ? "h3" : "h2";
    const List = block.ordered ? "ol" : "ul";
    return (
      <section key={index}>
        {block.image && isBlogImage(block.image.src) && (
          <img
            className="blog-article-image"
            src={block.image.src}
            alt={block.image.alt || ""}
            loading="lazy"
          />
        )}
        {block.heading && <Heading>{block.heading}</Heading>}
        {(block.paragraphs || []).map((text, i) => (
          <p key={i}>
            {block.richText?.[i] ? (
              <InlineText runs={block.richText[i]} />
            ) : (
              text
            )}
          </p>
        ))}
        {block.list && (
          <List>
            {block.list.map((runs, i) => (
              <li key={i}>
                <InlineText runs={runs} />
              </li>
            ))}
          </List>
        )}
      </section>
    );
  });
}
