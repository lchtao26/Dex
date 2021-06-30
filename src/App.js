import { useState } from "react";
import xlsx from "xlsx";

import "./App.css";
import { createDocParser } from "./utlls/parse-doc";
import ConfigParser from "./components/ConfigParser";

import { Steps, Result, Button, Space } from "antd";
import { InboxOutlined } from "@ant-design/icons";
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [parserConfig, setParserConfig] = useState([]);
  const [docFiles, setDocFiles] = useState([]);

  const stepNext = () => setCurrentStep(currentStep + 1);
  const stepPrev = () => setCurrentStep(currentStep - 1);

  const exportJSONToExel = (dataObjectList) => {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(dataObjectList);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "sheet.xlsx");
  };

  const onUploadDocFile = (e) => {
    setDocFiles(Array.from(e.target.files));
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

  const downloadExel = async () => {
    const dataObjectList = [];
    for (const file of docFiles) {
      const dataObject = await parseDocFileToDataObject(file);
      dataObjectList.push(dataObject);
    }
    exportJSONToExel(dataObjectList);
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
            <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
              {(docFiles.length && (
                <ul style={{ maxHeight: "50%", overflow: "auto" }}>
                  {docFiles.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              )) || (
                <div>
                  <label className="ant-upload ant-upload-drag dragger">
                    <input type="file" accept=".doc,.docx" style={{ display: "none" }} multiple onChange={onUploadDocFile} />
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
          {currentStep === 2 && <Result status="success" title="操作成功" subTitle={`共处理了${docFiles.length}个文件`} />}
        </div>
        <div className="step__action">
          <Space>
            {currentStep > 0 && <Button onClick={() => stepPrev()}>上一步</Button>}
            {currentStep === 0 && (
              <>
                <Button type="primary" disabled={!parserConfig} onClick={() => stepNext()}>
                  下一步
                </Button>
              </>
            )}
            {currentStep === 1 && (
              <>
                <Button type="dashed" style={{ display: docFiles.length ? "initial" : "none" }} onClick={() => setDocFiles([])}>
                  重新上传
                </Button>
                <Button type="primary" disabled={!docFiles.length} onClick={() => stepNext()}>
                  下一步
                </Button>
              </>
            )}
            {currentStep === 2 && (
              <>
                <Button type="primary" onClick={downloadExel}>
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
