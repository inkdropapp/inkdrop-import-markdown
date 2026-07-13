import path from 'path'

import type { Environment, IInkdropPlugin } from '@inkdropapp/types'
import { useModal, logger } from 'inkdrop'
import { useEffect, useCallback, useState } from 'react'

import { getEnv, setEnv } from './env.js'
import { ImportMarkdownWizardDialog } from './import-wizard-dialog.js'
import type { WizardStep } from './import-wizard-dialog.js'
import type { ImportPreview } from './importer.js'
import {
  openImportDialog,
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

const ImportMarkdownPlugin = () => {
  const [step, setStep] = useState<WizardStep>('scanning')
  const [filePaths, setFilePaths] = useState<string[]>([])
  const [preview, setPreview] = useState<ImportPreview>(EMPTY_PREVIEW)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [processingFilePath, setProcessingFilePath] = useState('')
  const [importError, setImportError] = useState<Error | null>(null)
  const wizardDialog = useModal()

  const showDialog = useCallback(async () => {
    const { filePaths: pickedPaths } = await openImportDialog()
    if (!(pickedPaths instanceof Array) || pickedPaths.length === 0) return
    logger.debug('[import-markdown] Picked files and directories:', pickedPaths)

    setFilePaths(pickedPaths)
    setSelectedBookId(null)
    setImportError(null)
    setStatus('Scanning files..')
    setStep('scanning')
    wizardDialog.show()

    setPreview(await previewImport(pickedPaths))
    setStep('stats')
  }, [wizardDialog])

  const handleNext = useCallback(() => {
    setStep('notebook')
  }, [])

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

  useEffect(() => {
    const sub = getEnv().commands.add(document.body, {
      'import-markdown:import-from-file': showDialog
    })
    return () => sub.dispose()
  }, [showDialog])

  return (
    <ImportMarkdownWizardDialog
      modal={wizardDialog}
      step={step}
      status={status}
      preview={preview}
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
