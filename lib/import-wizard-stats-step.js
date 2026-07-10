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
const ImportWizardStatsStep = ({ fileCount, totalSize, tooLargeFiles, onCancel, onNext }) => {
    const Dialog = (0, env_js_1.getEnv)().components.classes.Dialog;
    if (tooLargeFiles.length > 0) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dialog.Content, { children: (0, jsx_runtime_1.jsxs)("div", { className: "ui error message", children: [(0, jsx_runtime_1.jsx)("div", { className: "header", children: "The following files are too large:" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Files larger than ", inkdrop_model_1.maxAttachmentFileSize / 1024 / 1024, " MB cannot be imported. Please remove them to proceed."] }), (0, jsx_runtime_1.jsx)("pre", { children: tooLargeFiles.map(e => ((0, jsx_runtime_1.jsx)("div", { children: e }, e))) })] }) }), (0, jsx_runtime_1.jsx)(Dialog.Actions, { className: "right aligned", children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onCancel, children: "Close" }) })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dialog.Content, { children: (0, jsx_runtime_1.jsxs)("div", { children: ["Found ", fileCount, " Markdown file", fileCount === 1 ? '' : 's', " (", formatFileSize(totalSize), ")."] }) }), (0, jsx_runtime_1.jsxs)(Dialog.Actions, { className: "right aligned", children: [(0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onCancel, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "ui primary button", onClick: onNext, children: "Next" })] })] }));
};
exports.ImportWizardStatsStep = ImportWizardStatsStep;
