'use babel'

import React from 'react'
const { maxAttachmentFileSize } = require('inkdrop-model')

const ImportMarkdownProgressDialog = ({
  modal,
  tooLargeFiles,
  status,
  importingFilePath,
  importError
}) => {
  const { Dialog } = inkdrop.components.classes

  let content = (
    <Dialog.Content>
      <div>{status}</div>
    </Dialog.Content>
  )

  if (tooLargeFiles.length > 0) {
    content = (
      <>
        <Dialog.Content>
          <div className="ui error message">
            <div className="header">The following files are too large:</div>
            <p>
              Files larger than {maxAttachmentFileSize / 1024 / 1024} MB cannot
              be imported. Please remove them to proceed.
            </p>
            <pre>
              {tooLargeFiles.map(e => (
                <div key={e}>{e}</div>
              ))}
            </pre>
          </div>
        </Dialog.Content>
        <Dialog.Actions className="right aligned">
          <button className="ui button" onClick={modal.close}>
            Close
          </button>
        </Dialog.Actions>
      </>
    )
  }

  if (importError) {
    content = (
      <>
        <Dialog.Content>
          <div className="ui error message">
            <div className="header">Failed to import the Markdown file</div>
            <p>
              An unexpected error happened while processing &quot;
              <code>{importingFilePath}</code>&quot;.
            </p>
            <pre>{importError.stack}</pre>
          </div>
        </Dialog.Content>
        <Dialog.Actions className="right aligned">
          <button className="ui button" onClick={modal.close}>
            Close
          </button>
        </Dialog.Actions>
      </>
    )
  }

  return (
    <Dialog {...modal.state} className="import-markdown-progress-dialog">
      {content}
    </Dialog>
  )
}

export default ImportMarkdownProgressDialog
