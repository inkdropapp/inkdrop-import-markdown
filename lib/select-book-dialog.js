"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ImportMarkdownSelectNotebookDialog = ({ modal, onSelect }) => {
    const NotebookListBar = inkdrop.components.classes.NotebookListBar;
    const Dialog = inkdrop.components.classes.Dialog;
    return ((0, jsx_runtime_1.jsxs)(Dialog, { ...modal.state, large: true, onBackdropClick: modal.close, onEscKeyDown: modal.close, className: "import-markdown-select-notebook-dialog", children: [(0, jsx_runtime_1.jsx)(Dialog.Title, { children: "Import Notes from Markdown" }), (0, jsx_runtime_1.jsxs)(Dialog.Content, { flex: true, children: [(0, jsx_runtime_1.jsx)("div", { className: "ui message", style: { flex: '0 0' }, children: "Please select a notebook" }), (0, jsx_runtime_1.jsx)(NotebookListBar, { showRoot: true, onItemSelect: onSelect })] }), (0, jsx_runtime_1.jsx)(Dialog.Actions, { children: (0, jsx_runtime_1.jsx)("button", { className: "ui button", onClick: modal.close, children: "Cancel" }) })] }));
};
exports.default = ImportMarkdownSelectNotebookDialog;
