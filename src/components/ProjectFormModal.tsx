import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  loading?: boolean;
  initialValues?: { name: string; description?: string };
  onCancel: () => void;
  onSubmit: (values: { name: string; description?: string }) => Promise<void>;
};

export const ProjectFormModal = ({
  open,
  title,
  loading,
  initialValues,
  onCancel,
  onSubmit
}: Props) => {
  const [form] = Form.useForm<{ name: string; description?: string }>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues ?? { name: "", description: "" });
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        await onSubmit(values);
      }}
      okButtonProps={{ loading }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="项目名称"
          name="name"
          rules={[{ required: true, message: "请输入项目名称" }, { max: 50, message: "最多 50 个字符" }]}
        >
          <Input placeholder="例如：支付接口调试" />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ max: 200, message: "最多 200 个字符" }]}>
          <Input.TextArea placeholder="可选" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
