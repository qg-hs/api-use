import { open } from "@tauri-apps/plugin-dialog";
import { Button, Input, Select, Switch, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { FormKV } from "../types";
import { emptyFormKV } from "../utils/constants";

type Props = {
  value: FormKV[];
  onChange: (next: FormKV[]) => void;
};

/** 表单 KV 表格 —— 支持 text / file 值类型 */
export const FormKvTable = ({ value, onChange }: Props) => {
  const updateRow = (index: number, patch: Partial<FormKV>) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  /** 使用 Tauri dialog 选择文件 */
  const pickFile = async (index: number) => {
    try {
      const selected = await open({
        multiple: false,
        title: "选择文件",
      });
      if (selected) {
        updateRow(index, { value: selected as string });
      }
    } catch {
      // 用户取消选择，忽略
    }
  };

  const columns: ColumnsType<FormKV> = [
    {
      title: "启用",
      dataIndex: "enabled",
      width: 70,
      render: (_, row, index) => (
        <Switch
          size="small"
          checked={row.enabled}
          onChange={(checked) => updateRow(index, { enabled: checked })}
        />
      ),
    },
    {
      title: "参数名",
      dataIndex: "key",
      width: "25%",
      render: (_, row, index) => (
        <Input
          value={row.key}
          placeholder="参数名"
          onChange={(e) => updateRow(index, { key: e.target.value })}
        />
      ),
    },
    {
      title: "类型",
      dataIndex: "valueType",
      width: 100,
      render: (_, row, index) => (
        <Select
          value={row.valueType}
          onChange={(vt) => updateRow(index, { valueType: vt, value: "" })} // 切换类型时清空值
          options={[
            { label: "Text", value: "text" },
            { label: "File", value: "file" },
          ]}
          className="w-full"
        />
      ),
    },
    {
      title: "参数值",
      dataIndex: "value",
      render: (_, row, index) =>
        row.valueType === "file" ? (
          <div className="flex items-center gap-2">
            <Tooltip title={row.value || "未选择文件"}>
              <span className="flex-1 truncate text-sm text-(--text-secondary)">
                {row.value ? (
                  <>
                    <FileOutlined className="mr-1" />
                    {row.value.split("/").pop() ?? row.value}
                  </>
                ) : (
                  "未选择文件"
                )}
              </span>
            </Tooltip>
            <Button
              size="small"
              icon={<FolderOpenOutlined />}
              onClick={() => pickFile(index)}
            >
              选择
            </Button>
          </div>
        ) : (
          <Input
            value={row.value}
            placeholder="参数值"
            onChange={(e) => updateRow(index, { value: e.target.value })}
          />
        ),
    },
    {
      title: "操作",
      width: 70,
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
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table<FormKV>
        rowKey={(_, index) => String(index)}
        columns={columns}
        dataSource={value}
        size="small"
        pagination={false}
        scroll={{ x: 700 }}
      />
      <Button
        className="mt-3!"
        onClick={() => onChange([...(value ?? []), emptyFormKV()])}
      >
        新增一行
      </Button>
    </div>
  );
};
