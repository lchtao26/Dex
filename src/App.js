import { useState } from "react";
import mammoth from "mammoth";
import xlsx from "xlsx";
import "./App.css";
import { Steps, Result, Button, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Step } = Steps;
const { Dragger } = Upload;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const stepNext = () => setCurrentStep(currentStep + 1);
  const stepPrev = () => setCurrentStep(currentStep - 1);

  const extractDocDOM = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    const dom = document.createElement("div");
    dom.innerHTML = html;
    return dom;
  };
  const createRelationList = (dom) => {
    const list = [];
    let currentParentNode = null;

    const normalizeListNode = (listNode) => {
      const contentList = Array.prototype.map.call(listNode.childNodes, (node) => node.textContent);
      const newListNode = listNode.cloneNode(true);
      newListNode.textContent = contentList.join("\n");
      return newListNode;
    };

    for (const node of dom.childNodes) {
      const isHeadingNode = node.nodeName.match(/H\d/);
      const isListNode = node.nodeName.match(/(U|O)L/);
      if (isHeadingNode) {
        currentParentNode = node;
        list.push({
          value: node,
          parentNode: null,
        });
      } else if (isListNode) {
        list.push({
          value: normalizeListNode(node),
          parentNode: currentParentNode,
        });
      } else {
        list.push({
          value: node,
          parentNode: currentParentNode,
        });
      }
    }
    return list;
  };

  const createSheetDataObject = (relationList) => {
    const dataObject = {};
    for (const item of relationList) {
      if (!item.parentNode) {
        dataObject[item.value.textContent] = "";
      } else {
        dataObject[item.parentNode.textContent] += `${item.value.textContent}\n`;
      }
    }
    return dataObject;
  };

  const exportJSONToExel = (dataObjectList) => {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(dataObjectList);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "sheet.xlsx");
  };

  const onFileChange = async (e) => {
    const dataObjectList = [];
    for (const file of e.target.files) {
      const dom = await extractDocDOM(file);
      const list = createRelationList(dom);
      const object = createSheetDataObject(list);
      dataObjectList.push(object);
    }
    exportJSONToExel(dataObjectList);
  };

  return (
    <div className="app">
      <div className="step">
        <div className="step__header">
          <Steps current={currentStep} onChange={setCurrentStep}>
            <Step title="上传模板" description="" />
            <Step title="上传文档（批量）" description="" />
            <Step title="下载表格" description="" />
          </Steps>
        </div>
        <div className="step__content">
          {currentStep === 0 && (
            <div>
              <Dragger className="dragger" accept=".doc,.docx" onChange={onFileChange}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传</p>
                <p className="ant-upload-hint">仅支持doc,docx文件</p>
              </Dragger>
            </div>
          )}
          {currentStep === 1 && (
            <div>
              <Dragger className="dragger" accept=".doc,.docx" onChange={onFileChange}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传</p>
                <p className="ant-upload-hint">仅支持doc,docx文件</p>
              </Dragger>
            </div>
          )}
          {currentStep === 2 && (
            <Result
              status="success"
              title="Exel表格已生成"
              subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
              extra={[
                <Button type="primary" key="console">
                  下载
                </Button>,
                <Button key="buy">关闭</Button>,
              ]}
            />
          )}
        </div>
        <div className="step__action">
          {currentStep < 2 && (
            <Button type="primary" onClick={() => stepNext()}>
              Next
            </Button>
          )}
          {currentStep === 2 && <Button type="primary">Done</Button>}
          {currentStep > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => stepPrev()}>
              Previous
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
