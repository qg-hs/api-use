import {
  KeyOutlined,
  SaveOutlined,
  SendOutlined,
  SettingOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { useKeyPress } from "ahooks";
import { Button, Card, Col, Empty, Flex, Input, Row, Select, Space, Tabs, Tag, Typography, message } from "antd";
import { useState } from "react";
import { useApiStore } from "../stores/apiStore";
import { useEnvStore } from "../stores/envStore";
import { useRunStore } from "../stores/runStore";
import { useTreeStore } from "../stores/treeStore";
import { HTTP_METHODS } from "../utils/constants";
import { BodyEditor } from "./BodyEditor";
import { EditableKvTable } from "./EditableKvTable";
import { ResponseViewer } from "./ResponseViewer";

export const RequestEditor = ({ projectId }: { projectId: string }) => {
  const current = useApiStore((state) => state.current);
  const patchCurrent = useApiStore((state) => state.patchCurrent);
  const saveCurrent = useApiStore((state) => state.saveCurrent);
  const refreshNodes = useTreeStore((state) => state.refresh);
  const run = useRunStore((state) => state.run);
  const loading = useRunStore((state) => state.loading);
  const result = useRunStore((state) => state.result);
  
  const [saving, setSaving] = useState(false);

  // 手动保存函数
  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      await saveCurrent();
      await refreshNodes(projectId); // 刷新树
      message.success("保存成功");
    } catch (error) {
      message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 监听 Command+S / Ctrl+S
  useKeyPress(['meta.s', 'ctrl.s'], (e) => {
    e.preventDefault();
    handleSave();
  });
  if (!current) {
    return <div className="flex h-full w-full items-center justify-center">
      <Empty description="请选择一个接口" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-y-auto p-3 sm:p-4">
      {/* URL Bar */}
      <Card className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-md)] sm:p-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">接口名称</label>
            <Input
              value={current.name}
              placeholder="请输入接口名称"
              onChange={(event) => patchCurrent({ name: event.target.value })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={current.method}
              options={HTTP_METHODS.map((method) => ({ value: method, label: method }))}
              onChange={(method) => patchCurrent({ method: method as typeof current.method })}
              className="w-full sm:w-28"
            />

            <Input
              value={current.url}
              placeholder="请输入请求地址"
              onChange={(event) => patchCurrent({ url: event.target.value })}
              className="flex-1"
            />

            <div className="flex gap-2">
            
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                className="flex-1 sm:flex-initial"
                onClick={async () => {
                  if (!current.url) {
                    message.warning("请先输入请求地址");
                    return;
                  }
                  // 变量替换 + 全局 Header 合并
                  const resolve = useEnvStore.getState().resolveVariables;
                  const globalHeaders = useEnvStore.getState().settings?.globalHeaders ?? [];
                  // 全局 Header（低优先级）+ 接口级 Header（高优先级覆盖）
                  const mergedHeaders = [
                    ...globalHeaders.filter((g) => g.enabled && g.key),
                    ...current.headers,
                  ];
                  await run({
                    method: current.method,
                    url: resolve(current.url),
                    auth: current.auth,
                    headers: mergedHeaders.map((h) => ({ ...h, key: resolve(h.key), value: resolve(h.value) })),
                    query: current.query.map((q) => ({ ...q, key: resolve(q.key), value: resolve(q.value) })),
                    body: current.body
                  });
                }}
              >
                发送
              </Button>
               <Button
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Request Parameters */}
      <Card className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]">
        <Tabs
          items={[
            {
              key: "auth",
              label: <span><KeyOutlined /> 认证（Auth）</span>,
              children: (
                <Row className="w-full">
                  <Col lg={5} md={6} sm={24} xs={24}>
                    <Select
                    value={current.auth.type}
                    options={[
                      { label: "无认证", value: "none" },
                      { label: "Bearer 令牌", value: "bearer" }
                    ]}
                    onChange={(type) => patchCurrent({ auth: { ...current.auth, type: type as "none" | "bearer" } })}
                    className="w-full"
                  />
                  </Col>  
                  <Col lg={19} md={18} sm={24} xs={24}>
                  {current.auth.type === "bearer" && (
                    <Input.Password
                      value={current.auth.token}
                      onChange={(event) => patchCurrent({ auth: { ...current.auth, token: event.target.value } })}
                      placeholder="请输入 Bearer 令牌"
                      className="w-full md:ml-[10px] sm:ml-0 mt-[10px] md:mt-0"
                    />
                  )}
                  </Col>
                </Row>
              )
            },
            {
              key: "headers",
              label: <span><TagsOutlined /> 请求头（Headers）</span>,
              children: <EditableKvTable value={current.headers} onChange={(headers) => patchCurrent({ headers })} />
            },
            {
              key: "query",
              label: <span><SettingOutlined /> 查询参数（Query）</span>,
              children: <EditableKvTable value={current.query} onChange={(query) => patchCurrent({ query })} />
            },
            {
              key: "body",
              label: "消息体（Body）",
              children: (
                <BodyEditor
                  type={current.body.type}
                  value={current.body.value}
                  onTypeChange={(type) => {
                    const defaultValue = type === "form" ? [] : "";
                    patchCurrent({ body: { type: type as typeof current.body.type, value: defaultValue } });
                  }}
                  onValueChange={(value) => patchCurrent({ body: { ...current.body, value } })}
                />
              )
            }
          ].filter((tab) => !(tab.key === "body" && current.method === "GET"))}
        />
      </Card>

      {/* Response Panel */}
      <Card className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]">
        <Flex justify="space-between" align="center" className="mb-3" wrap="wrap" gap={8}>
          <Typography.Title level={5} className="!m-0">
            响应结果
          </Typography.Title>
          {result ? (
            <Space size={8} wrap>
              <Tag color={result.error ? "error" : "success"}>状态 <span className={result.error ? "text-red-500" : "text-green-500"}>{result.status ?? "失败"}</span></Tag>
              <Tag>耗时 <span className={result.error ? "text-red-500" : "text-green-500"}> {result.durationMs}ms</span></Tag>
              <Tag>头部 <span className={result.error ? "text-red-500" : "text-green-500"}>{Object.keys(result.headers).length}</span></Tag>
            </Space>
          ) : null}
        </Flex>
        <ResponseViewer result={result} />
      </Card>
    </div>
  );
};
