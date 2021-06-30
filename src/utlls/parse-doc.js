import mammoth from "mammoth";

const convertDocToHTML = async (arrayBuffer) => {
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
};

const convertDocToRawText = async (arrayBuffer) => {
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const convertHTMLToDOM = (html) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return dom;
};

/**
 * @param {File} docFile
 */
const createDocParser = async (docFile) => {
  const arrayBuffer = await docFile.arrayBuffer();
  const rawText = await convertDocToRawText(arrayBuffer);
  const html = await convertDocToHTML(arrayBuffer);
  const dom = convertHTMLToDOM(html);

  const findKeywordByParagraphIdx = (number) => {
    const nodes = Array.from(dom.childNodes);
    nodes.unshift({}); // 添加一个空的节点在开头, 使得 nodes[1] 代表第一个非空节点
    nodes.push({}); // 添加一个空的节点在末尾, 使得 nodes.reverse()[1] 代表第一个非空节点

    if (number < 0) {
      const reverseNodes = nodes.reverse();
      const absNumber = Math.abs(number);
      return reverseNodes[absNumber].textContent;
    }

    return nodes[number].textContent;
  };

  const normalizePositionToKeyword = (position) => {
    if (typeof position === "number") return findKeywordByParagraphIdx(position);
    if (typeof position === "string") return position;
    throw TypeError("Invalid argument type, argument should be string or number.");
  };

  /** @param {string} matchFrom
  /** @param {string} matchTo
  /** @param {boolean} isIncludeFrom
  /** @param {boolean} isIncludeTo
   *
   */
  const getMatchRegexByIncludeRule = (matchFrom, matchTo, isIncludeFrom, isIncludeTo) => {
    if (isIncludeFrom && isIncludeTo) {
      // 匹配:左闭右闭 [from, to]
      return new RegExp(`\n(${matchFrom}[^]*\n${matchTo})`);
    }

    if (!isIncludeFrom && !isIncludeTo) {
      // 匹配:左开右开 (from, to)
      return new RegExp(`\n${matchFrom}([^]*)\n${matchTo}`);
    }

    if (!isIncludeFrom && isIncludeTo) {
      // 匹配:左开右闭 (from, to]
      return new RegExp(`\n${matchFrom}([^]*\n${matchTo})`);
    }

    if (isIncludeFrom && !isIncludeTo) {
      // 匹配:左闭右开 [from, to]
      return new RegExp(`\n(${matchFrom}[^]*)\n${matchTo}`);
    }
  };

  const parse = ({ from, to, isIncludeFrom = false, isIncludeTo = false }) => {
    const fromKw = normalizePositionToKeyword(from);
    const toKw = normalizePositionToKeyword(to);
    const regex = getMatchRegexByIncludeRule(fromKw, toKw, isIncludeFrom, isIncludeTo);

    // \n: 在rawText文本前加入空行，是为了适配预设的regex规则
    const matched = regex.exec("\n" + rawText);
    return matched && matched[1];
  };

  return {
    parse,
  };
};

export { createDocParser };
