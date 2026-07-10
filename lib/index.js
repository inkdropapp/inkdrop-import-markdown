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
const importer_js_1 = require("./importer.js");
const progress_dialog_js_1 = __importDefault(require("./progress-dialog.js"));
const select_book_dialog_js_1 = __importDefault(require("./select-book-dialog.js"));
const ImportMarkdownPlugin = () => {
    const [status, setStatus] = (0, react_1.useState)('');
    const [tooLargeFiles, setTooLargeFiles] = (0, react_1.useState)([]);
    const [processingFilePath, setProcessingFilePath] = (0, react_1.useState)('');
    const [importError, setImportError] = (0, react_1.useState)(null);
    const selectNotebookDialog = (0, inkdrop_1.useModal)();
    const progressDialog = (0, inkdrop_1.useModal)();
    const showDialog = (0, react_1.useCallback)(() => {
        selectNotebookDialog.show();
    }, [selectNotebookDialog]);
    const handleNotebookSelected = (0, react_1.useCallback)(async (destBookId) => {
        const { filePaths } = await (0, importer_js_1.openImportDialog)({
            isFolderOnly: destBookId === null
        });
        if (filePaths instanceof Array && filePaths.length > 0) {
            setStatus('Scanning files..');
            progressDialog.show();
            const [, fileErrors] = (0, importer_js_1.checkSizeOfFiles)(filePaths);
            if (fileErrors.length > 0) {
                setTooLargeFiles(fileErrors);
            }
            else {
                try {
                    selectNotebookDialog.close();
                    setStatus('Importing files..');
                    let noteCount = 0;
                    await (0, importer_js_1.importMarkdownFromMultipleFilesAndDirectories)(filePaths, destBookId, (filePath, { isDirectory }) => {
                        setProcessingFilePath(filePath);
                        setStatus(`Importing file.. ${path_1.default.basename(filePath)}`);
                        if (!isDirectory)
                            ++noteCount;
                    }, { root: true });
                    (0, env_js_1.getEnv)().notifications.addSuccess('Import Markdown files', {
                        detail: `Successfully imported ${noteCount} Markdown files!`,
                        dismissable: true
                    });
                    progressDialog.close();
                }
                catch (e) {
                    setImportError(e instanceof Error ? e : new Error(String(e)));
                }
            }
        }
    }, [progressDialog, selectNotebookDialog]);
    (0, react_1.useEffect)(() => {
        const sub = (0, env_js_1.getEnv)().commands.add(document.body, {
            'import-markdown:import-from-file': showDialog
        });
        return () => sub.dispose();
    }, [showDialog]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(select_book_dialog_js_1.default, { modal: selectNotebookDialog, onSelect: handleNotebookSelected }), (0, jsx_runtime_1.jsx)(progress_dialog_js_1.default, { modal: progressDialog, status: status, tooLargeFiles: tooLargeFiles, importingFilePath: processingFilePath, importError: importError })] }));
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
