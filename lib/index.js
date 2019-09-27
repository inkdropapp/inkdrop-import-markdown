"use strict";

var _selectBookDialog = _interopRequireDefault(require("./select-book-dialog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  activate() {
    inkdrop.components.registerClass(_selectBookDialog.default);
    inkdrop.layouts.addComponentToLayout('modal', 'ImportMarkdownSelectNotebookDialog');
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout('modal', 'ImportMarkdownSelectNotebookDialog');
    inkdrop.components.deleteClass(_selectBookDialog.default);
  }

};