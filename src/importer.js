import path from 'path'
import fs from 'fs'
import { remote } from 'electron'
import { html2markdown } from 'inkdrop'
const { jsdom } = require.main.require('jsdom')
const { dialog } = remote
const { Note } = inkdrop.models

export function openImportDialog () {
  return dialog.showOpenDialog({
    title: 'Open HTML file',
    properties: [
      'openFile', 'multiSelections'
    ],
    filters: [
      { name: 'HTML Files', extensions: [ 'html' ] }
    ]
  })
}

export async function importMarkdownFromMultipleFiles (files, destBookId) {
  try {
    for (let i = 0; i < files.length; ++i) {
      await importHTMLFromFile(files[i], destBookId)
    }
  } catch (e) {
    inkdrop.notifications.addError('Failed to import the HTML file', { detail: e.stack, dismissable: true })
  }
}

function parseMetaTag (dom, metaName) {
  if (!dom) {
    throw new Error('Invalid DOM')
  }
  const meta = dom.querySelector(`meta[name=${metaName}]`)
  if (meta) {
    const content = meta.attributes['content']
    if (content) {
      return content.value
    }
  }
  return false
}

function getMetaFromHTML (html) {
  const dom = jsdom(html)
  const meta = {
    tags: [],
    createdAt: +new Date(),
    updatedAt: +new Date()
  }
  const keywords = parseMetaTag(dom, 'keywords')
  if (keywords) {
    meta.tags = keywords.split(',').map((tag) => tag.trim())
  }
  const created = parseMetaTag(dom, 'created')
  if (created) {
    meta.createdAt = +new Date(created)
  }
  const updated = parseMetaTag(dom, 'updated')
  if (updated) {
    meta.updatedAt = +new Date(updated)
  }
  const titleTag = dom.querySelector('title')
  if (titleTag) {
    meta.title = titleTag.text
  }
  return meta
}

export async function importHTMLFromFile (fn, destBookId) {
  if (!destBookId) {
    throw new Error('Destination notebook ID is not specified.')
  }
  const html = fs.readFileSync(fn, 'utf-8')
  const titleFromFileName = path.basename(fn, path.extname(fn))
  const body = html2markdown(html)
  const { tags, createdAt, updatedAt, title } = getMetaFromHTML(html)

  const note = new Note({ title: title || titleFromFileName, body, tags, createdAt, updatedAt })
  note.bookId = destBookId
  await note.save()
}
