const fs = require('fs')
const {
  promises: { readdir }
} = require('fs')
const path = require('path')
const remote = require('@electron/remote')
const { models } = require('inkdrop')
const {
  getTitleAndBodyFromMarkdown,
  getMetaFromMarkdown,
  extractImages
} = require('inkdrop-import-utils')
const escapeRegExp = require('lodash.escaperegexp')
const glob = require('glob')
const { dialog } = remote
const { Note, Book, File: IDFile } = models
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

async function importImages(md, basePath) {
  const images = extractImages(md)
  for (const image of images) {
    const imagePath = path.resolve(basePath, decodeURIComponent(image.url))
    if (fs.existsSync(imagePath)) {
      try {
        const file = await IDFile.createFromFilePath(imagePath)
        const imageRegex = new RegExp(
          escapeRegExp(`![${image.alt || ''}](${image.url})`),
          'g'
        )
        md = md.replace(
          imageRegex,
          `![${image.alt || ''}](inkdrop://${file._id})`
        )
      } catch (e) {
        inkdrop.notifications.addError('Failed to import an image', {
          detail: `${imagePath}: ${e.message}`,
          dismissable: true
        })
      }
    }
  }
  return md
}

async function importMarkdownFromFile(fn, destBookId) {
  if (!destBookId) {
    throw new Error('Destination notebook ID is not specified.')
  }
  const markDown = fs.readFileSync(fn, 'utf-8')
  const { title, body } = getTitleAndBodyFromMarkdown(fn, markDown)
  const { tags, createdAt, updatedAt } = getMetaFromMarkdown(fn)
  // remove leading empty lines
  const trimmedBody = body.replace(/^\n+/g, '')
  const basePath = path.dirname(fn)
  const bodyWithImages = await importImages(trimmedBody, basePath)
  const note = new Note({
    title: title,
    body: bodyWithImages,
    tags,
    createdAt,
    updatedAt
  })
  note.bookId = destBookId
  await note.save()
}
