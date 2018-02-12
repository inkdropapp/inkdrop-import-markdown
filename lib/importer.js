'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openImportDialog = openImportDialog;
exports.importMarkdownFromMultipleFiles = importMarkdownFromMultipleFiles;
exports.importMarkdownFromFile = importMarkdownFromFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _electron = require('electron');

var _utf8BinaryCutter = require('utf8-binary-cutter');

var _utf8BinaryCutter2 = _interopRequireDefault(_utf8BinaryCutter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { dialog } = _electron.remote;
const { Note } = inkdrop.models;

function openImportDialog() {
  return dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'txt'] }]
  });
}

async function importMarkdownFromMultipleFiles(files, destBookId) {
  try {
    for (let i = 0; i < files.length; ++i) {
      await importMarkdownFromFile(files[i], destBookId);
    }
  } catch (e) {
    inkdrop.notifications.addError('Failed to import the Markdown file', { detail: e.stack, dismissable: true });
  }
}

/*
 wri.pe: https://wri.pe/
 If the file was exported from 'wri.pe',
 the first line should be truncated from its body
 and be treated as a title.
 */
function isWripeFormat(fn) {
  return (/page-\d+\.txt/.test(_path2.default.basename(fn))
  );
}

function getTitleAndBodyFromMarkdown(fn, markDown) {
  const [firstLine, ...restLines] = markDown.split('\n');
  const title = _utf8BinaryCutter2.default.truncateToBinarySize(firstLine.replace(/^#+\s*/, ''), 128);
  if (isWripeFormat(fn)) {
    return { title: title, body: restLines.join('\n') };
  } else {
    return { title: title, body: markDown };
  }
}

function getMetaFromMarkdown(body) {
  const meta = {
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  return meta;
}

async function importMarkdownFromFile(fn, destBookId) {
  if (!destBookId) {
    throw new Error('Destination notebook ID is not specified.');
  }
  const markDown = _fs2.default.readFileSync(fn, 'utf-8');
  const { title, body } = getTitleAndBodyFromMarkdown(fn, markDown);
  const { tags, createdAt, updatedAt } = getMetaFromMarkdown(body);
  const note = new Note({ title: title, body, tags, createdAt, updatedAt });
  note.bookId = destBookId;
  await note.save();
}