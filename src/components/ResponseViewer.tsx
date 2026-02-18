import { Empty, Tabs, Typography } from "antd";
import type { RunResult } from "../types";

type Props = {
  result: RunResult | null;
};

export const ResponseViewer = ({ result }: Props) => {
  if (!result) {
    return <Empty description="还没有响应数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  if (result.error) {
    return <Typography.Text type="danger">{result.error}</Typography.Text>;
  }

  return (
    <Tabs
      items={[
        {
          key: "body",
          label: "响应体",
          children: (
            <pre className="max-h-[400px] overflow-auto rounded bg-[var(--bg-code)] p-3 text-xs text-[var(--code-text)]">
              {result.body || "(响应体为空)"}
            </pre>
          )
        },
        {
          key: "headers",
          label: "响应头",
          children: (
            <pre className="max-h-[400px] overflow-auto rounded bg-[var(--bg-code)] p-3 text-xs text-[var(--code-text)]">
              {JSON.stringify(result.headers, null, 2)}
            </pre>
          )
        }
      ]}
    />
  );
};
