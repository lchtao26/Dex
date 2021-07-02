# Dex

Dex是一个针对Word文档的文本解析工具，通过创建不同的匹配规则，可以将解析出的数据，导出到Exel表格中，适用于职场简历、申请书、报告等场景的批量归档

[网页版](dex.niuniuco.cn)

## 使用方法

### 1. 添加匹配规则
- 字段名：为解析出的数据命名，作为导出Exel的其中一个表头
- 选择边界：通过定义开始、结束边界设定范围，边界之间的文本内容会截取出，作为解析出的数据

### 2. 上传Word文档
- 每份上传的文档会按照规则解析成一行Exel数据，保存到最后的结果中
- 支持批量上传

### 3. 下载Exel表格

### 安装

Dex支持打包成Web版本，同时支持编译成Max、Windows应用


# 打包Web版本 => build文件夹
npm run build
```

```bash
# 编译MacOS应用 => output文件夹
npm run pack:mac
```

```bash
# 编译Windows应用 => output文件夹
npm run pack:win
```
