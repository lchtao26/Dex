import { useState } from "react";
import { Button, Card, Form, Modal, Table, Input, Checkbox, InputNumber, Select, Space, Tag } from "antd";
const { Option } = Select;

const ModalForm = ({ type, visible, form, onSubmit, onCancel }) => {
  const onOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };
  return (
    <Modal title={type === "add" ? "新增" : "编辑"} visible={visible} forceRender onOk={onOk} onCancel={onCancel}>
      <Form form={form}>
        <Form.Item label="字段名" name="label" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="开始边界" required>
          <Space>
            <Form.Item noStyle name="fromType" rules={[{ required: true }]}>
              <Select placeholder="选择边界类型" onSelect={() => form.setFieldsValue({ from: undefined })}>
                <Option value="string">关键词</Option>
                <Option value="number">行数</Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.fromType !== currentValues.fromType}>
              {({ getFieldValue }) =>
                (getFieldValue("fromType") === "string" && (
                  <Form.Item noStyle name="from" rules={[{ required: true }]}>
                    <Input placeholder="输入关键词" />
                  </Form.Item>
                )) ||
                (getFieldValue("fromType") === "number" && (
                  <Form.Item noStyle name="from" rules={[{ required: true }]}>
                    <InputNumber placeholder="输入行数" />
                  </Form.Item>
                ))
              }
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="结束边界" required>
          <Space>
            <Form.Item noStyle name="toType" rules={[{ required: true }]}>
              <Select placeholder="选择边界类型" onSelect={() => form.setFieldsValue({ to: undefined })}>
                <Option value="string">关键词</Option>
                <Option value="number">行数</Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.toType !== currentValues.toType}>
              {({ getFieldValue }) =>
                (getFieldValue("toType") === "string" && (
                  <Form.Item noStyle name="to" rules={[{ required: true }]}>
                    <Input placeholder="输入关键词" />
                  </Form.Item>
                )) ||
                (getFieldValue("toType") === "number" && (
                  <Form.Item noStyle name="to" rules={[{ required: true }]}>
                    <InputNumber placeholder="输入行数" />
                  </Form.Item>
                ))
              }
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="保留开始边界" name="isIncludeFrom" valuePropName="checked" rules={[{ required: true }]}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="保留结束边界" name="isIncludeTo" valuePropName="checked" rules={[{ required: true }]}>
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ParseTemplate = ({ file, onChange }) => {
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [modalFormType, setModalFormType] = useState("add");
  const [dataSource, setDataSource] = useState([]);
  const [form] = Form.useForm();

  const onSubmit = (values) => {
    if (modalFormType === "add") {
      setDataSource(dataSource.concat(values));
    }
    if (modalFormType === "edit") {
      setDataSource(dataSource.map((item) => (item.id === values.id ? values : item)));
    }

    form.resetFields();
    setModalFormVisible(false);

    onChange(dataSource);
  };

  if (!file) return null;
  return (
    <Card
      extra={
        <Button
          type="primary"
          onClick={() => {
            form.setFieldsValue({ id: Date.now() });
            setModalFormType("add");
            setModalFormVisible(true);
          }}
        >
          添加规则
        </Button>
      }
    >
      <ModalForm
        visible={modalFormVisible}
        type={modalFormType}
        form={form}
        onSubmit={onSubmit}
        onCancel={() => {
          form.resetFields()
          setModalFormVisible(false);
        }}
      />
      <Table
        bordered
        rowKey="id"
        dataSource={dataSource}
        columns={[
          {
            title: "字段名",
            dataIndex: "label",
            align: "center",
            width: 100,
          },
          {
            title: "匹配规则",
            align: "center",
            render(_, record) {
              const { from, fromType, to, toType } = record;

              const getTagProps = (type, value) => {
                if (type === "string")
                  return {
                    name: `关键词：${value}`,
                    color: "orange",
                  };
                if (type === "number")
                  return {
                    name: `第${value}行`,
                    color: "blue",
                  };
              };

              return (
                <div style={{ textAlign: "left" }}>
                  <p>
                    <Space>
                      开始于
                      <Tag color={getTagProps(fromType, from).color}>{getTagProps(fromType, from).name}</Tag>
                    </Space>
                  </p>
                  <p>
                    <Space>
                      结束于
                      <Tag color={getTagProps(toType, to).color}>{getTagProps(toType, to).name}</Tag>
                    </Space>
                  </p>
                </div>
              );
            },
          },
          {
            title: "保留开始边界",
            dataIndex: "isIncludeFrom",
            align: "center",
            render(value) {
              return <Checkbox checked={value} />;
            },
          },
          {
            title: "保留结束边界",
            dataIndex: "isIncludeTo",
            align: "center",
            render(value) {
              return <Checkbox checked={value} />;
            },
          },
          {
            title: "操作",
            dataIndex: "id",
            align: "center",
            render(id, record) {
              return (
                <>
                  <Button
                    type="link"
                    onClick={() => {
                      form.setFieldsValue(record);
                      setModalFormType("edit");
                      setModalFormVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button type="link" onClick={() => setDataSource(dataSource.filter((item) => item.id !== id))}>
                    删除
                  </Button>
                </>
              );
            },
          },
        ]}
      />
    </Card>
  );
};

export default ParseTemplate;
