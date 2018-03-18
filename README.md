# \<xtal-treant\>

xtal-treant is a dependency free web component wrapper around the great [Treant](http://fperucic.github.io/treant-js/) library.

The web component requires a property, "config" to be set:

```html
<xtal-treant config="[[treeBeard]]"></xtal-treant>
```

You can set the zoom factor thusly:

```html
<xtal-treant zoom="0.5" config="[[treeBeard]]"></xtal-treant>
```


*Experimental*

You can enable auto zoom:

```html
<xtal-treant auto-zoom config="[[treeBeard]]"></xtal-treant>
```

Which will cause the diagram to resize as the container resizes.

This relies on the new resizableObserver, only available in Chrome. A polyfill is needed for other browsers (and the logic is still being tweaked), and [this polyfill](https://github.com/que-etc/resize-observer-polyfill) is used for the demo.

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
