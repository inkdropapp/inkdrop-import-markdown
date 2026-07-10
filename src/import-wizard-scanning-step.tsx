import { getEnv } from './env.js'

type Props = {
  status: string
  onCancel: () => void
}

export const ImportWizardScanningStep = ({ status, onCancel }: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any

  return (
    <>
      <Dialog.Content>
        <div>{status}</div>
      </Dialog.Content>
      <Dialog.Actions className="right aligned">
        <button className="ui button" onClick={onCancel}>
          Cancel
        </button>
      </Dialog.Actions>
    </>
  )
}
