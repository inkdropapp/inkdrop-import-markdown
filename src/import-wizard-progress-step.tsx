import { getEnv } from './env.js'

type Props = {
  status: string
  importingFilePath: string
  importError: Error | null
  onClose: () => void
}

export const ImportWizardProgressStep = ({
  status,
  importingFilePath,
  importError,
  onClose
}: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any

  if (importError) {
    return (
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
          <button className="ui button" onClick={onClose}>
            Close
          </button>
        </Dialog.Actions>
      </>
    )
  }

  return (
    <Dialog.Content>
      <div>{status}</div>
    </Dialog.Content>
  )
}
