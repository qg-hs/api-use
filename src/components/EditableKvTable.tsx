import { Button, Input, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { KV } from "../types";
import { emptyKV } from "../utils/constants";

type Props = {
  value: KV[];
  onChange: (next: KV[]) => void;
  type: "header" | "env";
};

export const EditableKvTable = ({ value, onChange, type }: Props) => {
  const columns: ColumnsType<KV> = [
    {
      title: "启用",
      dataIndex: "enabled",
      width: 90,
      render: (_, row, index) => (
        <Switch
          size="small"
          checked={row.enabled}
          onChange={(checked) => {
            const next = [...value];
            next[index] = { ...row, enabled: checked };
            onChange(next);
          }}
        />
      )
    },
    {
      title: "参数名",
      dataIndex: "key",
      render: (_, row, index) => (
        <Input
          value={row.key}
          placeholder={type !== "header" ? "例如：Authorization" : "例如：content-type"}
          onChange={(event) => {
            const next = [...value];
            next[index] = { ...row, key: event.target.value };
            onChange(next);
          }}
        />
      )
    },
    {
      title: "参数值",
      dataIndex: "value",
      render: (_, row, index) => (
        <Input
          value={row.value}
          placeholder={type !== "header" ? "例如：Bearer xxxxxx" : "例如：application/json"}
          onChange={(event) => {
            const next = [...value];
            next[index] = { ...row, value: event.target.value };
            onChange(next);
          }}
        />
      )
    },
    {
      title: "操作",
      width: 90,
      render: (_, __, index) => (
        <Button
          danger
          type="link"
          onClick={() => {
            const next = value.filter((_, i) => i !== index);
            onChange(next);
          }}
        >
          删除
        </Button>
      )
    }
  ];

  return (
    <div className="w-full">
      <Table<KV>
        rowKey={(_, index) => String(index)}
        columns={columns}
        dataSource={value}
        size="small"
        pagination={false}
        scroll={{ x: 640 }}
      />
      <Button
        className="!mt-3"
        onClick={() => {
          onChange([...(value ?? []), emptyKV()]);
        }}
      >
        新增一行
      </Button>
    </div>
  );
};
