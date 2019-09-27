import ImportMarkdownSelectNotebookDialog from './select-book-dialog'

module.exports = {
  activate() {
    inkdrop.components.registerClass(ImportMarkdownSelectNotebookDialog)
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'ImportMarkdownSelectNotebookDialog'
    )
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'ImportMarkdownSelectNotebookDialog'
    )
    inkdrop.components.deleteClass(ImportMarkdownSelectNotebookDialog)
  }
}
