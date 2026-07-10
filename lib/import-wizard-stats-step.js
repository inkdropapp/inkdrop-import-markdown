"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportWizardStatsStep = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const inkdrop_model_1 = require("inkdrop-model");
const env_js_1 = require("./env.js");
function formatFileSize(bytes) {
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
const NotebookPreviewItem = ({ node }) => {
    const StreamlineIcon = (0, env_js_1.getEnv)().components.classes.StreamlineIcon;
    return ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(StreamlineIcon, { name: "book-close-2", className: "notebook-icon inline" }), " ", node.name, (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(StreamlineIcon, { name: "common-file-text", className: "inline" }), " ", node.fileCount, "\u00A0", node.fileCount === 1 ? 'file' : 'files'] }), node.imageCount > 0 && ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(StreamlineIcon, { name: "picture-sun", className: "inline" }), " ", node.imageCount, "\u00A0", node.imageCount === 1 ? 'image' : 'images', " (", formatFileSize(node.imageSize), ")"] })), node.children.map(child => ((0, jsx_runtime_1.jsx)(NotebookPreviewItem, { node: child }, child.name)))] })] }));
};
const ImportWizardStatsStep = ({ preview, onCancel, onNext }) => {
    const Dialog = (0, env_js_1.getEnv)().components.classes.Dialog;
    const StreamlineIcon = (0, env_js_1.getEnv)().components.classes.StreamlineIcon;
    if (preview.oversizedFiles.length > 0) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dialog.Content, { overflow: "auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "ui error message", children: [(0, jsx_runtime_1.jsx)("div", { className: "header", children: "The following files are too large:" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Files larger than ", inkdrop_model_1.maxAttachmentFileSize / 1024 / 1024, " MB cannot be imported. Please remove them to proceed."] }), (0, jsx_runtime_1.jsx)("code", { children: preview.oversizedFiles.map(e => ((0, jsx_runtime_1.jsx)("div", { children: e }, e))) })] }) }), (0, jsx_runtime_1.jsx)(Dialog.Actions, { className: "right aligned", children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onCancel, children: "Close" }) })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(Dialog.Content, { overflow: "auto", children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Going to import ", (0, jsx_runtime_1.jsx)("strong", { children: preview.mdFileCount }), " Markdown file", preview.mdFileCount === 1 ? '' : 's', preview.imageCount > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["\u00A0and ", (0, jsx_runtime_1.jsx)("strong", { children: preview.imageCount }), " image", preview.imageCount === 1 ? '' : 's'] })), "\u00A0(", formatFileSize(preview.totalSize), " total):"] }), (preview.directFileCount > 0 || preview.notebooks.length > 0) && ((0, jsx_runtime_1.jsxs)("ul", { className: "ui message import-markdown-notebook-preview-list", children: [preview.directFileCount > 0 && ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(StreamlineIcon, { name: "common-file-text", className: "inline" }), ' ', preview.directFileCount, " file", preview.directFileCount === 1 ? '' : 's', " \u2014 no new notebook"] })), preview.notebooks.map(node => ((0, jsx_runtime_1.jsx)(NotebookPreviewItem, { node: node }, node.name)))] }))] }), (0, jsx_runtime_1.jsxs)(Dialog.Actions, { className: "space-between", children: [(0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onCancel, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "ui primary button", onClick: onNext, children: "Next" })] })] }));
};
exports.ImportWizardStatsStep = ImportWizardStatsStep;
