# Acrylic - VSCode Extension

> :art: Add Acrylic,BlurBehind,TransparentGradient background effects to VSCode(Windows).

![screenshot](https://raw.githubusercontent.com/syfxlin/vscode-acrylic/master/screenshot.png)

## Supported OS

Windows 10 ✔

## Getting Started

1. Install this extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=syfxlin.vscode-acrylic).
2. Turn on any dark theme (because these effects don't work well on bright colors)
3. Edit setting.json add `"vscode_acrylic.effect": "acrylic"` or `blurBehind`,`trGradient`,`disable`
4. Press F1 and Activate command "Enable Acrylic".
5. Restart VSCode

Please "Enable Acrylic" with admin privileges.

## Uninstall

Press F1 and Activate command "Disable Acrylic", and Restart VSCode.

## FAQs

#### Why is my terminal still black?

You should change the renderer type of the terminal to dom

`"terminal.integrated.rendererType": "dom"`

#### Why is it only changed color when enabled, but not transparent?

You need to turn VSCode off and back on instead of using reload window.

#### Why not supported MacOS?

The [vibrancy](https://github.com/EYHN/vscode-vibrancy) plugin has been implemented without the need to do duplicates. And the effect of MacOS is different from Windows.

#### Why make this plugin?

The Acrylic effect on Windows has a sliding delay, but there is no problem with BlurBehind and TransparentGradient, so I made a plugin that can choose the effect.

## Links

- [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=syfxlin.vscode-acrylic)
- [Github](https://github.com/syfxlin/vscode-acrylic)
- [Introduction](https://blog.ixk.me/vscode-acrylic.html)

## Thinks

- [vscode-custom-css](https://github.com/be5invis/vscode-custom-css)
- [vscode-vibrancy](https://github.com/EYHN/vscode-vibrancy)
- [ewc](https://github.com/23phy/ewc)

## Render

#### Acrylic

![screenshot](https://raw.githubusercontent.com/syfxlin/vscode-acrylic/master/screenshot.png)

#### BlurBehind

![screenshot-blur](https://raw.githubusercontent.com/syfxlin/vscode-acrylic/master/screenshot-blur.png)

#### TransparentGradient

![screenshot-tr](https://raw.githubusercontent.com/syfxlin/vscode-acrylic/master/screenshot-tr.png)
