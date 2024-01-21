## Note

This is a hard-fork of the upstream extension by Maptz. This fork exists as the code style in the upstream codebase is some of the least consistent, horribly thought-out shit ever. It mixes `var` with `let`/`const` constantly, amongst other shit.

# Visual Studio Code Custom Folding Extension

This extension enhances the default code folding abilities of Visual Studio Code editor. Regions of code that you'd like to be folded can be wrapped with `#region` comments.

![Custom Folding](https://raw.githubusercontent.com/Exponential-Workload/regionfolder/master/imgs/CSharp_region_wrap.gif)

The precise format of the comment depends on the language. For instance, for C-Style languages, regions are of the form:

    /* #region Main */
    public static void Main(string args[])
    {
       //Your code goes here
    }
    /* #endregion */

For HTML style languages, you could define a foldable region with the following tags:

    <!-- #region Body -->
    <body>
    </body>
    <!-- #endregion -->

## Commands

The extension also installs a command to wrap a `region` comment around the current selection.

- regionfolder.wrapWithRegion (Ctrl+M Ctrl+R)

## Configuration

The extension provides configuration settings, allowing you to provide custom region tags for your language.

To provide a custom folding for your language create a settings in your vscode settings file (either user or workspace) that conforms to the following specification.

    "3xpo.regionfolder": {
        "[ahk]": {                                      //Language selector
            "foldEnd": "; #endregion",                    //Text inserted at the end of the fold
            "foldEndRegex": ";[\\s]*#endregion",          //Regex used to find fold end text.
            "foldStart": "; #region [NAME]",              //Text inserted at the start of the fold.
                                                        //Use the `[NAME]` placeholder to indicate
                                                        //where the cursor should be placed after
                                                        //insertion
            "foldStartRegex": ";[\\s]*#region[\\s]*(.*)",  ////Regex used to find fold start text.
            "disableFolding": false //Turn off #region folding for this language
      }
    }

## Installing

<!-- #region  -->

You can install the latest version of the extension is available on the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=3xpo.regionfolder).

Alternatively, open Visual Studio code, press `Ctrl+P` and type:

> ext install regionfolder

<!-- #endregion -->

## Features

### Feature - Default Folding

A new feature is the notion of `default folds`. Default folds define regions which will be collapsed whenever the file is opened. In the current preview version, default folds are only collapsed when the `regionfolder.collapseDefault` command is issued from the command palette.

You can create a default fold by creating a Regex expression which defines the default fold for the language of your choice in your settings file. The Regex is defined in the `defaultFoldStartRegex` property.

In the following example, defined for the Markdown language, default folds are defined as regions in the following form:

```
<!-- #region(collapsed) [NAME] -->
Some default content here
<!-- #endregion -->
```

The settings for this default fold are below. You can either put this in your Workspace settings file (`.vscode/settings.json`) or in your user profile settings file:

```
    "3xpo.regionfolder": {
        "[markdown]": {
            "defaultFoldStartRegex": "\\<!--[\\s]*#region\\(collapsed\\)[\\s]*(.*)",

            "foldEnd": "<!-- #endregion -->",
            "foldEndRegex": "\\<!--[\\s]*#endregion",
            "foldStart": "<!-- #region [NAME] -->",
            "foldStartRegex": "\\<!--[\\s]*#region[\\s]*(.*)"
        }
    }
```

You can now use the `collapseDefaultRegionsOnOpen` setting to determine whether regions are collapsed by default when a new file is opened.

```
{
    "3xpo.regionfolder.collapseDefaultRegionsOnOpen": true
}
```

### Feature - Per-Language Disabling

You can now turn off custom folding on a per-language basis. To do this, you need to add `disableFolding` to the settings for the particular language. You will need to restart VS Code for the changes to take effect.

So, for instance, to turn off folding for `cpp` add the following to your settings file:

```
    "3xpo.regionfolder": {
        "[cpp]": {
            "disableFolding": true
        }
    }
```

### Feature - Multiple Fold Definitions Per Language (Preview)

The extension now has preview support for defining multiple fold definitions per language. Secondary folds can be defined in the `foldDefinitions` property in the settings for each language. By settting the `isFoldedByDefault` value to `true`, you can ensure that the folds are collapsed by default when the file opens.

The example below is used to collapse Copyright style headers by default in Javascript files:

```
/***************************************************
 * Copyright (c) 2020 maptz.
 * All rights reserved.
 ***************************************************/
```

The `.vscode/settings.json` file used to define this behaviour is:

```
{
  "3xpo.regionfolder": {
    "[javascript]": {
      "foldEnd": "/* #endregion */",
      "foldEndRegex": "/\\*[\\s]*#endregion",
      "foldStart": "/* #region [NAME] */",
      "foldStartRegex": "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$",
      "defaultFoldStartRegex": "^[\\s]*/\\*[\\s]*#region[\\s]*default\\s(.*)[\\s]*\\*/[\\s]*$",
      "foldDefinitions": [
        {
          "foldEndRegex": "\\*+/[\\s]*$",
          "foldStartRegex": "^[\\s]*/\\*\\*+" ,
          "isFoldedByDefault": true
        }
      ]
    }
  }
}
```

### Commands

The commands that this extension provides are listed below:

#### `regionfolder.collapseAllRegions` - _Collapse all #regions._

Collapses all #regions for the current document.

#### `regionfolder.collapseDefault`- _Collapse default #regions._

Collapses all default #regions for the current document (i.e. those defined with a `defaultFoldStartRegex`).

#### `regionfolder.deleteRegion` - _Delete current #region tags and contents_

Deletes the current #region including all the #region tags, and all contents between the tags.

#### `regionfolder.removeCurrentRegionTags` - _Delete current #region tags_

Deletes the current #region tags, leaving the contents between the tags intact.

#### `regionfolder.wrapWithRegion` - _Wrap selection with #region tag._

Wraps the currently selected text with #region tags.

#### `regionfolder.wrapWithRegionAndComment` - _Wrap with #region tag and comment._

Wraps the currently seected text with #region tags, and comments the selection out.

#### `regionfolder.selectCurrentRegion` - _Select current #region._

Selects the whole current #region, including the tags.

#### `regionfolder.selectCurrentRegionContents`. - _Select current #region contents._

Selects the text within the current #region, not including the tags.

## Bugs and Features

The Changelog can be found [here](CHANGELOG.md).

Please log any bugs on Github [here](https://github.com/Exponential-Workload/regionfolder/issues).

If you have a new language that you've supported using the custom configuration, we'd love to incorporate it into the defaults for the extension. Please log an issue or a pull request on the repo [here](https://github.com/Exponential-Workload/regionfolder/).

## Source Code

The source code is available on GitHub [here](https://github.com/Exponential-Workload/regionfolder).
