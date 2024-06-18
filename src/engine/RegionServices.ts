/* #region Imports */
'use strict';
import * as vscode from 'vscode';

import * as config from './../config/Configuration';
import { RegionProvider, CustomRegion } from './CustomRegions';
/* #endregion */

/* #region RegionService */
export class RegionService {
  regionProvider: RegionProvider;
  document: vscode.TextDocument;
  regions: CustomRegion[];

  public constructor(
    configService: config.ConfigurationService,
    document: vscode.TextDocument,
  ) {
    this.regionProvider = new RegionProvider(configService);
    this.document = document;
    this.regions = [];
  }

  public update() {
    this.regions = this.regionProvider.getRegions(
      this.document,
    ).completedRegions;
  }

  public getRegions() {
    this.update();
    return this.regions;
  }

  public getCurrentRegions(): CustomRegion[] {
    this.update();
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return [];
    if (this.document !== activeTextEditor.document) return [];
    const surroundingRegions: CustomRegion[] = [];
    for (let reg of this.regions)
      if (reg.contains(activeTextEditor.selection.active))
        surroundingRegions.push(reg);
    return surroundingRegions;
  }

  public currentRegion(): CustomRegion | null {
    const currentRegions = this.getCurrentRegions();
    if (currentRegions.length === 0) return null;
    return currentRegions[0];
  }
}
/* #endregion */
