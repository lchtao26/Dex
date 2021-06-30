const importFiles = (attrs = {}) => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    for (const attr in attrs) {
      input[attr] = attrs[attr];
    }
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

export { importFiles, readFileAsText };
