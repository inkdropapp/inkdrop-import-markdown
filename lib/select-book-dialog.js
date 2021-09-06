'use babel'

import React, { useEffect, useCallback } from 'react'
import { useModal } from 'inkdrop'

const ImportMarkdownSelectNotebookDialog = _props => {
  const { NotebookListBar } = inkdrop.components.classes
  const modal = useModal()
  const { Dialog } = inkdrop.components.classes

  const showDialog = useCallback(() => {
    modal.show()
  }, [])

  const importMarkdownFile = useCallback(async destBookId => {
    const {
      openImportDialog,
      importMarkdownFromMultipleFiles
    } = require('./importer')
    const { filePaths } = await openImportDialog()
    if (filePaths) {
      modal.close()
      await importMarkdownFromMultipleFiles(filePaths, destBookId)
    } else {
      return false
    }
  }, [])

  const handleNotebookSelect = useCallback(
    bookId => {
      importMarkdownFile(bookId)
    },
    [importMarkdownFile]
  )

  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      'import-markdown:import-from-file': showDialog
    })
    return () => sub.dispose()
  }, [showDialog])

  return (
    <Dialog
      {...modal.state}
      onBackdropClick={modal.close}
      className="import-markdown-select-notebook-dialog"
    >
      <Dialog.Title>Import Notes from Markdown</Dialog.Title>
      <Dialog.Content>
        <div className="ui message">Please select a notebook</div>
        <div className="ui form">
          <div className="field">
            <NotebookListBar onItemSelect={handleNotebookSelect} />
          </div>
        </div>
      </Dialog.Content>
      <Dialog.Actions className="right aligned">
        <button className="ui button" onClick={modal.close}>
          Cancel
        </button>
      </Dialog.Actions>
    </Dialog>
  )
}

export default ImportMarkdownSelectNotebookDialog
