"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openImportDialog = openImportDialog;
exports.importMarkdownFromMultipleFiles = importMarkdownFromMultipleFiles;
exports.importMarkdownFromFile = importMarkdownFromFile;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _electron = require("electron");

var _inkdrop = require("inkdrop");

var _utf8BinaryCutter = _interopRequireDefault(require("utf8-binary-cutter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  dialog
} = _electron.remote;
const {
  Note
} = _inkdrop.models;

function openImportDialog() {
  return dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: 'Markdown Files',
      extensions: ['md', 'txt']
    }]
  });
}

async function importMarkdownFromMultipleFiles(files, destBookId) {
  try {
    for (let i = 0; i < files.length; ++i) {
      await importMarkdownFromFile(files[i], destBookId);
    }
  } catch (e) {
    inkdrop.notifications.addError('Failed to import the Markdown file', {
      detail: e.stack,
      dismissable: true
    });
  }
}
/*
 wri.pe: https://wri.pe/
 If the file was exported from 'wri.pe',
 the first line should be truncated from its body
 and be treated as a title.
 */


function isWripeFormat(fn) {
  return /page-\d+\.txt/.test(_path.default.basename(fn));
}

function getTitleAndBodyFromMarkdown(fn, markDown) {
  const [firstLine, ...restLines] = markDown.split('\n');

  const title = _utf8BinaryCutter.default.truncateToBinarySize(firstLine.replace(/^#+\s*/, ''), 128);

  if (isWripeFormat(fn)) {
    return {
      title: title,
      body: restLines.join('\n')
    };
  } else {
    return {
      title: title,
      body: markDown
    };
  }
}

function getMetaFromMarkdown(fn) {
  const stats = _fs.default.statSync(fn);

  const meta = {
    tags: [],
    createdAt: stats.mtimeMs,
    updatedAt: stats.birthtimeMs
  };
  return meta;
}

async function importMarkdownFromFile(fn, destBookId) {
  if (!destBookId) {
    throw new Error('Destination notebook ID is not specified.');
  }

  const markDown = _fs.default.readFileSync(fn, 'utf-8');

  const {
    title,
    body
  } = getTitleAndBodyFromMarkdown(fn, markDown);
  const {
    tags,
    createdAt,
    updatedAt
  } = getMetaFromMarkdown(fn);
  const note = new Note({
    title: title,
    body,
    tags,
    createdAt,
    updatedAt
  });
  note.bookId = destBookId;
  await note.save();
}