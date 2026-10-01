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
/**
 * The notebook a sidebar context-menu command targets: an explicit `detail.bookId` when
 * dispatched programmatically, else the last notebook that was right-clicked — the store never
 * clears it, so a programmatic dispatch should pass `bookId`. `null` (no notebook right-clicked
 * yet) falls back to the regular wizard, which asks for a destination.
 */
function getContextMenuBookId(e) {
    return e.detail?.bookId ?? (0, env_js_1.getEnv)().store.getState().bookList.bookForContextMenu?._id ?? null;
}
const ImportMarkdownPlugin = () => {
    const [step, setStep] = (0, react_1.useState)('scanning');
    const [filePaths, setFilePaths] = (0, react_1.useState)([]);
    const [preview, setPreview] = (0, react_1.useState)(EMPTY_PREVIEW);
    const [selectedBookId, setSelectedBookId] = (0, react_1.useState)(null);
    const [isDestinationPreset, setIsDestinationPreset] = (0, react_1.useState)(false);
    const [status, setStatus] = (0, react_1.useState)('');
    const [processingFilePath, setProcessingFilePath] = (0, react_1.useState)('');
    const [importError, setImportError] = (0, react_1.useState)(null);
    const wizardDialog = (0, inkdrop_1.useModal)();
    const startWizard = (0, react_1.useCallback)(async (openDialog, destBookId = null) => {
        const { filePaths: pickedPaths } = await openDialog();
        if (!(pickedPaths instanceof Array) || pickedPaths.length === 0)
            return;
        inkdrop_1.logger.debug('[import-markdown] Picked files and directories:', pickedPaths);
        setFilePaths(pickedPaths);
        setSelectedBookId(destBookId);
        setIsDestinationPreset(destBookId !== null);
        setImportError(null);
        setStatus('Scanning files..');
        setStep('scanning');
        wizardDialog.show();
        setPreview(await (0, importer_js_1.previewImport)(pickedPaths));
        setStep('stats');
    }, [wizardDialog]);
    const showFileDialog = (0, react_1.useCallback)(() => startWizard(importer_js_1.openImportDialog), [startWizard]);
    const showFolderDialog = (0, react_1.useCallback)(() => startWizard(importer_js_1.openImportFolderDialog), [startWizard]);
    const showFileDialogForNotebook = (0, react_1.useCallback)((e) => startWizard(importer_js_1.openImportDialog, getContextMenuBookId(e)), [startWizard]);
    const showFolderDialogForNotebook = (0, react_1.useCallback)((e) => startWizard(importer_js_1.openImportFolderDialog, getContextMenuBookId(e)), [startWizard]);
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
    const handleNext = (0, react_1.useCallback)(() => {
        if (isDestinationPreset)
            handleImport();
        else
            setStep('notebook');
    }, [isDestinationPreset, handleImport]);
    (0, react_1.useEffect)(() => {
        const sub = (0, env_js_1.getEnv)().commands.add(document.body, {
            'import-markdown:import-from-file': {
                description: 'Import notes from Markdown files',
                didDispatch: showFileDialog
            },
            'import-markdown:import-from-directory': {
                description: 'Import notes from Markdown folders',
                didDispatch: showFolderDialog
            },
            'import-markdown:import-from-file-into-notebook': {
                description: 'Import notes from Markdown files into the selected notebook',
                hiddenInCommandPalette: true,
                didDispatch: showFileDialogForNotebook
            },
            'import-markdown:import-from-directory-into-notebook': {
                description: 'Import notes from Markdown folders into the selected notebook',
                hiddenInCommandPalette: true,
                didDispatch: showFolderDialogForNotebook
            }
        });
        return () => sub.dispose();
    }, [showFileDialog, showFolderDialog, showFileDialogForNotebook, showFolderDialogForNotebook]);
    return ((0, jsx_runtime_1.jsx)(import_wizard_dialog_js_1.ImportMarkdownWizardDialog, { modal: wizardDialog, step: step, status: status, preview: preview, isDestinationPreset: isDestinationPreset, selectedBookId: selectedBookId, importingFilePath: processingFilePath, importError: importError, onNext: handleNext, onBack: handleBack, onSelectNotebook: setSelectedBookId, onImport: handleImport }));
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
