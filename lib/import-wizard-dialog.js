"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportMarkdownWizardDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const env_js_1 = require("./env.js");
const import_wizard_notebook_step_js_1 = require("./import-wizard-notebook-step.js");
const import_wizard_progress_step_js_1 = require("./import-wizard-progress-step.js");
const import_wizard_scanning_step_js_1 = require("./import-wizard-scanning-step.js");
const import_wizard_stats_step_js_1 = require("./import-wizard-stats-step.js");
const ImportMarkdownWizardDialog = ({ modal, step, status, preview, selectedBookId, importingFilePath, importError, onNext, onBack, onSelectNotebook, onImport }) => {
    const Dialog = (0, env_js_1.getEnv)().components.classes.Dialog;
    return ((0, jsx_runtime_1.jsxs)(Dialog, { ...modal.state, large: true, onBackdropClick: modal.close, onEscKeyDown: modal.close, className: `import-markdown-wizard-dialog import-markdown-wizard-dialog--${step}`, children: [(0, jsx_runtime_1.jsx)(Dialog.Title, { children: "Import Notes from Markdown" }), step === 'scanning' && (0, jsx_runtime_1.jsx)(import_wizard_scanning_step_js_1.ImportWizardScanningStep, { status: status, onCancel: modal.close }), step === 'stats' && ((0, jsx_runtime_1.jsx)(import_wizard_stats_step_js_1.ImportWizardStatsStep, { preview: preview, onCancel: modal.close, onNext: onNext })), step === 'notebook' && ((0, jsx_runtime_1.jsx)(import_wizard_notebook_step_js_1.ImportWizardNotebookStep, { selectedBookId: selectedBookId, onSelectNotebook: onSelectNotebook, onBack: onBack, onCancel: modal.close, onImport: onImport })), step === 'progress' && ((0, jsx_runtime_1.jsx)(import_wizard_progress_step_js_1.ImportWizardProgressStep, { status: status, importingFilePath: importingFilePath, importError: importError, onClose: modal.close }))] }));
};
exports.ImportMarkdownWizardDialog = ImportMarkdownWizardDialog;
