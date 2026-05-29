"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const inkdrop_model_1 = require("inkdrop-model");
const ImportMarkdownProgressDialog = ({ modal, tooLargeFiles, status, importingFilePath, importError }) => {
    const AnyDialog = inkdrop.components.classes.Dialog;
    let content = ((0, jsx_runtime_1.jsx)(AnyDialog.Content, { children: (0, jsx_runtime_1.jsx)("div", { children: status }) }));
    if (tooLargeFiles.length > 0) {
        content = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(AnyDialog.Content, { children: (0, jsx_runtime_1.jsxs)("div", { className: "ui error message", children: [(0, jsx_runtime_1.jsx)("div", { className: "header", children: "The following files are too large:" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Files larger than ", inkdrop_model_1.maxAttachmentFileSize / 1024 / 1024, " MB cannot be imported. Please remove them to proceed."] }), (0, jsx_runtime_1.jsx)("pre", { children: tooLargeFiles.map(e => ((0, jsx_runtime_1.jsx)("div", { children: e }, e))) })] }) }), (0, jsx_runtime_1.jsx)(AnyDialog.Actions, { className: "right aligned", children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: modal.close, children: "Close" }) })] }));
    }
    if (importError) {
        content = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(AnyDialog.Content, { children: (0, jsx_runtime_1.jsxs)("div", { className: "ui error message", children: [(0, jsx_runtime_1.jsx)("div", { className: "header", children: "Failed to import the Markdown file" }), (0, jsx_runtime_1.jsxs)("p", { children: ["An unexpected error happened while processing \"", (0, jsx_runtime_1.jsx)("code", { children: importingFilePath }), "\"."] }), (0, jsx_runtime_1.jsx)("pre", { children: importError.stack })] }) }), (0, jsx_runtime_1.jsx)(AnyDialog.Actions, { className: "right aligned", children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: modal.close, children: "Close" }) })] }));
    }
    return ((0, jsx_runtime_1.jsx)(AnyDialog, { ...modal.state, className: "import-markdown-progress-dialog", children: content }));
};
exports.default = ImportMarkdownProgressDialog;
