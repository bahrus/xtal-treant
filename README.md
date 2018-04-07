# \<xtal-treant\>

xtal-treant is a dependency free web component wrapper around the great [Treant](http://fperucic.github.io/treant-js/) library.

The web component requires a property, "config" to be set:

```html
<xtal-treant config="[[treeBeard]]"></xtal-treant>
```

Because the library is designed to create different tree charts, based on a passed on css file, this raises a bit of a cunnundrum for a reusable web component.  You can pass in the css file in the config setting.  This will dynamically pass the css content into the shadow DOM.  [This currently has some issues in Chrome](https://github.com/Polymer/polymer/issues/4865).

So the better alternative is to define a preload link in document.head:

```html
<link class="treant css" relx="preload" as="fetch" href="../examples/basic-example/basic-example.css" data-postfix="basic">
```

Note the use of "treant" and "css" in the class, and the data-postfix value.

This will cause xtal-treant to dynamically create a new web component with name xtal-treant-basic, with the contents of the css file stamped into the template.

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
