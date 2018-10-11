[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-treant)

<a href="https://nodei.co/npm/xtal-treant/"><img src="https://nodei.co/npm/xtal-treant.png"></a>

# \<xtal-treant\>

<!--
```
<custom-element-demo>
  <template>
  <div>
    <h3>Basic xtal-treant demo</h3>

  <script>
    const config1 = {
      cssPaths: [],
      connectors: {
        type: 'step'
      },
      node: {
        HTMLclass: 'nodeExample1'
      }
    };
    const ceo = {
      text: {
        name: "Mark Hill",
        title: "Chief executive officer",
        contact: "Tel: 01 213 123 134",
      },
      image: "../examples/headshots/2.jpg"
    };

    const cto = {
      parent: ceo,
      text: {
        name: "Joe Linux",
        title: "Chief Technology Officer",
      },
      stackChildren: true,
      image: "../examples/headshots/1.jpg"
    };
    const cbo = {
      parent: ceo,
      stackChildren: true,
      text: {
        name: "Linda May",
        title: "Chief Business Officer",
      },
      image: "../examples/headshots/5.jpg"
    };
    const cdo = {
      parent: ceo,
      text: {
        name: "John Green",
        title: "Chief accounting officer",
        contact: "Tel: 01 213 123 134",
      },
      image: "../examples/headshots/6.jpg"
    };
    const cio = {
      parent: cto,
      text: {
        name: "Ron Blomquist",
        title: "Chief Information Security Officer"
      },
      image: "../examples/headshots/8.jpg"
    };
    const ciso = {
      parent: cto,
      text: {
        name: "Michael Rubin",
        title: "Chief Innovation Officer",
        contact: { val: "we@aregreat.com", href: "mailto:we@aregreat.com" }
      },
      image: "../examples/headshots/9.jpg"
    };
    const cio2 = {
      parent: cdo,
      text: {
        name: "Erica Reel",
        title: "Chief Customer Officer"
      },
      link: {
        href: "http://www.google.com"
      },
      image: "../examples/headshots/10.jpg"
    };
    const ciso2 = {
      parent: cbo,
      text: {
        name: "Alice Lopez",
        title: "Chief Communications Officer"
      },
      image: "../examples/headshots/7.jpg"
    };
    const ciso3 = {
      parent: cbo,
      text: {
        name: "Mary Johnson",
        title: "Chief Brand Officer"
      },
      image: "../examples/headshots/4.jpg"
    };
    const ciso4 = {
      parent: cbo,
      text: {
        name: "Kirk Douglas",
        title: "Chief Business Development Officer"
      },
      image: "../examples/headshots/11.jpg"
    };

    const chart_config1 = [
      config1,
      ceo,
      cto,
      cbo,
      cdo,
      cio,
      ciso,
      cio2,
      ciso2,
      ciso3,
      ciso4
    ];
    </script>

    <style>
      @media (max-width: 30em){
            xtal-json-editor {
              display: none;
            }
            .config{
              display: none;
            }
          }
        </style>
    <xtal-deco>
      <script nomodule>
        ({
          config: chart_config1
        })
      </script>
    </xtal-deco>
    <xtal-treant-basic style="width:100%;transform:scale(0.5)" ></xtal-treant-basic>

    <h4 class="config">Configuration for Basic Example</h4>
    <xtal-json-editor watch="[[basicExample2]]" height="300px"></xtal-json-editor>

    <script src="https://unpkg.com/xtal-decorator@0.0.27/xtal-decorator.iife.js"></script>
    <script async src="https://cdn.jsdelivr.net/npm/xtal-json-editor/build/ES6/xtal-json-editor.js"></script>
    <script  src="https://unpkg.com/xtal-treant@0.0.22/xtal-treant.iife.js"></script>
    <link class="treant css" relx="preload" as="fetch" href="https://unpkg.com/xtal-treant@0.0.18/examples/basic-example/basic-example.css" data-postfix="basic">


  </div>
    </template>
</custom-element-demo>
```
-->

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

WIP
