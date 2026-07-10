"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openImportDialog = openImportDialog;
exports.previewImport = previewImport;
exports.importMarkdownFromMultipleFilesAndDirectories = importMarkdownFromMultipleFilesAndDirectories;
exports.importMarkdownFromMultipleFiles = importMarkdownFromMultipleFiles;
exports.importMarkdownFromFile = importMarkdownFromFile;
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const inkdrop_1 = require("inkdrop");
const inkdrop_model_1 = require("inkdrop-model");
const env_js_1 = require("./env.js");
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
    return (0, env_js_1.getEnv)().dialog.showOpenDialog({
        title: 'Open Markdown file',
        properties,
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
}
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg']);
function classifyFile(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (ext === '.md')
        return 'md';
    if (IMAGE_EXTENSIONS.has(ext))
        return 'image';
    return null;
}
function emptyTotals() {
    return { mdFileCount: 0, imageCount: 0, imageSize: 0, totalSize: 0, oversizedFiles: [] };
}
function mergeTotals(a, b) {
    return {
        mdFileCount: a.mdFileCount + b.mdFileCount,
        imageCount: a.imageCount + b.imageCount,
        imageSize: a.imageSize + b.imageSize,
        totalSize: a.totalSize + b.totalSize,
        oversizedFiles: [...a.oversizedFiles, ...b.oversizedFiles]
    };
}
/**
 * Classifies a single file's contribution to the running md/image counts and sizes.
 * Files that are neither markdown nor an image (e.g. `.enex`, `.DS_Store`) are never imported,
 * so they're ignored entirely here — including skipping the oversized-size check.
 */
function totalsForFile(filePath, size) {
    const kind = classifyFile(filePath);
    const oversizedFiles = kind && size > inkdrop_model_1.maxAttachmentFileSize ? [filePath] : [];
    if (kind === 'md')
        return { ...emptyTotals(), mdFileCount: 1, totalSize: size, oversizedFiles };
    if (kind === 'image') {
        return { ...emptyTotals(), imageCount: 1, imageSize: size, totalSize: size, oversizedFiles };
    }
    return emptyTotals();
}
/**
 * Recursively scans a directory, building both its notebook-preview node and the aggregate
 * md/image counts and sizes for everything under it, in a single filesystem pass per directory.
 * `node.fileCount` stays direct-children-only (matching the notebook that will actually be
 * created for this folder); the returned totals are recursive, for the caller to bubble up.
 */
async function scanDirectory(dirPath) {
    const entries = await fs_2.promises.readdir(dirPath, { withFileTypes: true });
    const directTotals = entries
        .filter(entry => entry.isFile())
        .reduce((totals, entry) => {
        const entryPath = path_1.default.join(dirPath, entry.name);
        return mergeTotals(totals, totalsForFile(entryPath, fs_1.default.statSync(entryPath).size));
    }, emptyTotals());
    const children = [];
    let totals = directTotals;
    for (const entry of entries.filter(e => e.isDirectory())) {
        const child = await scanDirectory(path_1.default.join(dirPath, entry.name));
        children.push(child.node);
        totals = mergeTotals(totals, child.totals);
    }
    return {
        node: {
            name: path_1.default.basename(dirPath),
            fileCount: directTotals.mdFileCount,
            imageCount: directTotals.imageCount,
            imageSize: directTotals.imageSize,
            children
        },
        totals
    };
}
/**
 * Previews the notebook structure, per-type file counts, and sizes that
 * `importMarkdownFromMultipleFilesAndDirectories` will produce, without touching the database.
 *
 * Mirrors that function's `shouldCreateNotebook` branching exactly: a single top-level folder
 * pick does not become its own notebook (its direct files + subfolders land under the
 * destination notebook), while every other folder — nested, or part of a multi-item pick —
 * becomes its own notebook. Keep this in sync if that branching changes.
 */
async function previewImport(filePaths) {
    const notebooks = [];
    let directFileCount = 0;
    let totals = emptyTotals();
    const isSingleFolderPick = filePaths.length === 1 && fs_1.default.statSync(filePaths[0]).isDirectory();
    for (const fp of filePaths) {
        const stats = fs_1.default.statSync(fp);
        if (stats.isDirectory()) {
            if (isSingleFolderPick) {
                const entries = await fs_2.promises.readdir(fp, { withFileTypes: true });
                for (const entry of entries) {
                    const entryPath = path_1.default.join(fp, entry.name);
                    if (entry.isFile()) {
                        const fileTotals = totalsForFile(entryPath, fs_1.default.statSync(entryPath).size);
                        directFileCount += fileTotals.mdFileCount;
                        totals = mergeTotals(totals, fileTotals);
                    }
                    else if (entry.isDirectory()) {
                        const child = await scanDirectory(entryPath);
                        notebooks.push(child.node);
                        totals = mergeTotals(totals, child.totals);
                    }
                }
            }
            else {
                const child = await scanDirectory(fp);
                notebooks.push(child.node);
                totals = mergeTotals(totals, child.totals);
            }
        }
        else if (stats.isFile()) {
            // A loose top-level file pick always gets imported directly regardless of extension
            // (matches importMarkdownFromMultipleFilesAndDirectories's unconditional file branch).
            directFileCount += 1;
            totals = mergeTotals(totals, {
                mdFileCount: 1,
                imageCount: 0,
                imageSize: 0,
                totalSize: stats.size,
                oversizedFiles: stats.size > inkdrop_model_1.maxAttachmentFileSize ? [fp] : []
            });
        }
    }
    const baseDir = filePaths.length > 0 ? path_1.default.dirname(filePaths[0]) : '';
    return {
        directFileCount,
        notebooks,
        ...totals,
        oversizedFiles: totals.oversizedFiles.map(fp => path_1.default.relative(baseDir, fp))
    };
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
            await importMarkdownFromMultipleFilesAndDirectories(files, bookId, progressCallback, {
                root: false
            });
            const dirs = (await getDirectories(fp)).map(name => path_1.default.join(fp, name));
            inkdrop_1.logger.debug('Subdirectories:', dirs);
            await importMarkdownFromMultipleFilesAndDirectories(dirs, bookId, progressCallback, {
                root: false
            });
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
