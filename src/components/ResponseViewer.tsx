import { Empty, Tabs, Typography } from "antd";
import { useMemo } from "react";
import type { RunResult } from "../types";

type Props = {
  result: RunResult | null;
};

/** JSON 语法高亮：纯文本 → React 节点 */
const highlightJson = (raw: string): React.ReactNode => {
  try {
    const parsed = JSON.parse(raw);
    const formatted = JSON.stringify(parsed, null, 2);

    // 对每一行做词法着色
    const lines = formatted.split("\n");
    return lines.map((line, i) => {
      const colored = line.replace(
        // 匹配 JSON token：key / string / number / boolean / null
        /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|([-+]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)/g,
        (_match, key, str, num, bool, nil) => {
          if (key) return `<span class="json-key">${key}</span>:`;
          if (str) return `<span class="json-string">${str}</span>`;
          if (num) return `<span class="json-number">${num}</span>`;
          if (bool) return `<span class="json-boolean">${bool}</span>`;
          if (nil) return `<span class="json-null">${nil}</span>`;
          return _match;
        }
      );
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: colored }} />
          {i < lines.length - 1 ? "\n" : ""}
        </span>
      );
    });
  } catch {
    // 非 JSON，返回原始文本
    return raw;
  }
};

export const ResponseViewer = ({ result }: Props) => {
  if (!result) {
    return <Empty description="还没有响应数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  if (result.error) {
    return <Typography.Text type="danger">{result.error}</Typography.Text>;
  }

  // 缓存格式化结果，避免重复解析
  const formattedBody = useMemo(() => highlightJson(result.body || "(响应体为空)"), [result.body]);

  return (
    <Tabs
      items={[
        {
          key: "body",
          label: "响应体",
          children: (
            <pre className="json-viewer max-h-[400px] overflow-auto rounded bg-[var(--bg-code)] p-3 text-xs leading-5 text-[var(--code-text)]">
              {formattedBody}
            </pre>
          )
        },
        {
          key: "headers",
          label: "响应头",
          children: (
            <pre className="json-viewer max-h-[400px] overflow-auto rounded bg-[var(--bg-code)] p-3 text-xs leading-5 text-[var(--code-text)]">
              {highlightJson(JSON.stringify(result.headers, null, 2))}
            </pre>
          )
        }
      ]}
    />
  );
};
