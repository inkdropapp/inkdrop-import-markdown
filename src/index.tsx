import path from 'path'

import type { CommandEvent, Environment, IInkdropPlugin } from '@inkdropapp/types'
import { useModal, logger } from 'inkdrop'
import { useEffect, useCallback, useState } from 'react'

import { getEnv, setEnv } from './env.js'
import { ImportMarkdownWizardDialog } from './import-wizard-dialog.js'
import type { WizardStep } from './import-wizard-dialog.js'
import type { ImportPreview } from './importer.js'
import {
  openImportDialog,
  openImportFolderDialog,
  previewImport,
  importMarkdownFromMultipleFilesAndDirectories
} from './importer.js'

const EMPTY_PREVIEW: ImportPreview = {
  directFileCount: 0,
  notebooks: [],
  mdFileCount: 0,
  imageCount: 0,
  imageSize: 0,
  totalSize: 0,
  oversizedFiles: []
}

/**
 * The notebook a sidebar context-menu command targets: an explicit `detail.bookId` when
 * dispatched programmatically, else the last notebook that was right-clicked — the store never
 * clears it, so a programmatic dispatch should pass `bookId`. `null` (no notebook right-clicked
 * yet) falls back to the regular wizard, which asks for a destination.
 */
function getContextMenuBookId(e: CommandEvent): string | null {
  return e.detail?.bookId ?? getEnv().store.getState().bookList.bookForContextMenu?._id ?? null
}

const ImportMarkdownPlugin = () => {
  const [step, setStep] = useState<WizardStep>('scanning')
  const [filePaths, setFilePaths] = useState<string[]>([])
  const [preview, setPreview] = useState<ImportPreview>(EMPTY_PREVIEW)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isDestinationPreset, setIsDestinationPreset] = useState(false)
  const [status, setStatus] = useState('')
  const [processingFilePath, setProcessingFilePath] = useState('')
  const [importError, setImportError] = useState<Error | null>(null)
  const wizardDialog = useModal()

  const startWizard = useCallback(
    async (openDialog: typeof openImportDialog, destBookId: string | null = null) => {
      const { filePaths: pickedPaths } = await openDialog()
      if (!(pickedPaths instanceof Array) || pickedPaths.length === 0) return
      logger.debug('[import-markdown] Picked files and directories:', pickedPaths)

      setFilePaths(pickedPaths)
      setSelectedBookId(destBookId)
      setIsDestinationPreset(destBookId !== null)
      setImportError(null)
      setStatus('Scanning files..')
      setStep('scanning')
      wizardDialog.show()

      setPreview(await previewImport(pickedPaths))
      setStep('stats')
    },
    [wizardDialog]
  )

  const showFileDialog = useCallback(() => startWizard(openImportDialog), [startWizard])
  const showFolderDialog = useCallback(() => startWizard(openImportFolderDialog), [startWizard])
  const showFileDialogForNotebook = useCallback(
    (e: CommandEvent) => startWizard(openImportDialog, getContextMenuBookId(e)),
    [startWizard]
  )
  const showFolderDialogForNotebook = useCallback(
    (e: CommandEvent) => startWizard(openImportFolderDialog, getContextMenuBookId(e)),
    [startWizard]
  )

  const handleBack = useCallback(() => {
    setStep('stats')
  }, [])

  const handleImport = useCallback(async () => {
    setStep('progress')
    setStatus('Importing files..')
    try {
      let noteCount = 0
      await importMarkdownFromMultipleFilesAndDirectories(
        filePaths,
        selectedBookId,
        (filePath, { isDirectory }) => {
          setProcessingFilePath(filePath)
          setStatus(`Importing file.. ${path.basename(filePath)}`)
          if (!isDirectory) ++noteCount
        },
        { root: true }
      )
      getEnv().notifications.addSuccess('Import Markdown files', {
        detail: `Successfully imported ${noteCount} Markdown files!`,
        dismissable: true
      })
      wizardDialog.close()
    } catch (e) {
      setImportError(e instanceof Error ? e : new Error(String(e)))
    }
  }, [filePaths, selectedBookId, wizardDialog])

  const handleNext = useCallback(() => {
    if (isDestinationPreset) handleImport()
    else setStep('notebook')
  }, [isDestinationPreset, handleImport])

  useEffect(() => {
    const sub = getEnv().commands.add(document.body, {
      'import-markdown:import-from-file': {
        description: 'Import notes from Markdown files',
        didDispatch: showFileDialog
      },
      'import-markdown:import-from-directory': {
        description: 'Import notes from Markdown folders',
        didDispatch: showFolderDialog
      },
      'import-markdown:import-from-file-into-notebook': {
        description: 'Import notes from Markdown files into the selected notebook',
        hiddenInCommandPalette: true,
        didDispatch: showFileDialogForNotebook
      },
      'import-markdown:import-from-directory-into-notebook': {
        description: 'Import notes from Markdown folders into the selected notebook',
        hiddenInCommandPalette: true,
        didDispatch: showFolderDialogForNotebook
      }
    })
    return () => sub.dispose()
  }, [showFileDialog, showFolderDialog, showFileDialogForNotebook, showFolderDialogForNotebook])

  return (
    <ImportMarkdownWizardDialog
      modal={wizardDialog}
      step={step}
      status={status}
      preview={preview}
      isDestinationPreset={isDestinationPreset}
      selectedBookId={selectedBookId}
      importingFilePath={processingFilePath}
      importError={importError}
      onNext={handleNext}
      onBack={handleBack}
      onSelectNotebook={setSelectedBookId}
      onImport={handleImport}
    />
  )
}

class InkdropPlugin implements IInkdropPlugin {
  activate(env: Environment) {
    setEnv(env)
    env.components.registerClass(ImportMarkdownPlugin)
    env.layouts.addComponentToLayout('modal', 'ImportMarkdownPlugin')
  }

  deactivate(env: Environment) {
    env.layouts.removeComponentFromLayout('modal', 'ImportMarkdownPlugin')
    env.components.deleteClass(ImportMarkdownPlugin)
    setEnv(undefined)
  }
}

export default new InkdropPlugin()
