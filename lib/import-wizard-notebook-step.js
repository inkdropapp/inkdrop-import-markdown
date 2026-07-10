"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportWizardNotebookStep = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const env_js_1 = require("./env.js");
const ImportWizardNotebookStep = ({ selectedBookId, onSelectNotebook, onBack, onCancel, onImport }) => {
    const Dialog = (0, env_js_1.getEnv)().components.classes.Dialog;
    const NotebookListBar = (0, env_js_1.getEnv)().components.classes.NotebookListBar;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(Dialog.Content, { flex: true, children: [(0, jsx_runtime_1.jsx)("div", { className: "ui message", style: { flex: '0 0' }, children: "Please select a target notebook" }), (0, jsx_runtime_1.jsx)(NotebookListBar, { onItemSelect: onSelectNotebook })] }), (0, jsx_runtime_1.jsxs)(Dialog.Actions, { className: "space-between", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onCancel, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: onBack, children: "Back" })] }), (0, jsx_runtime_1.jsx)("button", { className: "ui primary button", disabled: !selectedBookId, onClick: onImport, children: "Import" })] })] }));
};
exports.ImportWizardNotebookStep = ImportWizardNotebookStep;
