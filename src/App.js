import { useState } from "react";

import "./App.css";
import { createDocParser } from "./utlls/parse-doc";
import { exportDataObjectsToExel } from "./utlls/export-exel";
import { importFiles } from "./utlls/file";
import ConfigParser from "./components/ConfigParser";

import { Steps, Result, Button, Space, List, Popconfirm,  message } from "antd";
import { InboxOutlined, PaperClipOutlined } from "@ant-design/icons";
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [docFiles, setDocFiles] = useState([]);
  const [parserConfig, setParserConfig] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dataObjects, setDataObjects] = useState([]);

  const stepNext = () => setCurrentStep(currentStep + 1);
  const stepPrev = () => setCurrentStep(currentStep - 1);

  const onDownloadExel = async () => {
    exportDataObjectsToExel(dataObjects, "dex-sheet.xlsx");
  };

  const onClickUploadDocFiles = async () => {
    const files = await importFiles({ accept: ".doc,.docx", multiple: true });

    // file 参入唯一id, 方便列表操作
    const now = Date.now();
    const filesWithId = Array.from(files);
    filesWithId.forEach((file, index) => (file.id = now.toString() + index));

    setDocFiles(docFiles.concat(filesWithId));
  };

  const parseDocFileToDataObject = async (file) => {
    const docParser = await createDocParser(file);
    const dataObject = {};
    for (const config of parserConfig) {
      const { label, from, to, isIncludeFrom, isIncludeTo } = config;
      const result = docParser.parse({
        from,
        to,
        isIncludeFrom,
        isIncludeTo,
      });
      dataObject[label] = result;
    }
    return dataObject;
  };

  const parseDocFilesToDataObjects = async (files) => {
    const dataObjects = [];
    for (const file of files) {
      const dataObject = await parseDocFileToDataObject(file);
      dataObjects.push(dataObject);
    }
    setDataObjects(dataObjects);
  };

  return (
    <div className="app">
      <div className="step">
        <div className="step__header">
          <Steps current={currentStep}>
            <Step title="配置规则" description="" />
            <Step title="上传文档（批量）" description="" />
            <Step title="下载表格" description="" />
          </Steps>
        </div>
        <div className="step__content">
          {currentStep === 0 && (
            <div>
              <ConfigParser dataSource={parserConfig} onChange={setParserConfig} />
            </div>
          )}
          {currentStep === 1 && (
            <div>
              {(docFiles.length && (
                <List
                  header={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ color: "#1890ff" }}>合计：{docFiles.length}个文件</p>
                      <Space style={{ paddingRight: "8px" }}>
                        <Popconfirm title="确认清空规则?" onConfirm={() => setDocFiles([])}>
                          <Button type="link" danger style={{ padding: 0 }}>
                            清空
                          </Button>
                        </Popconfirm>
                        <Button type="link" style={{ padding: 0 }} onClick={onClickUploadDocFiles}>
                          上传
                        </Button>
                      </Space>
                    </div>
                  }
                  style={{ width: "60vw", minWidth: 300 }}
                  dataSource={docFiles}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          style={{ padding: 0 }}
                          onClick={() => {
                            setDocFiles(docFiles.filter((docFile) => docFile.id !== file.id));
                          }}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta avatar={<PaperClipOutlined />} title={file.name} />
                    </List.Item>
                  )}
                />
              )) || (
                <div>
                  <label className="ant-upload ant-upload-drag dragger" onClick={onClickUploadDocFiles}>
                    <div className="ant-upload-drag-container">
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">点击上传</p>
                      <p className="ant-upload-hint">仅支持doc,docx文件</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <Result status="success" title="操作成功" subTitle={`共处理了${docFiles.length}个文件`} />
            </div>
          )}
        </div>
        <div className="step__action">
          <Space>
            {currentStep > 0 && <Button onClick={() => stepPrev()}>上一步</Button>}
            {currentStep === 0 && (
              <>
                <Button type="primary" disabled={!parserConfig.length} onClick={() => stepNext()}>
                  下一步
                </Button>
              </>
            )}
            {currentStep === 1 && (
              <>
                <Button
                  type="primary"
                  disabled={!docFiles.length}
                  loading={isParsing}
                  onClick={async () => {
                    setIsParsing(true);
                    try {
                      await parseDocFilesToDataObjects(docFiles);
                      stepNext();
                    } catch (e) {
                      message.error("处理失败, 请重试");
                    } finally {
                      setIsParsing(false);
                    }
                  }}
                >
                  {isParsing ? "正在处理..." : "下一步"}
                </Button>
              </>
            )}
            {currentStep === 2 && (
              <>
                <Button type="primary" onClick={onDownloadExel}>
                  下载
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
}

export default App;
