const fs = require('fs')
const path = require('path')
const { remote, nativeImage } = require('electron')
const { models, logger } = require('inkdrop')
const {
  getTitleAndBodyFromMarkdown,
  getMetaFromMarkdown,
  extractImages
} = require('inkdrop-import-utils')
const escapeRegExp = require('lodash.escaperegexp')
const { dialog } = remote
const { Note, File: IDFile } = models

module.exports = {
  openImportDialog,
  importMarkdownFromMultipleFiles,
  importMarkdownFromFile
}

function openImportDialog() {
  return dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
}

async function importMarkdownFromMultipleFiles(files, destBookId) {
  try {
    for (let i = 0; i < files.length; ++i) {
      await importMarkdownFromFile(files[i], destBookId)
    }
  } catch (e) {
    inkdrop.notifications.addError('Failed to import the Markdown file', {
      detail: e.stack,
      dismissable: true
    })
  }
}

async function importImages(md, basePath) {
  const images = extractImages(md)
  for (const image of images) {
    const imagePath = path.resolve(basePath, decodeURIComponent(image.url))
    if (fs.existsSync(imagePath)) {
      try {
        const imageData = nativeImage.createFromPath(imagePath)
        const fileTitle = path.basename(imagePath)
        const file = await IDFile.createFromNativeImage(imageData, fileTitle)
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
  const basePath = path.dirname(fn)
  const bodyWithImages = await importImages(body, basePath)
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
