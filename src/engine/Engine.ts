/* #region Imports */
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CustomFoldingRangeProvider as CustomFolding } from './CustomFoldingRangeProvider';
import * as config from './../config/Configuration';
import { FileMonitor } from './FileMonitor';
import { RegionService } from './RegionServices';
import { RegionWrapperService } from './RegionWrapper';
/* #endregion */

/* #region Engine */
export class Engine {
  private _foldingRangeProvider: CustomFolding | null = null;
  private _configService: config.ConfigurationService;
  private _fileMonitor: FileMonitor;

  public get FoldingRangeProvider() {
    return this._foldingRangeProvider;
  }

  public dispose() {
    this._foldingRangeProvider = null;
  }

  public selectCurrentRegion() {
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return;
    const { document } = activeTextEditor;
    if (!document) return;

    const regionService = new RegionService(this._configService, document);
    const currentRegion = regionService.currentRegion();
    if (!currentRegion) return;

    const { startRegionTag } = currentRegion;
    const start1 = new vscode.Position(
      startRegionTag.lineNumber,
      <number>startRegionTag.startCharacter,
    );

    const ert = currentRegion.endRegionTag;
    const endLine = activeTextEditor.document.lineAt(ert.lineNumber);
    if (!endLine) return;
    const end2 = new vscode.Position(ert.lineNumber, endLine.text.length);

    activeTextEditor.selection = new vscode.Selection(start1, end2);
  }

  public selectCurrentRegionContents() {
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return;
    const { document } = activeTextEditor;
    if (!document) return;

    const regionService = new RegionService(this._configService, document);
    const currentRegion = regionService.currentRegion();
    if (!currentRegion) return;

    const { startRegionTag } = currentRegion;

    const startLineNumber = startRegionTag.lineNumber + 1;
    const endLineNumber = currentRegion.endRegionTag.lineNumber - 1;
    if (endLineNumber < startLineNumber) return;

    const startLine = activeTextEditor.document.lineAt(startLineNumber);
    const endLine = activeTextEditor.document.lineAt(endLineNumber);

    const start1 = startLine.range.start;
    const end1 = endLine.range.end;

    activeTextEditor.selection = new vscode.Selection(start1, end1);
  }

  public removeCurrentRegionTags() {
    vscode.window.showInformationMessage('Remove current region tags');
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return;
    let { document } = activeTextEditor;
    if (!document) return;

    const regionService = new RegionService(this._configService, document);
    const currentRegion = regionService.currentRegion();
    if (!currentRegion) return;

    activeTextEditor.edit(edit => {
      if (!currentRegion) return;
      if (!activeTextEditor) return;
      const { startRegionTag } = currentRegion;
      const start1 = new vscode.Position(
        startRegionTag.lineNumber,
        <number>startRegionTag.startCharacter,
      );
      const startLine = activeTextEditor.document.lineAt(
        startRegionTag.lineNumber,
      );
      const end1 = new vscode.Position(
        startRegionTag.lineNumber,
        startLine.text.length,
      );
      let range = new vscode.Range(start1, end1);
      edit.delete(range);

      const { endRegionTag } = currentRegion;
      const endLine = activeTextEditor.document.lineAt(endRegionTag.lineNumber);
      if (!endLine) return;

      const start2 = new vscode.Position(
        endRegionTag.lineNumber,
        <number>endRegionTag.startCharacter,
      );
      const end2 = new vscode.Position(
        endRegionTag.lineNumber,
        endLine.text.length,
      );
      range = new vscode.Range(start2, end2);
      edit.delete(range);
    });
  }

  public deleteCurrentRegion() {
    vscode.window.showInformationMessage('Delete current region tags');
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return;
    const { document } = activeTextEditor;
    if (!document) return;

    const regionService = new RegionService(this._configService, document);
    const currentRegion = regionService.currentRegion();
    if (!currentRegion) return;

    activeTextEditor.edit(edit => {
      if (!currentRegion) return;
      if (!activeTextEditor) return;
      const { startRegionTag, endRegionTag } = currentRegion;
      const start = new vscode.Position(
        startRegionTag.lineNumber,
        <number>startRegionTag.startCharacter,
      );
      const endLine = activeTextEditor.document.lineAt(endRegionTag.lineNumber);
      if (!endLine) return;

      const endLineText = endLine.text;
      const end = new vscode.Position(
        endRegionTag.lineNumber,
        endLineText.length,
      );
      const range = new vscode.Range(start, end);
      edit.delete(range);
    });
  }

