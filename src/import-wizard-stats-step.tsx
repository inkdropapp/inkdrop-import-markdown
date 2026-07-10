import { maxAttachmentFileSize } from 'inkdrop-model'

import { getEnv } from './env.js'
import type { ImportPreview, NotebookImportPreviewNode } from './importer.js'

type Props = {
  preview: ImportPreview
  onCancel: () => void
  onNext: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const NotebookPreviewItem = ({ node }: { node: NotebookImportPreviewNode }) => {
  const StreamlineIcon = getEnv().components.classes.StreamlineIcon as any

  return (
    <li>
      <StreamlineIcon name="book-close-2" className="notebook-icon inline" /> {node.name}
      <ul>
        <li>
          <StreamlineIcon name="common-file-text" className="inline" /> {node.fileCount}&nbsp;
          {node.fileCount === 1 ? 'file' : 'files'}
        </li>
        {node.imageCount > 0 && (
          <li>
            <StreamlineIcon name="picture-sun" className="inline" /> {node.imageCount}&nbsp;
            {node.imageCount === 1 ? 'image' : 'images'} ({formatFileSize(node.imageSize)})
          </li>
        )}
        {node.children.map(child => (
          <NotebookPreviewItem key={child.name} node={child} />
        ))}
      </ul>
    </li>
  )
}

export const ImportWizardStatsStep = ({ preview, onCancel, onNext }: Props) => {
  const Dialog = getEnv().components.classes.Dialog as any
  const StreamlineIcon = getEnv().components.classes.StreamlineIcon as any

  if (preview.oversizedFiles.length > 0) {
    return (
      <>
        <Dialog.Content overflow="auto">
          <div className="ui error message">
            <div className="header">The following files are too large:</div>
            <p>
              Files larger than {maxAttachmentFileSize / 1024 / 1024} MB cannot be imported. Please
              remove them to proceed.
            </p>
            <code>
              {preview.oversizedFiles.map(e => (
                <div key={e}>{e}</div>
              ))}
            </code>
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
      <Dialog.Content overflow="auto">
        <div>
          Going to import <strong>{preview.mdFileCount}</strong> Markdown file
          {preview.mdFileCount === 1 ? '' : 's'}
          {preview.imageCount > 0 && (
            <>
              &nbsp;and <strong>{preview.imageCount}</strong> image
              {preview.imageCount === 1 ? '' : 's'}
            </>
          )}
          &nbsp;({formatFileSize(preview.totalSize)} total):
        </div>
        {(preview.directFileCount > 0 || preview.notebooks.length > 0) && (
          <ul className="ui message import-markdown-notebook-preview-list">
            {preview.directFileCount > 0 && (
              <li>
                <StreamlineIcon name="common-file-text" className="inline" />{' '}
                {preview.directFileCount} file
                {preview.directFileCount === 1 ? '' : 's'} — no new notebook
              </li>
            )}
            {preview.notebooks.map(node => (
              <NotebookPreviewItem key={node.name} node={node} />
            ))}
          </ul>
        )}
      </Dialog.Content>
      <Dialog.Actions className="space-between">
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
