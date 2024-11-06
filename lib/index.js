'use babel'

import React, { useEffect, useCallback, useState } from 'react'
import { useModal } from 'inkdrop'
import SelectNotebookDialog from './select-book-dialog'
import path from 'path'
import ProgressDialog from './progress-dialog'

export { activate, deactivate }

const ImportMarkdownPlugin = () => {
  const [status, setStatus] = useState('')
  const [tooLargeFiles, setTooLargeFiles] = useState([])
  const [processingFilePath, setProcessingFilePath] = useState('')
  const [importError, setImportError] = useState(null)
  const selectNotebookDialog = useModal()
  const progressDialog = useModal()

  const showDialog = useCallback(() => {
    selectNotebookDialog.show()
  }, [])

  const handleNotebookSelected = useCallback(
    async destBookId => {
      const {
        openImportDialog,
        checkSizeOfFiles,
        importMarkdownFromMultipleFilesAndDirectories
      } = require('./importer')
      const { filePaths } = await openImportDialog({
        isFolderOnly: destBookId === null
      })
      if (filePaths instanceof Array && filePaths.length > 0) {
        setStatus('Scanning files..')
        progressDialog.show()
        const [_totalSize, fileErrors] = checkSizeOfFiles(filePaths)
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
            inkdrop.notifications.addSuccess('Import Markdown files', {
              detail: `Successfully imported ${noteCount} Markdown files!`,
              dismissable: true
            })
            progressDialog.close()
          } catch (e) {
            setImportError(e)
          }
        }
      }
    },
    [progressDialog]
  )

  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      'import-markdown:import-from-file': showDialog
    })
    return () => sub.dispose()
  }, [showDialog])

  return (
    <>
      <SelectNotebookDialog
        modal={selectNotebookDialog}
        onSelect={handleNotebookSelected}
      />
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

function activate() {
  inkdrop.components.registerClass(ImportMarkdownPlugin)
  inkdrop.layouts.addComponentToLayout('modal', 'ImportMarkdownPlugin')
}

function deactivate() {
  inkdrop.layouts.removeComponentFromLayout('modal', 'ImportMarkdownPlugin')
  inkdrop.components.deleteClass(ImportMarkdownPlugin)
}
