'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inkdrop = require('inkdrop');

class ImportMarkdownSelectBookDialog extends _inkdrop.React.Component {
  constructor(props) {
    super(props);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _inkdrop.CompositeDisposable();

    // Register command that toggles this view
    this.subscription = inkdrop.commands.add(document.body, {
      'import-markdown:import-from-file': () => this.handleImportMarkdownFileCommand()
    });

    this.state = {
      destBookId: null,
      formErrorMessageVisible: false
    };
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  renderFormError() {
    if (this.state.formErrorMessageVisible) {
      return _inkdrop.React.createElement(
        'div',
        { className: 'ui negative message' },
        _inkdrop.React.createElement(
          'p',
          null,
          'Please select the destination notebook.'
        )
      );
    }
  }

  render() {
    const { MessageDialog, BookDropdownList } = inkdrop.components.classes;
    const buttons = [{
      label: 'Cancel'
    }, {
      label: 'OK',
      primary: true
    }];
    return _inkdrop.React.createElement(
      MessageDialog,
      {
        ref: el => this.dialog = el,
        title: 'Import Notes from Markdown',
        buttons: buttons,
        onDismiss: this.handleDismissDialog.bind(this)
      },
      _inkdrop.React.createElement(
        'div',
        { className: 'ui form' },
        this.renderFormError(),
        _inkdrop.React.createElement(
          'div',
          { className: 'field' },
          _inkdrop.React.createElement(BookDropdownList, {
            onChange: this.handleChangeBook.bind(this),
            selectedBookId: this.state.destBookId,
            placeholder: 'Select Destination Notebook..'
          })
        )
      )
    );
  }

  handleChangeBook(bookId) {
    this.setState({
      destBookId: bookId
    });
  }

  handleDismissDialog(dialog, buttonIndex) {
    if (buttonIndex === 1) {
      const { openImportDialog, importMarkdownFromMultipleFiles } = require('./importer');
      const { destBookId } = this.state;
      if (!destBookId) {
        this.setState({ formErrorMessageVisible: true });
        return false;
      }

      const files = openImportDialog();
      if (files) {
        importMarkdownFromMultipleFiles(files, destBookId);
      } else {
        return false;
      }
    }
  }

  handleImportMarkdownFileCommand() {
    const { dialog } = this;
    if (!dialog.isShown) {
      this.setState({
        destBookId: null,
        formErrorMessageVisible: false
      });
      dialog.showDialog();
    }
  }
}
exports.default = ImportMarkdownSelectBookDialog;