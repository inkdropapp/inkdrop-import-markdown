"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openImportDialog = openImportDialog;
exports.checkSizeOfFiles = checkSizeOfFiles;
exports.importMarkdownFromMultipleFilesAndDirectories = importMarkdownFromMultipleFilesAndDirectories;
exports.importMarkdownFromMultipleFiles = importMarkdownFromMultipleFiles;
exports.importMarkdownFromFile = importMarkdownFromFile;
const inkdrop_1 = require("inkdrop");
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const inkdrop_model_1 = require("inkdrop-model");
const glob_1 = require("glob");
const { Book } = inkdrop_1.models;
const isMacOS = process.platform === 'darwin';
const getDirectories = async (source) => (await fs_2.promises.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
function openImportDialog({ isFolderOnly }) {
    let properties = ['openDirectory', 'multiSelections'];
    if (!isFolderOnly) {
        if (isMacOS)
            properties.push('openFile');
        else
            properties = ['openFile', 'multiSelections'];
    }
    if (!isFolderOnly)
        properties.push('openFile');
    return inkdrop.dialog.showOpenDialog({
        title: 'Open Markdown file',
        properties,
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
}
function checkSizeOfFiles(filePaths) {
    const errors = [];
    let total = 0;
    for (const fp of filePaths) {
        const stats = fs_1.default.statSync(fp);
        if (stats.isDirectory()) {
            const files = glob_1.glob.sync(path_1.default.join(fp, '**/*.{md,png,jpg,jpeg,gif,svg}'));
            const [t, e] = checkSizeOfFiles(files);
            total += t;
            errors.push(...e);
        }
        else if (stats.isFile()) {
            if (stats.size > inkdrop_model_1.maxAttachmentFileSize) {
                errors.push(fp);
            }
        }
    }
    return [total, errors];
}
async function importMarkdownFromMultipleFilesAndDirectories(filePaths, destBookId, progressCallback, { root = false }) {
    inkdrop_1.logger.debug('Importing markdown files:', filePaths, { destBookId, root });
    for (const fp of filePaths) {
        const stats = fs_1.default.statSync(fp);
        const isDirectory = stats.isDirectory();
        if (!root)
            progressCallback(fp, { isDirectory });
        if (isDirectory) {
            const folderName = path_1.default.basename(fp);
            const shouldCreateNotebook = !root || filePaths.length > 1;
            let bookId = destBookId;
            if (shouldCreateNotebook) {
                const book = new Book({
                    name: folderName,
                    parentBookId: destBookId
                });
                await book.save();
                bookId = book._id;
            }
            const files = glob_1.glob.sync(path_1.default.join(fp, '*.md'));
            await importMarkdownFromMultipleFilesAndDirectories(files, bookId, progressCallback, { root: false });
            const dirs = (await getDirectories(fp)).map(name => path_1.default.join(fp, name));
            inkdrop_1.logger.debug('Subdirectories:', dirs);
            await importMarkdownFromMultipleFilesAndDirectories(dirs, bookId, progressCallback, { root: false });
        }
        else if (stats.isFile() && destBookId !== null) {
            await importMarkdownFromMultipleFiles([fp], destBookId);
        }
        else {
            inkdrop_1.logger.debug('Skipping:', fp, { destBookId, root });
        }
    }
}
async function importMarkdownFromMultipleFiles(files, destBookId) {
    for (let i = 0; i < files.length; ++i) {
        await importMarkdownFromFile(files[i], destBookId);
    }
}
async function importMarkdownFromFile(fn, destBookId) {
    return inkdrop_1.importUtils.importMarkdownFile(fn, destBookId);
}
