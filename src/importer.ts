import { logger, models, importUtils } from 'inkdrop'
import fs from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'
import { maxAttachmentFileSize } from 'inkdrop-model'
import { glob } from 'glob'

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
  return inkdrop.dialog.showOpenDialog({
    title: 'Open Markdown file',
    properties,
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
}

export function checkSizeOfFiles(
  filePaths: string[]
): [number, string[]] {
  const errors: string[] = []
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

type ProgressCallback = (
  filePath: string,
  info: { isDirectory: boolean }
) => void

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
      await importMarkdownFromMultipleFilesAndDirectories(
        files,
        bookId,
        progressCallback,
        { root: false }
      )

      const dirs = (await getDirectories(fp)).map(name => path.join(fp, name))
      logger.debug('Subdirectories:', dirs)
      await importMarkdownFromMultipleFilesAndDirectories(
        dirs,
        bookId,
        progressCallback,
        { root: false }
      )
    } else if (stats.isFile() && destBookId !== null) {
      await importMarkdownFromMultipleFiles([fp], destBookId)
    } else {
      logger.debug('Skipping:', fp, { destBookId, root })
    }
  }
}

export async function importMarkdownFromMultipleFiles(
  files: string[],
  destBookId: string
) {
  for (let i = 0; i < files.length; ++i) {
    await importMarkdownFromFile(files[i], destBookId)
  }
}

export async function importMarkdownFromFile(fn: string, destBookId: string) {
  return importUtils.importMarkdownFile(fn, destBookId)
}
