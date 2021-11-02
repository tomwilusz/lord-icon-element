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

After that your browser will start automatically with our demo.
