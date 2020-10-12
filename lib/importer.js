const fs = require('fs')
const { remote } = require('electron')
const { models } = require('inkdrop')
const Cutter = require('utf8-binary-cutter')
const { dialog } = remote
const { Note } = models

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

function getTitleAndBodyFromMarkdown(fn, md) {
  const yaml = require('js-yaml')
  const lines = md.split('\n')
  let title = ''
  let yamlBlockStart = -1
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i]
    if (line === '---') {
      if (i === 0) {
        yamlBlockStart = i
      } else if (yamlBlockStart >= 0) {
        try {
          const frontmatter = yaml.safeLoad(
            lines.slice(yamlBlockStart + 1, i).join('\n')
          )
          title = frontmatter.title || frontmatter.subject || ''
        } catch (e) {
          // do nothing for invalid frontmatters
        }
        yamlBlockStart = -1
      }
      continue
    }
    if (yamlBlockStart < 0 && line.match(/^#+/)) {
      title = Cutter.truncateToBinarySize(line.replace(/^#+\s*/, ''), 128)
      lines.splice(i, 1)
      break
    }
  }
  return { title: title, body: lines.join('\n') }
}

function getMetaFromMarkdown(fn) {
  const stats = fs.statSync(fn)
  const meta = {
    tags: [],
    createdAt: stats.mtimeMs,
    updatedAt: stats.birthtimeMs
  }
  return meta
}

async function importMarkdownFromFile(fn, destBookId) {
  if (!destBookId) {
    throw new Error('Destination notebook ID is not specified.')
  }
  const markDown = fs.readFileSync(fn, 'utf-8')
  const { title, body } = getTitleAndBodyFromMarkdown(fn, markDown)
  const { tags, createdAt, updatedAt } = getMetaFromMarkdown(fn)
  const note = new Note({ title: title, body, tags, createdAt, updatedAt })
  note.bookId = destBookId
  await note.save()
}
