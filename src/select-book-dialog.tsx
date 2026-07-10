import { getEnv } from './env.js'

type Props = {
  modal: { state: Record<string, any>; close: () => void }
  onSelect: (bookId: string | null) => void
}

const ImportMarkdownSelectNotebookDialog = ({ modal, onSelect }: Props) => {
  const NotebookListBar = getEnv().components.classes.NotebookListBar
  const Dialog = getEnv().components.classes.Dialog as any

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
          Please select a target notebook
        </div>
        <NotebookListBar onItemSelect={onSelect} />
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
