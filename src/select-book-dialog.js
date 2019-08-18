import * as React from 'react'

export default class ImportMarkdownSelectNotebookDialog extends React.Component {
  componentDidMount() {
    // Register command that toggles this view
    this.subscription = inkdrop.commands.add(document.body, {
      'import-markdown:import-from-file': this.handleImportMarkdownFileCommand
    })
  }

  componentWillUnmount() {
    this.subscription.dispose()
  }

  render() {
    const { MessageDialog, NotebookListBar } = inkdrop.components.classes
    const buttons = [
      {
        label: 'Cancel',
        cancel: true
      }
    ]
    if (!MessageDialog || !NotebookListBar) return null
    return (
      <MessageDialog
        className="import-markdown-select-notebook-dialog"
        ref={el => (this.dialog = el)}
        title="Import Notes from Markdown"
        message={<div className="ui message">Please select a notebook</div>}
        buttons={buttons}
      >
        <div className="ui form">
          <div className="field">
            <NotebookListBar onItemSelect={this.handleNotebookSelect} />
          </div>
        </div>
      </MessageDialog>
    )
  }

  handleNotebookSelect = bookId => {
    this.importMarkdownFile(bookId)
  }

  importMarkdownFile = async destBookId => {
    const { dialog } = this
    const {
      openImportDialog,
      importMarkdownFromMultipleFiles
    } = require('./importer')
    const files = openImportDialog()
    if (files) {
      dialog.dismissDialog(-1)
      await importMarkdownFromMultipleFiles(files, destBookId)
    } else {
      return false
    }
  }

  handleImportMarkdownFileCommand = () => {
    const { dialog } = this
    if (!dialog.isShown) {
      dialog.showDialog()
    }
  }
}
