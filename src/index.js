import ImportMarkdownSelectBookDialog from './select-book-dialog'

module.exports = {
  activate () {
    inkdrop.components.registerClass(ImportMarkdownSelectBookDialog)
    inkdrop.layouts.addComponentToLayout('modals', 'ImportMarkdownSelectBookDialog')
  },

  deactivate () {
    inkdrop.layouts.removeComponentFromLayout('modals', 'ImportMarkdownSelectBookDialog')
    inkdrop.components.deleteClass(ImportMarkdownSelectBookDialog)
  }
}
