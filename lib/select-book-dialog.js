'use babel'

import React from 'react'

const ImportMarkdownSelectNotebookDialog = ({ modal, onSelect }) => {
  const { NotebookListBar } = inkdrop.components.classes
  const { Dialog } = inkdrop.components.classes

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
            <NotebookListBar showRoot onItemSelect={onSelect} />
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
