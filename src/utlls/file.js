const importFiles = (attrs = {}) => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    for (const attr in attrs) {
      input[attr] = attrs[attr];
    }
    input.onchange = (e) => {
      resolve(e.target.files);
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
