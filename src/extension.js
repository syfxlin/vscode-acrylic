var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var events = require("events");
var msg = require("./messages").messages;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var fileUrl = require("file-url");

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
  var htmlFileBack =
    base +
    (isWin
      ? "\\electron-browser\\workbench\\workbench.html.bak-acrylic"
      : "/electron-browser/workbench/workbench.bak-acrylic");

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
  var injectHTML = `
  <script>
	window.vscode_acrylic = {
    config: "${config.effect}",
		w: nodeRequire('electron').remote.getCurrentWindow(),
		ewcBase: nodeRequire(${JSON.stringify(__dirname + "\\ewc.node")}),
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

	</script>

	<style>
	html {
		background: 'transparent' !important;
	}
	
	.scroll-decoration {
		box-shadow: none !important;
	}
	
	.minimap, .editor-scrollable>.decorationsOverviewRuler {
		opacity: 0.6;
	}
	
	.editor-container {
		background: transparent !important;
	}
	
	.search-view .search-widget .input-box, .search-view .search-widget .input-box .monaco-inputbox,
	.monaco-workbench>.part.editor>.content>.one-editor-silo>.container>.title .tabs-container>.tab,
	.monaco-editor-background,
	.monaco-editor .margin,
	.monaco-workbench>.part>.content,
	.monaco-workbench>.editor>.content>.one-editor-silo.editor-one,
	.monaco-workbench>.part.editor>.content>.one-editor-silo>.container>.title,
	.monaco-workbench>.part>.title,
	.monaco-workbench,
	.monaco-workbench>.part,
	body {
		background: rgba(0,0,0,0.20) !important;
	}
	
	.editor-group-container>.tabs {
		background-color: transparent !important;
	}
	
	.editor-group-container>.tabs .tab {
		background-color: transparent !important;
	}
	
	.editor-group-container>.tabs .tab.active, .editor-group-container>.tabs .monaco-breadcrumbs {
		background-color: rgba(37, 37, 37,0.3) !important;
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
		background-color: rgba(41, 41, 41,0.2) !important;
	}
	
	.monaco-editor .selected-text {
		background-color: rgba(58, 61, 65,0.6) !important;
	}
	
	.monaco-editor .focused .selected-text {
		background-color: rgba(38, 79, 120,0.6) !important;
	}
	
	.monaco-editor .view-overlays .current-line {
		border-color: rgba(41, 41, 41,0.2) !important;
	}
	
	.extension-editor,
	.monaco-inputbox>.wrapper>.input,
	.monaco-workbench>.part.editor>.content>.one-editor-silo>.container>.title .tabs-container>.tab.active,
	.preferences-editor>.preferences-header,
	.preferences-editor>.preferences-editors-container.side-by-side-preferences-editor .preferences-header-container,
	.monaco-editor, .monaco-editor .inputarea.ime-input {
		background: transparent !important;
	}

	
	.monaco-workbench>.part.sidebar {
		background-color: rgba(37, 37, 38, 0.3) !important;
	}
	
	
	.editor-group-container>.tabs .tab {
		border: none !important;
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
      enabledRestart();
    } catch (e) {
      console.log(e);
    }
  }

  function timeDiff(d1, d2) {
    var timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return timeDiff;
  }

  function hasBeenUpdated(stats1, stats2) {
    var dbak = new Date(stats1.ctime);
    var dor = new Date(stats2.ctime);
    var segs = timeDiff(dbak, dor) / 1000;
    return segs > 60;
  }

  function cleanCssInstall() {
    var c = fs
      .createReadStream(htmlFile)
      .pipe(fs.createWriteStream(htmlFileBack));
    c.on("finish", function() {
      replaceCss();
    });
  }

  function installItem(bakfile, orfile, cleanInstallFunc) {
    fs.stat(bakfile, function(errBak, statsBak) {
      if (errBak) {
        // clean installation
        cleanInstallFunc();
      } else {
        // check htmlFileBack's timestamp and compare it to the htmlFile's.
        fs.stat(orfile, function(errOr, statsOr) {
          if (errOr) {
            vscode.window.showInformationMessage(msg.smthingwrong + errOr);
          } else {
            var updated = hasBeenUpdated(statsBak, statsOr);
            if (updated) {
              // some update has occurred. clean install
              cleanInstallFunc();
            }
          }
        });
      }
    });
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
    fs.unlink(htmlFile, function(err) {
      if (err) {
        vscode.window.showInformationMessage(msg.admin);
        return;
      }
      var c = fs
        .createReadStream(htmlFileBack)
        .pipe(fs.createWriteStream(htmlFile));
      c.on("finish", function() {
        fs.unlinkSync(htmlFileBack);
        restore++;
        restoredAction(restore, willReinstall);
      });
    });
  }

  function reloadWindow() {
    // reload vscode-window
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }

  function enabledRestart() {
    vscode.window
      .showInformationMessage(msg.enabled, { title: msg.restartIde })
      .then(function(msg) {
        reloadWindow();
      });
  }
  function disabledRestart() {
    vscode.window
      .showInformationMessage(msg.disabled, { title: msg.restartIde })
      .then(function(msg) {
        reloadWindow();
      });
  }

  // ####  main commands ######################################################

  function fInstall() {
    installItem(htmlFileBack, htmlFile, cleanCssInstall);
  }

  function fUninstall(willReinstall) {
    fs.stat(htmlFileBack, function(errBak, statsBak) {
      if (errBak) {
        if (willReinstall) {
          emitEndUninstall();
        }
        return;
      }
      fs.stat(htmlFile, function(errOr, statsOr) {
        if (errOr) {
          vscode.window.showInformationMessage(msg.smthingwrong + errOr);
        } else {
          restoreBak(willReinstall);
        }
      });
    });
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
