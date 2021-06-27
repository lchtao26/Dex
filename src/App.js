import { useState } from "react";
import mammoth from "mammoth";
import xlsx from "xlsx";
import "./App.css";
import { Steps, Result, Button, Space } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateHeadings, setTemplateHeadings] = useState([]);
  const [docFiles, setDocFiles] = useState([]);

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
    const ws = xlsx.utils.json_to_sheet(dataObjectList, { header: templateHeadings });
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "sheet.xlsx");
  };

  const onUploadTemplateFile = async (e) => {
    const file = e.target.files[0];
    setTemplateFile(file);
    const dom = await extractDocDOM(file);
    const headingNodes = Array.prototype.filter.call(dom.childNodes, (node) => node.nodeName.match(/H\d/));
    setTemplateHeadings(headingNodes.map((node) => node.textContent));
  };

  const onUploadDocFile = (e) => {
    setDocFiles(e.target.files);
  };

  const downloadExel = async () => {
    const dataObjectList = [];
    for (const file of docFiles) {
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
          <Steps current={currentStep}>
            <Step title="上传模板" description="" />
            <Step title="上传文档（批量）" description="" />
            <Step title="下载表格" description="" />
          </Steps>
        </div>
        <div className="step__content">
          {currentStep === 0 && (
            <div>
              {(templateFile && (
                <div>
                  <h3>{templateFile.name}</h3>
                  <ul>
                    {templateHeadings.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </div>
              )) || (
                <label className="ant-upload ant-upload-drag dragger">
                  <input type="file" accept=".doc,.docx" style={{ display: "none" }} onChange={onUploadTemplateFile} />
                  <div className="ant-upload-drag-container">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击上传</p>
                    <p className="ant-upload-hint">仅支持doc,docx文件</p>
                  </div>
                </label>
              )}
            </div>
          )}
          {currentStep === 1 && (
            <div style={{ maxHeight: "50%", overflow: "auto" }}>
              {(docFiles.length && (
                <ul>
                  {Array.prototype.map.call(docFiles, (file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              )) || (
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
                <Button type="dashed" style={{ display: templateFile ? "initial" : "none" }} onClick={() => setTemplateFile(null)}>
                  重新上传
                </Button>
                <Button type="primary" disabled={!templateFile} onClick={() => stepNext()}>
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
