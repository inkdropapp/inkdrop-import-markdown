import { getEnv } from './env.js'

type Props = {
  selectedBookId: string | null
  onSelectNotebook: (bookId: string | null) => void
  onBack: () => void
  onCancel: () => void
  onImport: () => void
}

export const ImportWizardNotebookStep = ({
  selectedBookId,
  onSelectNotebook,
  onBack,
  onCancel,
  onImport
}: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any
  const NotebookListBar = getEnv().components.classes.NotebookListBar

  return (
    <>
      <Dialog.Content flex>
        <div className="ui message" style={{ flex: '0 0' }}>
          Please select a target notebook
        </div>
        <NotebookListBar onItemSelect={onSelectNotebook} />
      </Dialog.Content>
      <Dialog.Actions className="space-between">
        <span>
          <button className="ui button" onClick={onCancel}>
            Cancel
          </button>
          <button className="ui button" onClick={onBack}>
            Back
          </button>
        </span>
        <button className="ui primary button" disabled={!selectedBookId} onClick={onImport}>
          Import
        </button>
      </Dialog.Actions>
    </>
  )
}
