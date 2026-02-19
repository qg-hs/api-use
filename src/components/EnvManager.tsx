import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useEnvStore } from "../stores/envStore";
import type { Environment } from "../types";
import { EditableKvTable } from "./EditableKvTable";

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export const EnvManager = ({ projectId, open, onClose }: Props) => {
  const environments = useEnvStore((s) => s.environments);
  const settings = useEnvStore((s) => s.settings);
  const addEnv = useEnvStore((s) => s.addEnv);
  const removeEnv = useEnvStore((s) => s.removeEnv);
  const saveEnv = useEnvStore((s) => s.saveEnv);
  const setGlobalHeaders = useEnvStore((s) => s.setGlobalHeaders);

  const [newEnvName, setNewEnvName] = useState("");
  const [editingEnvs, setEditingEnvs] = useState<Record<string, Environment>>({});

  // 全局 Header 本地编辑态
  const [localHeaders, setLocalHeaders] = useState(settings?.globalHeaders ?? []);
  useEffect(() => {
    setLocalHeaders(settings?.globalHeaders ?? []);
  }, [settings?.globalHeaders]);

  // 同步 store → 本地环境
  useEffect(() => {
    const map: Record<string, Environment> = {};
    for (const env of environments) {
      map[env.id] = env;
    }
    setEditingEnvs(map);
  }, [environments]);

  const handleAddEnv = useCallback(async () => {
    const name = newEnvName.trim();
    if (!name) {
      message.warning("请输入环境名称");
      return;
    }
    if (environments.some((e) => e.name === name)) {
      message.warning("同名环境已存在");
      return;
    }
    await addEnv(projectId, name);
    setNewEnvName("");
    message.success(`环境「${name}」已创建`);
  }, [newEnvName, environments, addEnv, projectId]);

  const handleSaveEnv = useCallback(
    async (envId: string) => {
      const env = editingEnvs[envId];
      if (!env) return;
      await saveEnv(env);
      message.success("已保存");
    },
    [editingEnvs, saveEnv]
  );

  const handleDeleteEnv = useCallback(
    async (envId: string) => {
      await removeEnv(envId);
      message.success("已删除");
    },
    [removeEnv]
  );

  // ============ 环境变量 子 Tab ============
  const envSubTabs = environments.map((env) => ({
    key: env.id,
    label: (
      <span className="flex items-center gap-1">
        {env.name}
        <Popconfirm
          title="确定删除该环境？"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDeleteEnv(env.id);
          }}
          okText="删除"
          cancelText="取消"
        >
          <DeleteOutlined
            className="ml-1 text-xs opacity-50 hover:opacity-100 hover:text-red-500"
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </span>
    ),
    children: (
      <div className="flex flex-col gap-3">
        <EditableKvTable
          type="env"
          value={editingEnvs[env.id]?.variables ?? []}
          onChange={(next) =>
            setEditingEnvs((prev) => ({
              ...prev,
              [env.id]: { ...prev[env.id], variables: next },
            }))
          }
        />
        <div className="flex justify-end">
          <Button type="primary" size="small" onClick={() => handleSaveEnv(env.id)}>
            保存变量
          </Button>
        </div>
      </div>
    ),
  }));

  // ============ 顶层 Tab ============
  const mainTabs = [
    {
      key: "globalHeaders",
      label: "全局 Header",
      children: (
        <div className="flex flex-col gap-3">
          <Typography.Text type="secondary" className="text-xs">
            此处配置的 Header 会自动添加到该项目下所有请求中（可被接口级 Header 覆盖）。
          </Typography.Text>
          <EditableKvTable type="header" value={localHeaders} onChange={setLocalHeaders} />
          <div className="flex justify-end">
            <Button
              type="primary"
              size="small"
              onClick={async () => {
                await setGlobalHeaders(localHeaders);
                message.success("全局 Header 已保存");
              }}
            >
              保存全局 Header
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "environments",
      label: "环境变量",
      children: (
        <div className="flex flex-col gap-3">
          <Typography.Text type="secondary" className="text-xs">
            使用 <code>{"{{变量名}}"}</code> 引用变量，发送时自动替换为当前激活环境中的值。
          </Typography.Text>

          {/* 新建环境 */}
          <Row>
            <Col md={12} sm={16} xs={24}>
            <Input
              placeholder="环境名称，如 dev / test"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              onPressEnter={handleAddEnv}
              className="w-full"
            />
            </Col>
           <Col md={12} sm={8} xs={24}>
            <Button className="ml-0 xs:ml-0 sm:ml-2  mt-2 sm:mt-0 xs:mt-0 w-full sm:w-auto md:w-auto" icon={<PlusOutlined />} onClick={handleAddEnv}>
              新建环境
            </Button>
           </Col>
          </Row>

          {environments.length > 0 ? (
            <Tabs items={envSubTabs} size="small" />
          ) : (
            <Typography.Text type="secondary">暂无环境，请先新建。</Typography.Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="项目设置"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnHidden
      centered
    >
      <Tabs items={mainTabs} />
    </Modal>
  );
};
