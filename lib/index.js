"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const path_1 = __importDefault(require("path"));
const inkdrop_1 = require("inkdrop");
const react_1 = require("react");
const env_js_1 = require("./env.js");
const import_wizard_dialog_js_1 = require("./import-wizard-dialog.js");
const importer_js_1 = require("./importer.js");
const EMPTY_PREVIEW = {
    directFileCount: 0,
    notebooks: [],
    mdFileCount: 0,
    imageCount: 0,
    imageSize: 0,
    totalSize: 0,
    oversizedFiles: []
};
const ImportMarkdownPlugin = () => {
    const [step, setStep] = (0, react_1.useState)('scanning');
    const [filePaths, setFilePaths] = (0, react_1.useState)([]);
    const [preview, setPreview] = (0, react_1.useState)(EMPTY_PREVIEW);
    const [selectedBookId, setSelectedBookId] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)('');
    const [processingFilePath, setProcessingFilePath] = (0, react_1.useState)('');
    const [importError, setImportError] = (0, react_1.useState)(null);
    const wizardDialog = (0, inkdrop_1.useModal)();
    const showDialog = (0, react_1.useCallback)(async () => {
        const { filePaths: pickedPaths } = await (0, importer_js_1.openImportDialog)();
        if (!(pickedPaths instanceof Array) || pickedPaths.length === 0)
            return;
        inkdrop_1.logger.debug('[import-markdown] Picked files and directories:', pickedPaths);
        setFilePaths(pickedPaths);
        setSelectedBookId(null);
        setImportError(null);
        setStatus('Scanning files..');
        setStep('scanning');
        wizardDialog.show();
        setPreview(await (0, importer_js_1.previewImport)(pickedPaths));
        setStep('stats');
    }, [wizardDialog]);
    const handleNext = (0, react_1.useCallback)(() => {
        setStep('notebook');
    }, []);
    const handleBack = (0, react_1.useCallback)(() => {
        setStep('stats');
    }, []);
    const handleImport = (0, react_1.useCallback)(async () => {
        setStep('progress');
        setStatus('Importing files..');
        try {
            let noteCount = 0;
            await (0, importer_js_1.importMarkdownFromMultipleFilesAndDirectories)(filePaths, selectedBookId, (filePath, { isDirectory }) => {
                setProcessingFilePath(filePath);
                setStatus(`Importing file.. ${path_1.default.basename(filePath)}`);
                if (!isDirectory)
                    ++noteCount;
            }, { root: true });
            (0, env_js_1.getEnv)().notifications.addSuccess('Import Markdown files', {
                detail: `Successfully imported ${noteCount} Markdown files!`,
                dismissable: true
            });
            wizardDialog.close();
        }
        catch (e) {
            setImportError(e instanceof Error ? e : new Error(String(e)));
        }
    }, [filePaths, selectedBookId, wizardDialog]);
    (0, react_1.useEffect)(() => {
        const sub = (0, env_js_1.getEnv)().commands.add(document.body, {
            'import-markdown:import-from-file': showDialog
        });
        return () => sub.dispose();
    }, [showDialog]);
    return ((0, jsx_runtime_1.jsx)(import_wizard_dialog_js_1.ImportMarkdownWizardDialog, { modal: wizardDialog, step: step, status: status, preview: preview, selectedBookId: selectedBookId, importingFilePath: processingFilePath, importError: importError, onNext: handleNext, onBack: handleBack, onSelectNotebook: setSelectedBookId, onImport: handleImport }));
};
class InkdropPlugin {
    activate(env) {
        (0, env_js_1.setEnv)(env);
        env.components.registerClass(ImportMarkdownPlugin);
        env.layouts.addComponentToLayout('modal', 'ImportMarkdownPlugin');
    }
    deactivate(env) {
        env.layouts.removeComponentFromLayout('modal', 'ImportMarkdownPlugin');
        env.components.deleteClass(ImportMarkdownPlugin);
        (0, env_js_1.setEnv)(undefined);
    }
}
exports.default = new InkdropPlugin();
