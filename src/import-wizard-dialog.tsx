import { getEnv } from './env.js'
import { ImportWizardNotebookStep } from './import-wizard-notebook-step.js'
import { ImportWizardProgressStep } from './import-wizard-progress-step.js'
import { ImportWizardScanningStep } from './import-wizard-scanning-step.js'
import { ImportWizardStatsStep } from './import-wizard-stats-step.js'

export type WizardStep = 'scanning' | 'stats' | 'notebook' | 'progress'

type Props = {
  modal: { state: Record<string, any>; close: () => void }
  step: WizardStep
  status: string
  fileCount: number
  totalSize: number
  tooLargeFiles: string[]
  selectedBookId: string | null
  importingFilePath: string
  importError: Error | null
  onNext: () => void
  onBack: () => void
  onSelectNotebook: (bookId: string | null) => void
  onImport: () => void
}

export const ImportMarkdownWizardDialog = ({
  modal,
  step,
  status,
  fileCount,
  totalSize,
  tooLargeFiles,
  selectedBookId,
  importingFilePath,
  importError,
  onNext,
  onBack,
  onSelectNotebook,
  onImport
}: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any

  return (
    <Dialog
      {...modal.state}
      large={step === 'notebook'}
      onBackdropClick={modal.close}
      onEscKeyDown={modal.close}
      className={`import-markdown-wizard-dialog import-markdown-wizard-dialog--${step}`}
    >
      <Dialog.Title>Import Notes from Markdown</Dialog.Title>
      {step === 'scanning' && <ImportWizardScanningStep status={status} onCancel={modal.close} />}
      {step === 'stats' && (
        <ImportWizardStatsStep
          fileCount={fileCount}
          totalSize={totalSize}
          tooLargeFiles={tooLargeFiles}
          onCancel={modal.close}
          onNext={onNext}
        />
      )}
      {step === 'notebook' && (
        <ImportWizardNotebookStep
          selectedBookId={selectedBookId}
          onSelectNotebook={onSelectNotebook}
          onBack={onBack}
          onCancel={modal.close}
          onImport={onImport}
        />
      )}
      {step === 'progress' && (
        <ImportWizardProgressStep
          status={status}
          importingFilePath={importingFilePath}
          importError={importError}
          onClose={modal.close}
        />
      )}
    </Dialog>
  )
}
