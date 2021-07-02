import { List, Button, Popconfirm, Space, Modal, message } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { importFiles } from "../utlls/file";
import { createDocParser } from "../utlls/parse-doc";

const FileList = ({ dataSource = [], onChange }) => {
  const attachIdToFiles = (files) => {
    const now = Date.now();
    const newFiles = Array.from(files);
    newFiles.forEach((file, index) => (file.id = now.toString() + index));
    return newFiles;
  };

  const onClickUpload = async () => {
    const files = await importFiles({ accept: ".doc,.docx", multiple: true });
    const filesWithId = attachIdToFiles(files);
    onChange(dataSource.concat(filesWithId));
  };

  const onClickDelFile = (file) => {
    onChange(dataSource.filter((item) => item.id !== file.id));
  };

  const scrollToTop = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  };

  const getMsgShareConfig = () => {
    return {
      style: { marginTop: "10vh" },
      key: "currentMsg",
    };
  };

  const onClickPreviewFile = async (file) => {
    await message.loading({ content: "生成预览中...", ...getMsgShareConfig() });
    try {
      const docParser = await createDocParser(file);
      const html = docParser.getHTML();
      message.success({ content: "生成预览成功", ...getMsgShareConfig(), duration: 1 });
      Modal.success({
        title: `预览`,
        width: 800,
        closable: true,
        maskClosable: true,
        content: (
          <div style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <h1 style={{ textAlign: "center" }}>{file.name}</h1>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ),
      });
      setTimeout(() => scrollToTop(), 2000)
    } catch (e) {
      message.error({ content: "生成预览失败", ...getMsgShareConfig() });
    }
  };

  return (
    <List
      header={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "#1890ff" }}>合计：{dataSource.length}个文件</p>
          <Space style={{ paddingRight: "8px" }}>
            <Popconfirm title="确认清空规则?" onConfirm={() => onChange([])}>
              <Button type="link" danger style={{ padding: 0 }} disabled={!dataSource.length}>
                清空
              </Button>
            </Popconfirm>
            <Button type="link" style={{ padding: 0 }} onClick={onClickUpload}>
              上传
            </Button>
          </Space>
        </div>
      }
      style={{ width: "60vw", minWidth: 300 }}
      dataSource={dataSource}
      renderItem={(file) => (
        <List.Item
          key={file.id}
          actions={[
            <Button type="link" style={{ padding: 0 }} onClick={() => onClickPreviewFile(file)}>
              预览
            </Button>,
            <Button type="link" style={{ padding: 0 }} onClick={() => onClickDelFile(file)}>
              删除
            </Button>,
          ]}
        >
          <List.Item.Meta avatar={<PaperClipOutlined />} title={file.name} />
        </List.Item>
      )}
    />
  );
};

export default FileList;
