# lord-icon-element

Easy to use _custom element_ for embedding interactive, animated icons downloaded from [lordicon.com](https://lordicon.com/) on the web.

This project is meant to give developers full control over customize and animate icons. It can assist you with many areas:

- Load and renders animated icons with simple html tag __lord-icon__.
- Customize stroke, colors and other supported properties on the fly.
- Manually interact with icon and its animation. React to the state / phases of the animation.
- Provides triggers which allows to choose build in interaction strategy with users. Use one of build in: _click_, _hover_, _morph_, _loop_, _loop-on-hover_, _boomerang_.

## Installation

```bash
$ npm install lord-icon-element lottie-web
```

## Usage

This package should be used in pair with [lottie-web](https://www.npmjs.com/package/lottie-web). It's recommended to use this package with module bundler like [webpack](https://www.npmjs.com/package/webpack).

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

Download our repository. To build and preview our examples yourself, run:

```bash
npm i
npm start
```

List of available examples:

- __release__ - This example presents the easiest way to use the Lordicon custom element with released version. It is not the most efficient method as the entire library (including lottie-web) is initialized by default.
- __triggers__ - In this example, we present all available build-in animation triggers.
- __trigger target__ - Use the target attribute to indicate which parent element should activate the trigger. Helpful functionality when building all kinds of links, buttons where we don't want the user to have to point the mouse cursor at the icon to activate it.
- __customization__ - In this example, we present all customizable attribiutes supported by element.
- __current color__ - This case study presents, a class built into element: _current-color_. With this class icon will inherit color from parent.
- __css variables__ - Example usage of css variables to customize colors on supported icons (at the moment all icons from system family). Notice: css variables take precedence over colors assigned by other methods!
- __background__ - This example presents the use of the element as a content container.
- __manual control__ - Example of manual interaction with icon and player.
- __icon loader__ - Example of creating icon loader callback which can be used to provide icon data from alternate sources.
- __lazy loading__ - Load icons only when needed.
- __lazy loading effect__ - Load icons only when needed. Fade in icons after load completes.
- __state__ - This example presents usage for icons state animation. It is easier than ever to switch between each motion type to use them as stand-alone animations or combine and create an interactive experience.
- __custom trigger__ - If none of the provided triggers meet what we need to implement, we allow building custom animation triggers. Provided example show how to create trigger which will reverse animation on second click.
- __custom trigger in screen__ - This example presents how to build an animation trigger, which plays animation once icon appears in the browser viewport.
- __custom trigger states__ - Complex usage example of states with custom trigger. See how the trash appears, fills, and empties as the user interacts.
- __lottie light__ - Example of use our element with lottie-web-light which is a lot smaller but don't support expressions (and as a consequence dynamic customization). You can use light version in pair with our raw icons data.

## Useful links
- [element.lordicon.com](https://element.lordicon.com/) - Full documentation of this _custom element_.
- [lordicon.com](https://lordicon.com/) - Lordicon is a powerful library of carefully crafted animated icons. Ready to use in digital products, presentations, or videos.
- [lottie](http://airbnb.io/lottie) - Render After Effects animations natively on Web, Android and iOS, and React Native.