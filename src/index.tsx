import path from 'path'

import type { Environment, IInkdropPlugin } from '@inkdropapp/types'
import { useModal } from 'inkdrop'
import { useEffect, useCallback, useState } from 'react'

import { getEnv, setEnv } from './env.js'
import {
  openImportDialog,
  checkSizeOfFiles,
  importMarkdownFromMultipleFilesAndDirectories
} from './importer.js'
import ProgressDialog from './progress-dialog.js'
import SelectNotebookDialog from './select-book-dialog.js'

const ImportMarkdownPlugin = () => {
  const [status, setStatus] = useState('')
  const [tooLargeFiles, setTooLargeFiles] = useState<string[]>([])
  const [processingFilePath, setProcessingFilePath] = useState('')
  const [importError, setImportError] = useState<Error | null>(null)
  const selectNotebookDialog = useModal()
  const progressDialog = useModal()

  const showDialog = useCallback(() => {
    selectNotebookDialog.show()
  }, [selectNotebookDialog])

  const handleNotebookSelected = useCallback(
    async (destBookId: string | null) => {
      const { filePaths } = await openImportDialog({
        isFolderOnly: destBookId === null
      })
      if (filePaths instanceof Array && filePaths.length > 0) {
        setStatus('Scanning files..')
        progressDialog.show()
        const [, fileErrors] = checkSizeOfFiles(filePaths)
        if (fileErrors.length > 0) {
          setTooLargeFiles(fileErrors)
        } else {
          try {
            selectNotebookDialog.close()
            setStatus('Importing files..')
            let noteCount = 0
            await importMarkdownFromMultipleFilesAndDirectories(
              filePaths,
              destBookId,
              (filePath, { isDirectory }) => {
                setProcessingFilePath(filePath)
                setStatus(`Importing file.. ${path.basename(filePath)}`)
                if (!isDirectory) ++noteCount
              },
              { root: true }
            )
            getEnv().notifications.addSuccess('Import Markdown files', {
              detail: `Successfully imported ${noteCount} Markdown files!`,
              dismissable: true
            })
            progressDialog.close()
          } catch (e) {
            setImportError(e instanceof Error ? e : new Error(String(e)))
          }
        }
      }
    },
    [progressDialog, selectNotebookDialog]
  )

  useEffect(() => {
    const sub = getEnv().commands.add(document.body, {
      'import-markdown:import-from-file': showDialog
    })
    return () => sub.dispose()
  }, [showDialog])

  return (
    <>
      <SelectNotebookDialog modal={selectNotebookDialog} onSelect={handleNotebookSelected} />
      <ProgressDialog
        modal={progressDialog}
        status={status}
        tooLargeFiles={tooLargeFiles}
        importingFilePath={processingFilePath}
        importError={importError}
      />
    </>
  )
}

class InkdropPlugin implements IInkdropPlugin {
  activate(env: Environment) {
    setEnv(env)
    env.components.registerClass(ImportMarkdownPlugin)
    env.layouts.addComponentToLayout('modal', 'ImportMarkdownPlugin')
  }

  deactivate(env: Environment) {
    env.layouts.removeComponentFromLayout('modal', 'ImportMarkdownPlugin')
    env.components.deleteClass(ImportMarkdownPlugin)
    setEnv(undefined)
  }
}

export default new InkdropPlugin()
