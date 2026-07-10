import fs from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'

import { glob } from 'glob'
import { logger, models, importUtils } from 'inkdrop'
import { maxAttachmentFileSize } from 'inkdrop-model'

import { getEnv } from './env.js'

const { Book } = models

const isMacOS = process.platform === 'darwin'

const getDirectories = async (source: string) =>
  (await fsp.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export function openImportDialog({ isFolderOnly }: { isFolderOnly: boolean }) {
  let properties: string[] = ['openDirectory', 'multiSelections']
  if (!isFolderOnly) {
    if (isMacOS) properties.push('openFile')
    else properties = ['openFile', 'multiSelections']
  }

  if (!isFolderOnly) properties.push('openFile')
  return getEnv().dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties,
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg'])

function classifyFile(filePath: string): 'md' | 'image' | null {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.md') return 'md'
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  return null
}

export type NotebookImportPreviewNode = {
  name: string
  fileCount: number
  imageCount: number
  imageSize: number
  children: NotebookImportPreviewNode[]
}

export type ImportPreview = {
  directFileCount: number
  notebooks: NotebookImportPreviewNode[]
  mdFileCount: number
  imageCount: number
  imageSize: number
  totalSize: number
  oversizedFiles: string[]
}

type ScanTotals = Omit<ImportPreview, 'directFileCount' | 'notebooks'>

function emptyTotals(): ScanTotals {
  return { mdFileCount: 0, imageCount: 0, imageSize: 0, totalSize: 0, oversizedFiles: [] }
}

function mergeTotals(a: ScanTotals, b: ScanTotals): ScanTotals {
  return {
    mdFileCount: a.mdFileCount + b.mdFileCount,
    imageCount: a.imageCount + b.imageCount,
    imageSize: a.imageSize + b.imageSize,
    totalSize: a.totalSize + b.totalSize,
    oversizedFiles: [...a.oversizedFiles, ...b.oversizedFiles]
  }
}

/**
 * Classifies a single file's contribution to the running md/image counts and sizes.
 * Files that are neither markdown nor an image (e.g. `.enex`, `.DS_Store`) are never imported,
 * so they're ignored entirely here — including skipping the oversized-size check.
 */
function totalsForFile(filePath: string, size: number): ScanTotals {
  const kind = classifyFile(filePath)
  const oversizedFiles = kind && size > maxAttachmentFileSize ? [filePath] : []
  if (kind === 'md') return { ...emptyTotals(), mdFileCount: 1, totalSize: size, oversizedFiles }
  if (kind === 'image') {
    return { ...emptyTotals(), imageCount: 1, imageSize: size, totalSize: size, oversizedFiles }
  }
  return emptyTotals()
}

/**
 * Recursively scans a directory, building both its notebook-preview node and the aggregate
 * md/image counts and sizes for everything under it, in a single filesystem pass per directory.
 * `node.fileCount` stays direct-children-only (matching the notebook that will actually be
 * created for this folder); the returned totals are recursive, for the caller to bubble up.
 */
async function scanDirectory(
  dirPath: string
): Promise<{ node: NotebookImportPreviewNode; totals: ScanTotals }> {
  const entries = await fsp.readdir(dirPath, { withFileTypes: true })

  const directTotals = entries
    .filter(entry => entry.isFile())
    .reduce((totals, entry) => {
      const entryPath = path.join(dirPath, entry.name)
      return mergeTotals(totals, totalsForFile(entryPath, fs.statSync(entryPath).size))
    }, emptyTotals())

  const children: NotebookImportPreviewNode[] = []
  let totals = directTotals
  for (const entry of entries.filter(e => e.isDirectory())) {
    const child = await scanDirectory(path.join(dirPath, entry.name))
    children.push(child.node)
    totals = mergeTotals(totals, child.totals)
  }

  return {
    node: {
      name: path.basename(dirPath),
      fileCount: directTotals.mdFileCount,
      imageCount: directTotals.imageCount,
      imageSize: directTotals.imageSize,
      children
    },
    totals
  }
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
export async function previewImport(filePaths: string[]): Promise<ImportPreview> {
  const notebooks: NotebookImportPreviewNode[] = []
  let directFileCount = 0
  let totals = emptyTotals()
  const isSingleFolderPick = filePaths.length === 1 && fs.statSync(filePaths[0]).isDirectory()

  for (const fp of filePaths) {
    const stats = fs.statSync(fp)
    if (stats.isDirectory()) {
      if (isSingleFolderPick) {
        const entries = await fsp.readdir(fp, { withFileTypes: true })
        for (const entry of entries) {
          const entryPath = path.join(fp, entry.name)
          if (entry.isFile()) {
            const fileTotals = totalsForFile(entryPath, fs.statSync(entryPath).size)
            directFileCount += fileTotals.mdFileCount
            totals = mergeTotals(totals, fileTotals)
          } else if (entry.isDirectory()) {
            const child = await scanDirectory(entryPath)
            notebooks.push(child.node)
            totals = mergeTotals(totals, child.totals)
          }
        }
      } else {
        const child = await scanDirectory(fp)
        notebooks.push(child.node)
        totals = mergeTotals(totals, child.totals)
      }
    } else if (stats.isFile()) {
      // A loose top-level file pick always gets imported directly regardless of extension
      // (matches importMarkdownFromMultipleFilesAndDirectories's unconditional file branch).
      directFileCount += 1
      totals = mergeTotals(totals, {
        mdFileCount: 1,
        imageCount: 0,
        imageSize: 0,
        totalSize: stats.size,
        oversizedFiles: stats.size > maxAttachmentFileSize ? [fp] : []
      })
    }
  }

  const baseDir = filePaths.length > 0 ? path.dirname(filePaths[0]) : ''

  return {
    directFileCount,
    notebooks,
    ...totals,
    oversizedFiles: totals.oversizedFiles.map(fp => path.relative(baseDir, fp))
  }
}

type ProgressCallback = (filePath: string, info: { isDirectory: boolean }) => void

export async function importMarkdownFromMultipleFilesAndDirectories(
  filePaths: string[],
  destBookId: string | null,
  progressCallback: ProgressCallback,
  { root = false }
) {
  logger.debug('Importing markdown files:', filePaths, { destBookId, root })

  for (const fp of filePaths) {
    const stats = fs.statSync(fp)
    const isDirectory = stats.isDirectory()
    if (!root) progressCallback(fp, { isDirectory })

    if (isDirectory) {
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
      await importMarkdownFromMultipleFilesAndDirectories(files, bookId, progressCallback, {
        root: false
      })

      const dirs = (await getDirectories(fp)).map(name => path.join(fp, name))
      logger.debug('Subdirectories:', dirs)
      await importMarkdownFromMultipleFilesAndDirectories(dirs, bookId, progressCallback, {
        root: false
      })
    } else if (stats.isFile() && destBookId !== null) {
      await importMarkdownFromMultipleFiles([fp], destBookId)
    } else {
      logger.debug('Skipping:', fp, { destBookId, root })
    }
  }
}

export async function importMarkdownFromMultipleFiles(files: string[], destBookId: string) {
  for (let i = 0; i < files.length; ++i) {
    await importMarkdownFromFile(files[i], destBookId)
  }
}

export async function importMarkdownFromFile(fn: string, destBookId: string) {
  return importUtils.importMarkdownFile(fn, destBookId)
}
