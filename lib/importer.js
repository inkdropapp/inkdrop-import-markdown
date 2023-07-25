const fs = require('fs')
const {
  promises: { readdir }
} = require('fs')
const path = require('path')
const remote = require('@electron/remote')
const { models, importUtils } = require('inkdrop')
const glob = require('glob')
const { dialog } = remote
const { Book } = models
const { maxAttachmentFileSize } = require('inkdrop-model')

module.exports = {
  openImportDialog,
  checkSizeOfFiles,
  importMarkdownFromMultipleFilesAndDirectories,
  importMarkdownFromMultipleFiles,
  importMarkdownFromFile
}

const isMacOS = process.platform === 'darwin'

const getDirectories = async source =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

function openImportDialog({ isFolderOnly }) {
  let properties = ['openDirectory', 'multiSelections']
  if (!isFolderOnly) {
    if (isMacOS) properties.push('openFile')
    else properties = ['openFile', 'multiSelections']
  }

  if (!isFolderOnly) properties.push('openFile')
  return dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties,
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
}

function checkSizeOfFiles(filePaths) {
  const errors = []
  let total = 0
  for (const fp of filePaths) {
    const stats = fs.statSync(fp)
    if (stats.isDirectory()) {
      const files = glob.sync(path.join(fp, '**/*.{md,png,jpg,jpeg,gif,svg}'))
      const [t, e] = checkSizeOfFiles(files)
      total += t
      errors.push(...e)
    } else if (stats.isFile()) {
      if (stats.size > maxAttachmentFileSize) {
        errors.push(fp)
      }
    }
  }
  return [total, errors]
}

async function importMarkdownFromMultipleFilesAndDirectories(
  filePaths,
  destBookId,
  progressCallback,
  { root = false }
) {
  for (const fp of filePaths) {
    const stats = fs.statSync(fp)
    progressCallback(fp)

    if (stats.isDirectory()) {
      const folderName = path.basename(fp)
      const shouldCreateNotebook = !root || filePaths.length > 1
      let bookId = destBookId
      if (shouldCreateNotebook) {
        const book = new Book({
          name: folderName,
          parentBookId: destBookId
        })
        await book.save()
        bookId = book._id
      }
      const files = glob.sync(path.join(fp, '*.md'))
      await importMarkdownFromMultipleFilesAndDirectories(
        files,
        bookId,
        progressCallback,
        { root: false }
      )

      const dirs = (await getDirectories(fp)).map(name => path.join(fp, name))
      await importMarkdownFromMultipleFilesAndDirectories(
        dirs,
        bookId,
        progressCallback,
        { root: false }
      )
    } else if (stats.isFile() && destBookId !== null) {
      await importMarkdownFromMultipleFiles([fp], destBookId)
    }
  }
}

async function importMarkdownFromMultipleFiles(files, destBookId) {
  for (let i = 0; i < files.length; ++i) {
    await importMarkdownFromFile(files[i], destBookId)
  }
}

async function importMarkdownFromFile(fn, destBookId) {
  return importUtils.importMarkdownFile(fn, destBookId)
}
