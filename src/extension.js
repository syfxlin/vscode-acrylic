var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var events = require("events");
var msg = require("./messages").messages;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var fileUrl = require("file-url");

const readFile = (path, opts = 'utf8') => {
  new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const writeFile = (path, data, opts = 'utf8') => {
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function activate(context) {
  console.log("vscode-acrylic is active!");

  process.on("uncaughtException", function(err) {
    if (/ENOENT|EACCES|EPERM/.test(err.code)) {
      vscode.window.showInformationMessage(msg.admin);
      return;
    }
  });

  var eventEmitter = new events.EventEmitter();
  var isWin = /^win/.test(process.platform);
  var appDir = path.dirname(require.main.filename);

  var base = appDir + (isWin ? "\\vs\\code" : "/vs/code");

  var htmlFile =
    base +
    (isWin
      ? "\\electron-browser\\workbench\\workbench.html"
      : "/electron-browser/workbench/workbench.html");
  var jsFile = appDir + (isWin ? '\\main.js' : '/main.js');
  var htmlFileBack =
    base +
    (isWin
      ? "\\electron-browser\\workbench\\workbench.html.bak-acrylic"
      : "/electron-browser/workbench/workbench.bak-acrylic");
  var jsFileBack = appDir + (isWin ? '\\main.bak-acrylic' : '/main.bak-acrylic')

  var config = vscode.workspace.getConfiguration("vscode_acrylic");
  if (
    !config ||
    !(typeof config.effect === "string") ||
    !/(acrylic|blurBehind|trGradient|disable)/.test(config.effect)
  ) {
    vscode.window.showInformationMessage(msg.notconfigured);
    console.log(msg.notconfigured + "config:" + config);
    fUninstall();
    return;
  }

  var injectJS = `
  (function(){
    const electron = require('electron');
    electron.app.on('browser-window-created', (event, window) => {
      window.webContents.on('dom-ready', () => {
        var vscode_acrylic = {
          config: ${JSON.stringify(config.effect)},
          w: window,
          ewcBase: require(${JSON.stringify(__dirname + "\\ewc.node")}),
          SWCA: (wind, accent, tint) => {
            wind = wind.getNativeWindowHandle();
            return vscode_acrylic.ewcBase.setComposition(wind, accent, tint);
          },
          ewc: {
            disable: (wind) => {
              return vscode_acrylic.SWCA(wind, 0, 0x00000000);
            },
            setGradient: (wind, tint) => {
              return vscode_acrylic.SWCA(wind, 1, tint);
            },
            setTransparentGradient: (wind, tint) => {
              return vscode_acrylic.SWCA(wind, 2, tint);
            },
            setBlurBehind: (wind, tint) => {
              return vscode_acrylic.SWCA(wind, 3, tint);
            },
            setAcrylic: (wind, tint) => {
              return vscode_acrylic.SWCA(wind, 4, tint);
            }
          }
        }
  
        vscode_acrylic.w.setBackgroundColor('#00000000');
        if (vscode_acrylic.config === "acrylic") {
            vscode_acrylic.ewc.setAcrylic(vscode_acrylic.w, 0x14800020);
        } else if (vscode_acrylic.config === "blurBehind") {
            vscode_acrylic.ewc.setBlurBehind(vscode_acrylic.w, 0x14800020);
        } else if (vscode_acrylic.config === "trGradient") {
            vscode_acrylic.ewc.setTransparentGradient(vscode_acrylic.w, 0x14800020);
        } else if (vscode_acrylic.config === "disable") {
            vscode_acrylic.ewc.disable(vscode_acrylic.w, 0x14800020);
        }
        // hack
        const width = vscode_acrylic.w.getBounds().width;
        vscode_acrylic.w.setBounds({
          width: width + 1,
        });
        vscode_acrylic.w.setBounds({
          width,
        });
      });
    })
  })()
  `;
  var injectHTML = `
	<style>
	html {
		background: transparent !important;
	}
	.scroll-decoration {
		box-shadow: none !important;
	}
	.minimap, .editor-scrollable .decorationsOverviewRuler {
		opacity: 0.6;
	}
	.editor-container {
		background: transparent !important;
	}
	.search-view .search-widget .input-box, .search-view .search-widget .input-box .monaco-inputbox,
	.monaco-workbench .part.editor .content .one-editor-silo .container .title .tabs-container .tab,
	.monaco-editor-background,
	.monaco-editor .margin,
	.monaco-workbench .editor .content .one-editor-silo.editor-one,
	.monaco-workbench .part.editor .content .one-editor-silo .container .title,
	.monaco-workbench .part .title,
	.monaco-workbench,
	body {
		background: rgba(37, 37, 37, 0.20) !important;
	}
	.editor-group-container .tabs {
		background-color: transparent !important;
	}
	.editor-group-container .tabs .tab {
		background-color: transparent !important;
	}
	.editor-group-container .tabs .tab.active, .editor-group-container .tabs .monaco-breadcrumbs {
		background-color: rgba(37, 37, 37,0.4) !important;
	}
	.monaco-list.settings-toc-tree .monaco-list-row.focused {
		outline-color: rgb(37, 37, 37,0.6) !important;
	}
	.monaco-list.settings-toc-tree .monaco-list-row.selected,
	.monaco-list.settings-toc-tree .monaco-list-row.focused,
	.monaco-list .monaco-list-row.selected,
	.monaco-list.settings-toc-tree:not(.drop-target) .monaco-list-row:hover:not(.selected):not(.focused) {
		background-color: rgb(37, 37, 37,0.6) !important;
	}
	.monaco-list.settings-editor-tree .monaco-list-row {
		background-color: transparent !important;
		outline-color: transparent !important;
	}
	.monaco-inputbox {
		background-color: rgba(41, 41, 41, 0.2) !important;
	}
	.monaco-editor .selected-text {
		background-color: rgba(58, 61, 65, 0.6) !important;
	}
	.monaco-editor .focused .selected-text {
		background-color: rgba(38, 79, 120, 0.6) !important;
	}
	.monaco-editor .view-overlays .current-line {
		border-color: rgba(41, 41, 41,0.2) !important;
	}
	
	.extension-editor,
	.monaco-inputbox .wrapper .input,
	.monaco-workbench .part.editor .content .one-editor-silo .container .title .tabs-container .tab.active,
	.preferences-editor .preferences-header,
	.preferences-editor .preferences-editors-container.side-by-side-preferences-editor .preferences-header-container,
	.monaco-editor, .monaco-editor .inputarea.ime-input {
		background: transparent !important;
	}
	.editor-group-container .tabs .tab {
		border: none !important;
  }

  .monaco-workbench .panel.integrated-terminal *:not(.xterm-cursor):not(.xterm-cursor-block) {
    background: transparent !important;
  }
  .monaco-workbench .panel.integrated-terminal *:hover:not(.xterm-cursor):not(.xterm-cursor-block) {
    background: transparent !important;
  }
  .monaco-workbench .panel.integrated-terminal .terminal-outer-container {
    background-color: rgba(37, 37, 37,0.4);
  }
  .monaco-select-box {
    background-color: transparent !important;
    color: rgb(240, 240, 240) !important;
    border-color: rgba(37, 37, 37,0.4) !important;
  }
  .monaco-editor .find-widget {
    background-color: rgba(37, 37, 37, 1);
  }
  .monaco-editor .view-overlays .current-line {
    background: rgba(41, 41, 41, 0.8) !important;
  }
  .monaco-workbench .panel.integrated-terminal .find-focused .xterm .xterm-viewport, .monaco-workbench .panel.integrated-terminal .xterm.focus .xterm-viewport, .monaco-workbench .panel.integrated-terminal .xterm:focus .xterm-viewport, .monaco-workbench .panel.integrated-terminal .xterm:hover .xterm-viewport {
    background: transparent !important;
  }
  
	.monaco-workbench .part:not(.editor):not(.sidebar) {
		background-color: rgba(37, 37, 37, 0.6) !important;
  }
	.monaco-workbench .part.editor .content {
    background-color: rgba(37, 37, 37, 0.45) !important;
  }
  .monaco-workbench .part.sidebar {
    background-color: transparent !important;
  }
  .monaco-workbench .part.sidebar .composite.title {
    background-color: rgba(37, 37, 37, 0.6) !important;
  }
  .monaco-panel-view .panel .panel-body {
    background: rgba(37, 37, 37, 0.45) !important;
  }
  .monaco-panel-view .panel .panel-header {
    background: rgba(37, 37, 37, 0.6) !important;
  }
	</style>
	`;

  function replaceCss() {
    try {
      var html = fs.readFileSync(htmlFile, "utf-8");
      html = html.replace(
        /<!-- !! VSCODE-ACRYLIC-START !! -->[\s\S]*?<!-- !! VSCODE-ACRYLIC-END !! -->/,
        ""
      );
      html = html.replace(/<meta.*http-equiv="Content-Security-Policy".*>/, "");

      html = html.replace(
        /(<\/html>)/,
        "<!-- !! VSCODE-ACRYLIC-START !! -->" +
          injectHTML + 
          "<!-- !! VSCODE-ACRYLIC-END !! --></html>"
      );
      fs.writeFileSync(htmlFile, html, "utf-8");
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin);
      console.log(e);
    }
  }

  function replaceJs() {
    try {
      var js = fs.readFileSync(jsFile, "utf-8");
      js = js.replace(/<!-- !! VSCODE-ACRYLIC-START !! -->[\s\S]*?<!-- !! VSCODE-ACRYLIC-END !! -->/,
        "");
      js = js + "\n/* !! VSCODE-ACRYLIC-START !! */\n" + injectJS + "\n/* !! VSCODE-ACRYLIC-END !! */\n";
      fs.writeFileSync(jsFile, js, "utf-8");
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin);
      console.log(e);
    }
  }

  function emitEndUninstall() {
    eventEmitter.emit("endUninstall");
  }

  function restoredAction(isRestored, willReinstall) {
    if (isRestored >= 1) {
      if (willReinstall) {
        emitEndUninstall();
      } else {
        disabledRestart();
      }
    }
  }

  function restoreBak(willReinstall) {
    var restore = 0;
    try {
      fs.unlinkSync(htmlFile);
      fs.unlinkSync(jsFile);
      fs.writeFileSync(htmlFile, fs.readFileSync(htmlFileBack));
      fs.writeFileSync(jsFile, fs.readFileSync(jsFileBack));
      fs.unlinkSync(htmlFileBack);
      fs.unlinkSync(jsFileBack);
      restore++;
      restoredAction(restore, willReinstall);
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin);
    }
  }

  function enabledRestart() {
    vscode.window
      .showInformationMessage(msg.enabled, { title: msg.restartIde })
      .then(msg => {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  }
  function disabledRestart() {
    vscode.window
      .showInformationMessage(msg.disabled, { title: msg.restartIde })
      .then(msg => {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  }

  // ####  main commands ######################################################

  function fInstall() {
    fs.writeFileSync(htmlFileBack, fs.readFileSync(htmlFile));
    fs.writeFileSync(jsFileBack, fs.readFileSync(jsFile));
    replaceCss();
    replaceJs();
    enabledRestart();
  }

  function fUninstall(willReinstall) {
    try {
      fs.statSync(htmlFileBack);
      fs.statSync(jsFileBack);
    } catch (e) {
      if (willReinstall) {
        emitEndUninstall();
      }
    }
    try {
      fs.statSync(htmlFile);
      fs.statSync(jsFile);
    } catch (e) {
      vscode.window.showInformationMessage(msg.smthingwrong + errOr);
    }
    restoreBak(willReinstall);
  }

  function fUpdate() {
    eventEmitter.once("endUninstall", fInstall);
    fUninstall(true);
  }

  var installAcrylic = vscode.commands.registerCommand(
    "extension.installAcrylic",
    fInstall
  );
  var uninstallAcrylic = vscode.commands.registerCommand(
    "extension.uninstallAcrylic",
    fUninstall
  );
  var updateAcrylic = vscode.commands.registerCommand(
    "extension.updateAcrylic",
    fUpdate
  );

  context.subscriptions.push(installAcrylic);
  context.subscriptions.push(uninstallAcrylic);
  context.subscriptions.push(updateAcrylic);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
