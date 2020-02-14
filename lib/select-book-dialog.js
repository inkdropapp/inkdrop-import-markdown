"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ImportMarkdownSelectNotebookDialog extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleNotebookSelect", bookId => {
      this.importMarkdownFile(bookId);
    });

    _defineProperty(this, "importMarkdownFile", async destBookId => {
      const {
        dialog
      } = this;

      const {
        openImportDialog,
        importMarkdownFromMultipleFiles
      } = require('./importer');

      const {
        filePaths
      } = await openImportDialog();

      if (filePaths) {
        dialog.dismissDialog(-1);
        await importMarkdownFromMultipleFiles(filePaths, destBookId);
      } else {
        return false;
      }
    });

    _defineProperty(this, "handleImportMarkdownFileCommand", () => {
      const {
        dialog
      } = this;

      if (!dialog.isShown) {
        dialog.showDialog();
      }
    });
  }

  componentDidMount() {
    // Register command that toggles this view
    this.subscription = inkdrop.commands.add(document.body, {
      'import-markdown:import-from-file': this.handleImportMarkdownFileCommand
    });
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  render() {
    const {
      MessageDialog,
      NotebookListBar
    } = inkdrop.components.classes;
    const buttons = [{
      label: 'Cancel',
      cancel: true
    }];
    if (!MessageDialog || !NotebookListBar) return null;
    return React.createElement(MessageDialog, {
      className: "import-markdown-select-notebook-dialog",
      ref: el => this.dialog = el,
      title: "Import Notes from Markdown",
      message: React.createElement("div", {
        className: "ui message"
      }, "Please select a notebook"),
      buttons: buttons
    }, React.createElement("div", {
      className: "ui form"
    }, React.createElement("div", {
      className: "field"
    }, React.createElement(NotebookListBar, {
      onItemSelect: this.handleNotebookSelect
    }))));
  }

}

exports.default = ImportMarkdownSelectNotebookDialog;