  public collapseAllRegions(
    document: vscode.TextDocument | null = null,
    onlyDefaults: boolean = false,
  ) {
    if (!document) {
      const { activeTextEditor } = vscode.window;
      if (!activeTextEditor) return;
      document = activeTextEditor.document;
      if (!document) return;
    }

    console.log('Collapsing all regions');

    const rs = new RegionService(this._configService, document);
    const regions = rs.getRegions();
    const arr = [];
    for (let region of regions) {
      if (onlyDefaults && !region.isDefaultRegion) {
        continue;
      }
      arr.push(region.lineStart);
    }

    this.foldLines(document, arr);
  }

  public collapseAllDefaultFolds(document: vscode.TextDocument | null = null) {
    this.collapseAllRegions(document, true);
  }

  private getTextEditor(
    document: vscode.TextDocument,
  ): vscode.TextEditor | null {
    for (let te of vscode.window.visibleTextEditors)
      if (te.document.fileName === document.fileName) return te;
    return null;
  }

  private async foldLines(
    document: vscode.TextDocument,
    foldLines: Array<number>,
  ) {
    let str = '';
    foldLines.forEach(p => (str += p + ','));

    const textEditor = this.getTextEditor(document);
    if (!textEditor) {
      return;
    }
    const selection = textEditor.selection;

    for (const lineNumber of foldLines) {
      textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
      await vscode.commands.executeCommand('editor.fold');
    }
    textEditor.selection = selection;
  }

  public wrapWithRegionAndComment() {
    vscode.commands
      .executeCommand(
        'editor.action.commentLine',
        'editorHasDocumentFormattingProvider && editorTextFocus',
        true,
      )
      .then(() => {
        const textEditor = vscode.window.activeTextEditor;
        if (!textEditor) {
          return;
        }
        const selection = textEditor.selection;

        const newStart = new vscode.Position(selection.start.line, 0);
        const newEnd = textEditor.document.lineAt(selection.end.line).range.end;

        textEditor.selection = new vscode.Selection(newStart, newEnd);

        vscode.commands.executeCommand(
          'regionfolder.wrapWithRegion',
          'editorHasDocumentFormattingProvider && editorTextFocus',
          true,
        );
      });
  }

  public wrapWithRegion() {
    return new RegionWrapperService(
      this._configService,
    ).wrapCurrentWithRegion();
  }

  private registerFoldingRangeProvider() {
    const supportedLanguages = this._configService.getSupportedLanguages();
    const foldingRangeProvider = new CustomFolding(this._configService);
    console.log('Registering folding range provider');
    vscode.languages.registerFoldingRangeProvider(
      supportedLanguages,
      foldingRangeProvider,
    );

    this._configService.onConfigurationChanged = () => {
      foldingRangeProvider.configurationService = this._configService;
    };

    return foldingRangeProvider;
  }

  constructor(configService: config.ConfigurationService) {
    const self = this;
    this._configService = configService;
    this._foldingRangeProvider = this.registerFoldingRangeProvider();

    this._fileMonitor = new FileMonitor();
    this._fileMonitor.onFileOpened.add(function (doc) {
      console.log('File opened: ' + doc.fileName + ' lid: ' + doc.languageId);
      if (doc.languageId) {
        // HACK: No texteditor defined for document when this event has been called.
        const collapseOnlyDefaults = true;
        setTimeout(() => {
          const options = self._configService.getOptions();
          const collapseOnOpen = !!options.collapseDefaultRegionsOnOpen;
          console.log(
            '3xpo.regionfolder.collapseDefaultRegionsOnOpen:' + collapseOnOpen,
          );
          if (collapseOnOpen) {
            self.collapseAllRegions(doc, collapseOnlyDefaults);
          }
        }, 10);
      }
    });
    this._fileMonitor.onFileClosing.add(function (doc) {
      console.log('File closing: ' + doc.fileName);
    });
    this._fileMonitor.onLanguageIdChanged.add(function (doc, oldLID, newLID) {
      console.log('FileMonitor has detected change in language: ' + newLID);

      if (newLID) {
        const options = self._configService.getOptions();
        const collapseOnOpen = !!options.collapseDefaultRegionsOnOpen;
        console.log(
          '3xpo.regionfolder.collapseDefaultRegionsOnOpen: ' + collapseOnOpen,
        );
        if (collapseOnOpen) {
          self.collapseAllRegions(doc);
        }
      }
    });

    for (const vte of vscode.window.visibleTextEditors)
      this._fileMonitor.manuallyRegisterDocument(vte.document);
  }
}
/* #endregion */
