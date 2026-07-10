import { maxAttachmentFileSize } from 'inkdrop-model'

import { getEnv } from './env.js'

type Props = {
  fileCount: number
  totalSize: number
  tooLargeFiles: string[]
  onCancel: () => void
  onNext: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const ImportWizardStatsStep = ({
  fileCount,
  totalSize,
  tooLargeFiles,
  onCancel,
  onNext
}: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any

  if (tooLargeFiles.length > 0) {
    return (
      <>
        <Dialog.Content>
          <div className="ui error message">
            <div className="header">The following files are too large:</div>
            <p>
              Files larger than {maxAttachmentFileSize / 1024 / 1024} MB cannot be imported. Please
              remove them to proceed.
            </p>
            <pre>
              {tooLargeFiles.map(e => (
                <div key={e}>{e}</div>
              ))}
            </pre>
          </div>
        </Dialog.Content>
        <Dialog.Actions className="right aligned">
          <button className="ui button" onClick={onCancel}>
            Close
          </button>
        </Dialog.Actions>
      </>
    )
  }

  return (
    <>
      <Dialog.Content>
        <div>
          Found {fileCount} Markdown file{fileCount === 1 ? '' : 's'} ({formatFileSize(totalSize)}).
        </div>
      </Dialog.Content>
      <Dialog.Actions className="right aligned">
        <button className="ui button" onClick={onCancel}>
          Cancel
        </button>
        <button className="ui primary button" onClick={onNext}>
          Next
        </button>
      </Dialog.Actions>
    </>
  )
}
