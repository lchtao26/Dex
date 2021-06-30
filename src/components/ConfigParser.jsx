import { useState } from "react";
import { Button, Card, Form, Modal, Table, Input, Checkbox, InputNumber, Select, Space, Tag } from "antd";
import { PlusOutlined, ImportOutlined, ExportOutlined } from "@ant-design/icons";
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
        <Form.Item noStyle label="ID" name="id" />
        <Form.Item label="字段名" name="label" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="开始边界" required>
          <Space>
            <Form.Item noStyle name="fromType" rules={[{ required: true }]}>
              <Select placeholder="选择边界类型" style={{ width: 100 }} onSelect={() => form.setFieldsValue({ from: undefined })}>
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
                    <InputNumber placeholder="输入行数（1: 第一行, -1: 最后一行）" style={{ width: 260 }}/>
                  </Form.Item>
                ))
              }
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="结束边界" required>
          <Space>
            <Form.Item noStyle name="toType" rules={[{ required: true }]}>
              <Select placeholder="选择边界类型" style={{ width: 100 }} onSelect={() => form.setFieldsValue({ to: undefined })}>
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
                    <InputNumber placeholder="输入行数（1: 第一行, -1: 最后一行）" style={{ width: 260 }}/>
                  </Form.Item>
                ))
              }
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="保留开始边界" name="isIncludeFrom" valuePropName="checked" rules={[{ required: true }]} initialValue={false}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="保留结束边界" name="isIncludeTo" valuePropName="checked" rules={[{ required: true }]} initialValue={false}>
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ParseTemplate = ({ dataSource, onChange }) => {
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [modalFormType, setModalFormType] = useState("add");
  const [form] = Form.useForm();

  const onSubmit = (values) => {
    values.id = values.id || Date.now(); // 参入id，方便列表操作

    let newDataSource;

    if (modalFormType === "add") {
      newDataSource = dataSource.concat(values);
    }
    if (modalFormType === "edit") {
      newDataSource = dataSource.map((item) => (item.id === values.id ? values : item));
    }

    form.resetFields();
    setModalFormVisible(false);

    onChange(newDataSource);
  };

  const downloadFile = (file, filename) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename || "download";
    a.click();

    URL.revokeObjectURL(url);
  };

  const importFiles = () => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = (e) => {
        const target = e.path[0] || {};
        resolve(target.files);
      };
      input.click();
    });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsText(file);
    });
  };

  const onImportRule = async () => {
    const files = await importFiles();
    let result = await readFileAsText(files[0]);
    result = JSON.parse(result);
    onChange(dataSource.concat(result));
  };

  const onExportRule = () => {
    const JSONFile = new Blob([JSON.stringify(dataSource)], { type: "application/json" });
    downloadFile(JSONFile, "dex-rule");
  };

  return (
    <Card
      extra={
        <Space>
          <Button onClick={onImportRule}>
            <ImportOutlined />
            导入规则
          </Button>
          <Button onClick={onExportRule}>
            <ExportOutlined />
            导出规则
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setModalFormType("add");
              setModalFormVisible(true);
            }}
          >
            <PlusOutlined />
            添加规则
          </Button>
        </Space>
      }
    >
      <ModalForm
        visible={modalFormVisible}
        type={modalFormType}
        form={form}
        onSubmit={onSubmit}
        onCancel={() => {
          form.resetFields();
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
            render(text) {
              return <div style={{ textAlign: "left" }}>{text}</div>;
            },
          },
          {
            title: "匹配规则",
            align: "center",
            render(_, record) {
              const { from, fromType, to, toType } = record;

              const getTagProps = (type, value) => {
                if (type === "string") {
                  return {
                    name: `关键词：${value}`,
                    color: "orange",
                  };
                }
                if (type === "number") {
                  const absValue = Math.abs(value);
                  return {
                    name: value < 0 ? `倒数第${absValue}行` : `第${absValue}行`,
                    color: "blue",
                  };
                }
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
                  <Button type="link" onClick={() => onChange(dataSource.filter((item) => item.id !== id))}>
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
