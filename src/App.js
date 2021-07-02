import { useState } from "react";

import "./App.css";
import { createDocParser } from "./utlls/parse-doc";
import { exportDataObjectsToExel } from "./utlls/export-exel";
import ConfigParser from "./components/ConfigParser";
import FileList from "./components/FileList";

import { Steps, Result, Button, Space, message } from "antd";
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [docFiles, setDocFiles] = useState([]);
  const [parserRules, setParserRules] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [dataObjects, setDataObjects] = useState([]);

  const stepNext = () => setCurrentStep(currentStep + 1);
  const stepPrev = () => setCurrentStep(currentStep - 1);

  const onDownloadExel = async () => {
    exportDataObjectsToExel(dataObjects, "dex-sheet.xlsx");
  };

  const parseDocFileToDataObject = async (file, rules) => {
    const dataObject = {};
    const docParser = await createDocParser(file);

    for (const rule of rules) {
      const { label, from, to, isIncludeFrom, isIncludeTo } = rule;
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
    const progressPerFile = Math.round(100 / files.length);

    for (let i = 0; i < files.length; i++) {
      setParsingProgress((current) => {
        if (current >= 100) return 100;
        return i * progressPerFile;
      });
      const dataObject = await parseDocFileToDataObject(files[i], parserRules);
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
            <div style={{ width: "100%" }}>
              <ConfigParser dataSource={parserRules} onChange={setParserRules} />
            </div>
          )}
          {currentStep === 1 && (
            <div style={{ margin: "0 auto" }}>
              <FileList dataSource={docFiles} onChange={setDocFiles} />
            </div>
          )}
          {currentStep === 2 && (
            <div style={{ margin: "0 auto", marginTop: "10vh" }}>
              <Result status="success" title="操作成功" subTitle={`共处理了${docFiles.length}个文件`} />
            </div>
          )}
        </div>
        <div className="step__action">
          <Space>
            {currentStep > 0 && <Button onClick={() => stepPrev()}>上一步</Button>}
            {currentStep === 0 && (
              <>
                <Button type="primary" disabled={!parserRules.length} onClick={() => stepNext()}>
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
                  {isParsing ? `处理中${parsingProgress}%...` : "下一步"}
                </Button>
              </>
            )}
            {currentStep === 2 && (
              <>
                <Button type="primary" onClick={onDownloadExel}>
                  导出表格
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
