# lord-icon-element

A convenient _custom element_ for embedding animated icons.

## Overview

`lord-icon-element` lets you write websites with fancy, interactive, animated icons. With this element you can embed and control Lottie Files. Under the hood, the library uses awesome _lottie-web_ animation player. [Explore supported free interactive icons.](https://lordicon.com/icons#free)

## Installation

```bash
$ npm install lord-icon-element lottie-web
```

## Usage

From script module:

```js
import { loadAnimation } from "lottie-web";
import { defineLordIconElement } from "lord-icon-element";

// register lottie and define custom element
defineLordIconElement(loadAnimation);
```

From markup:

```html
<lord-icon trigger="hover" src="/my-icon.json"></lord-icon>
```

## Examples

For more usage examples visit our repository. It's recommended to run them with:

```bash
npm i
npm start
```

After that your browser will start automatically with our [many examples](https://github.com/tomwilusz/lord-icon-element/tree/master/examples).

## Notice

### Compatibility

This library support at the moment only modern browsers which allows to use **Web Components** and **JavaScript Modules**. If you need to support legacy browsers include in your project [polyfills](https://www.webcomponents.org/polyfills).

### Modules

It's recommended to use this library with _module bundler_ tools like **webpack**. If you want use this library without bundler, remember to import modules by path, not by package name.

### Static release

You can use this library also without JS modules with released version. This is simplest way to use our element without any initialization and external tools. Just look for our [JSFiddle example](https://jsfiddle.net/dxaue2y9/).
