import { List, Button, Popconfirm, Space } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { importFiles } from "../utlls/file";

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
