import xlsx from "xlsx";

const exportDataObjectsToExel = (dataObjects, name) => {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(dataObjects);
  xlsx.utils.book_append_sheet(wb, ws);
  xlsx.writeFile(wb, name);
};

export {
  exportDataObjectsToExel
}
