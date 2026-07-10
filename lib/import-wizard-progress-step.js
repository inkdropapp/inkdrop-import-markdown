"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportWizardProgressStep = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const env_js_1 = require("./env.js");
const ImportWizardProgressStep = ({ status, importingFilePath, importError, onClose }) => {
    const Dialog = (0, env_js_1.getEnv)().components.classes.Dialog;
    if (importError) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Dialog.Content, { children: (0, jsx_runtime_1.jsxs)("div", { className: "ui error message", children: [(0, jsx_runtime_1.jsx)("div", { className: "header", children: "Failed to import the Markdown file" }), (0, jsx_runtime_1.jsxs)("p", { children: ["An unexpected error happened while processing \"", (0, jsx_runtime_1.jsx)("code", { children: importingFilePath }), "\"."] }), (0, jsx_runtime_1.jsx)("pre", { children: importError.stack })] }) }), (0, jsx_runtime_1.jsx)(Dialog.Actions, { className: "right aligned", children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onClose, children: "Close" }) })] }));
    }
    return ((0, jsx_runtime_1.jsx)(Dialog.Content, { children: (0, jsx_runtime_1.jsx)("div", { children: status }) }));
};
exports.ImportWizardProgressStep = ImportWizardProgressStep;
