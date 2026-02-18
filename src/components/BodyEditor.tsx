import { Button, Flex, Select, Space, Typography, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { BodyType, KV } from "../types";
import { BODY_TYPES } from "../utils/constants";
import { EditableKvTable } from "./EditableKvTable";

type Props = {
  type: BodyType;
  value: unknown;
  onTypeChange: (type: BodyType) => void;
  onValueChange: (value: unknown) => void;
};

export const BodyEditor = ({ type, value, onTypeChange, onValueChange }: Props) => {
  const bodyTypeOptions = BODY_TYPES.map((item) => {
    const labelMap: Record<string, string> = {
      none: "无",
      form: "表单（x-www-form-urlencoded）",
      json: "JSON",
      text: "纯文本",
      html: "HTML",
      javascript: "JavaScript"
    };
    return { label: labelMap[item] ?? item, value: item };
  });

  return (
    <Space direction="vertical" size={12} className="w-full">
      <Select value={type} onChange={onTypeChange} options={bodyTypeOptions} />

      {type === "none" && <Typography.Text type="secondary">当前请求不发送请求体。</Typography.Text>}

      {type === "form" && (
        <EditableKvTable
          value={(Array.isArray(value) ? (value as KV[]) : []) ?? []}
          onChange={(next) => onValueChange(next)}
        />
      )}

      {type === "json" && (
        <Space direction="vertical" className="w-full">
          <Flex gap={8}>
            <Button
              onClick={() => {
                try {
                  const parsed = JSON.parse(String(value || "{}"));
                  onValueChange(parsed);
                  message.success("JSON 校验通过");
                } catch (error) {
                  message.error(`JSON 不合法: ${(error as Error).message}`);
                }
              }}
            >
              校验 JSON
            </Button>
            <Button
              onClick={() => {
                try {
                  const parsed = typeof value === "string" ? JSON.parse(value || "{}") : value;
                  onValueChange(parsed);
                  message.success("JSON 已格式化");
                } catch {
                  message.error("格式化失败，请先修正 JSON");
                }
              }}
            >
              格式化
            </Button>
          </Flex>
          <TextArea
            autoSize={{ minRows: 8, maxRows: 18 }}
            value={typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2)}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </Space>
      )}

      {type !== "none" && type !== "form" && type !== "json" && (
        <TextArea
          autoSize={{ minRows: 8, maxRows: 18 }}
          value={String(value ?? "")}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </Space>
  );
};
