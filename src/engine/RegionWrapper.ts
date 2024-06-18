/* #region Imports */
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as config from '../config/Configuration';
/* #endregion */

/* #region RegionWrapperService */
export class RegionWrapperService {
  _configService: config.ConfigurationService;

  constructor(configService: config.ConfigurationService) {
    this._configService = configService;
  }

  public wrapCurrentWithRegion() {
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return;
    let document = activeTextEditor.document;
    if (!document) return;

    let currentLanguageConfig =
      this._configService.getConfigurationForCurrentLanguage(
        document.languageId,
      );
    if (!currentLanguageConfig) return;

    /* #region Check if there is anything selected. */
    if (
      activeTextEditor.selections.length > 1 ||
      activeTextEditor.selections.length < 1
    )
      return;

    const { selection } = activeTextEditor;
    if (selection.isEmpty) return;
    /* #endregion */

    const linePrefix = activeTextEditor.document.getText(
      new vscode.Range(
        new vscode.Position(selection.start.line, 0),
        selection.start,
      ),
    );
    const addPrefix = /^\s+$/.test(linePrefix) ? linePrefix : '';
    const eol = this.getEOLStr(activeTextEditor.document.eol);

    //Get the position of [NAME] in the fold start template.
    let regionStartTemplate = currentLanguageConfig.foldStart;
    const idx = regionStartTemplate.indexOf('[NAME]');
    const nameInsertionIndex =
      idx < 0 ? 0 : regionStartTemplate.length - 6 /* '[NAME]'.length */ - idx;
    const regionStartText = regionStartTemplate.replace('[NAME]', '');

    activeTextEditor
      .edit(edit => {
        if (!currentLanguageConfig) return;
        if (!activeTextEditor) return;
        // Insert the #region, #endregion tags
        edit.insert(
          selection.end,
          eol + addPrefix + currentLanguageConfig.foldEnd,
        );
        edit.insert(selection.start, regionStartText + eol + addPrefix);
      })
      .then(() => {
        if (!currentLanguageConfig) return;
        if (!activeTextEditor) return;

        // Now, move the selection point to the [NAME] position.
        const sel = activeTextEditor.selection;
        const newLine = sel.start.line - 1;
        const newChar =
          activeTextEditor.document.lineAt(newLine).text.length -
          nameInsertionIndex;
        const newStart = sel.start.translate(
          newLine - sel.start.line,
          newChar - sel.start.character,
        );
        const newSelection = new vscode.Selection(newStart, newStart);
        activeTextEditor.selections = [newSelection];

        //Format the document
        vscode.commands.executeCommand(
          'editor.action.formatDocument',
          'editorHasDocumentFormattingProvider && editorTextFocus',
          true,
        );
      });
  }

  private getEOLStr(eol: vscode.EndOfLine) {
    switch (eol) {
      case vscode.EndOfLine.CRLF:
        return '\r\n';

      default:
        return '\n';
    }
  }
}
/* #endregion */
