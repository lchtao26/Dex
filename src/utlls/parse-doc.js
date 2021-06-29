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

  const normalizePositionToKeyword = (position) => {
    if (typeof position === "number") return dom.childNodes[position].textContent;
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
      return new RegExp(`\\n(${matchFrom}[^]*\\n${matchTo})`);
    }

    if (!isIncludeFrom && !isIncludeTo) {
      // 匹配:左开右开 (from, to)
      return new RegExp(`\\n${matchFrom}([^]*)\\n${matchTo}`);
    }

    if (!isIncludeFrom && isIncludeTo) {
      // 匹配:左开右闭 (from, to]
      return new RegExp(`\\n${matchFrom}([^]*\\n${matchTo})`);
    }

    if (isIncludeFrom && !isIncludeTo) {
      // 匹配:左闭右开 [from, to]
      return new RegExp(`\\n(${matchFrom}[^]*)\\n${matchTo}`);
    }
  };

  /**
   * @param {string | number} from
   * @param {string | number} to
   *
   */
  const parse = ({ from, to, isIncludeFrom = false, isIncludeTo = false }) => {
    const fromKw = normalizePositionToKeyword(from);
    const toKw = normalizePositionToKeyword(to);
    const regex = getMatchRegexByIncludeRule(fromKw, toKw, isIncludeFrom, isIncludeTo);

    const matched = rawText.match(regex);
    console.log(matched, {regex})
    return matched && matched[1]
  };

  return {
    parse,
  };
};

export { createDocParser };
