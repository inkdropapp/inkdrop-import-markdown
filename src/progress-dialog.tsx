import { maxAttachmentFileSize } from 'inkdrop-model'

type Props = {
  modal: { state: Record<string, any>; close: () => void }
  tooLargeFiles: string[]
  status: string
  importingFilePath: string
  importError: Error | null
}

const ImportMarkdownProgressDialog = ({
  modal,
  tooLargeFiles,
  status,
  importingFilePath,
  importError
}: Props) => {
  const AnyDialog = inkdrop.components.classes.Dialog as any

  let content = (
    <AnyDialog.Content>
      <div>{status}</div>
    </AnyDialog.Content>
  )

  if (tooLargeFiles.length > 0) {
    content = (
      <>
        <AnyDialog.Content>
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
        </AnyDialog.Content>
        <AnyDialog.Actions className="right aligned">
          <button className="ui button" onClick={modal.close}>
            Close
          </button>
        </AnyDialog.Actions>
      </>
    )
  }

  if (importError) {
    content = (
      <>
        <AnyDialog.Content>
          <div className="ui error message">
            <div className="header">Failed to import the Markdown file</div>
            <p>
              An unexpected error happened while processing &quot;
              <code>{importingFilePath}</code>&quot;.
            </p>
            <pre>{importError.stack}</pre>
          </div>
        </AnyDialog.Content>
        <AnyDialog.Actions className="right aligned">
          <button className="ui button" onClick={modal.close}>
            Close
          </button>
        </AnyDialog.Actions>
      </>
    )
  }

  return (
    <AnyDialog {...modal.state} className="import-markdown-progress-dialog">
      {content}
    </AnyDialog>
  )
}

export default ImportMarkdownProgressDialog
