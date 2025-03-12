'use babel'

import React from 'react'

const ImportMarkdownSelectNotebookDialog = ({ modal, onSelect }) => {
  const { NotebookListBar } = inkdrop.components.classes
  const { Dialog } = inkdrop.components.classes

  return (
    <Dialog
      {...modal.state}
      large
      onBackdropClick={modal.close}
      onEscKeyDown={modal.close}
      className="import-markdown-select-notebook-dialog"
    >
      <Dialog.Title>Import Notes from Markdown</Dialog.Title>
      <Dialog.Content flex>
        <div className="ui message" style={{ flex: '0 0' }}>
          Please select a notebook
        </div>
        <NotebookListBar showRoot onItemSelect={onSelect} />
      </Dialog.Content>
      <Dialog.Actions>
        <button className="ui button" onClick={modal.close}>
          Cancel
        </button>
      </Dialog.Actions>
    </Dialog>
  )
}

export default ImportMarkdownSelectNotebookDialog
