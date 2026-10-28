import type { PrivacyBlock } from "../types";
import styles from "./PrivacyPage.module.css";
import { PrivacyRichText } from "./PrivacyRichText";

export function PrivacyBlockView({ block }: { block: PrivacyBlock }) {
  if (block.kind === "paragraph") {
    return (
      <p>
        <PrivacyRichText text={block.text} />
      </p>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className={styles.list}>
        {block.items.map((item, index) => (
          <li key={index}>
            <PrivacyRichText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.tableWrap} role="region" aria-label={block.caption} tabIndex={0}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{block.caption}</caption>
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index} data-label={block.headers[index]}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
