# 🚀 Project Relocation

This project has been relocated to a [new repository](https://github.com/lordicondev/lordicon). We invite you to track the project at its new location, where we will continue to develop and maintain the library.

# lord-icon-element

This package gives developers an easy way to embed, control and customize [Lordicon](https://lordicon.com/) animated icons inside web projects.

It can assist with:

- Load and render animated icons with the simple HTML tag __lord-icon__.
- Customize stroke width, colors, and other supported properties on the fly.
- Manually interact with icons and their animation. React to the motion types / states of the animation.
- Provides animation triggers allowing to choose a built-in interaction like: _click_, _hover_, _morph_, _loop_, _loop-on-hover_, _boomerang_.

## Installation

```bash
$ npm install lord-icon-element lottie-web
```

## Usage

This package should be used in pair with [lottie-web](https://www.npmjs.com/package/lottie-web). We recommend using this package with a module bundler like [Webpack](https://www.npmjs.com/package/webpack).

From script module:

```js
import lottie from 'lottie-web';
import { defineElement } from 'lord-icon-element';

// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);
```

From markup:

```html
<lord-icon trigger="hover" src="/my-icon.json"></lord-icon>
```

## Examples

Download our repository, to build and preview animated icons usage examples by yourself, run:


```bash
npm i
npm start
```

List of available examples:

- __release__ - This example presents the easiest way to use the Lordicon custom element with released version. Keep in mind that this is not the most efficient method as the entire library (including bundled lottie-web) is loaded by default.
- __triggers__ - In this example, we present all available built-in animation triggers.
- __trigger target__ - Use the target attribute to indicate which parent element should activate the trigger. Helpful functionality when building all kinds of links, buttons, or bounding boxes where we don't want the user to have to mouse hover exactly at the icon to activate it.
- __customization__ - This example presents all customizable attributes supported by element.
- __current color__ - This case study presents, a class built into element: _current-color_. With this class, icon will inherit color from a parent.
- __css variables__ - This example utilizes CSS variables to customize colors on supported icons (at the moment only System icons). Notice: CSS variables take precedence over colors assigned by other methods!
- __background__ - This example presents the use of the element as a background.
- __manual control__ - Example of manual interaction with icon and player.
- __icon loader__ - Example of creating icon loader callback which can be used to provide icon data from alternate sources.
- __loading lazy__ - Load icons only when needed.
- __loading lazy effect__ - Load icons only when needed. Fade in icons after the load completes, to create a simultaneous smooth appearance.
- __loading-placeholder__ - Example of showing super small SVG until custom element is ready.
- __loading-placeholder-interaction__ - Example of showing super small SVG until first user interaction with element.
- __state__ - This example presents usage for icons state animation. It is easier than ever to switch between each motion type to use them as stand-alone animations or combine and create an interactive experience.
- __custom trigger__ - If none of the provided triggers meet what we need to implement, we allow building custom animation triggers. Provided example shows how to create trigger which will reverse animation on the second click.
- __custom trigger scroll__ - This custom trigger plays an animation when a user scrolls the website.
- __custom trigger in screen__ - This example presents how to build an animation trigger, which plays animation once the icon appears in the browser viewport.
- __custom trigger states__ - Complex usage example of states with the custom trigger. Eg. see how the trash icon appears, fills, and erases as the user interacts.
- __lottie light__ - Example of use our element with _lottie-web-light_ which is a way smaller in size but doesn't support expressions (and as a consequence dynamic customization). You can use the light version in pair with our raw icon data.

## Useful links
- [Docs](https://element.lordicon.com/) - Full documentation of this _custom element_.
- [Lordicon Library](https://lordicon.com/) - Lordicon is a powerful library of thousands of carefully crafted animated icons.
- [Lottie](http://airbnb.io/lottie) - Render After Effects animations natively on Web, Android and iOS, and React Native.
