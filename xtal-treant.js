(function () {
    const xtalTreant = 'xtal-treant';
    if (customElements.get(xtalTreant))
        return;
    const cs_src = self['xtal_treant'] ? xtal_treant.href : document.currentScript.src;
    function downloadJSFilesInParallelButLoadInSequence(refs) {
        //see https://www.html5rocks.com/en/tutorials/speed/script-loading/
        return new Promise((resolve, reject) => {
            const notLoadedYet = {};
            const nonNullRefs = refs.filter(ref => ref !== null);
            nonNullRefs.forEach(ref => {
                notLoadedYet[ref.src] = true;
            });
            nonNullRefs.forEach(ref => {
                const script = document.createElement('script');
                script.src = ref.src;
                script.async = false;
                script.onload = () => {
                    //delete notLoadedYet[script.src];
                    Object.keys(notLoadedYet).forEach(key => {
                        if (script.src.endsWith(key)) {
                            delete notLoadedYet[key];
                            return;
                        }
                    });
                    if (Object.keys(notLoadedYet).length === 0) {
                        resolve();
                    }
                };
                document.head.appendChild(script);
            });
        });
    }
    // <!-- <script src="../vendor/raphael.js"></script>
    // <script src="../Treant.js"></script>
    const base = cs_src.split('/').slice(0, -1).join('/');
    const refs = [];
    const raphaelPath = self['_raphael'] ? _raphael.href : base + '/vendor/raphael.js';
    refs.push({ src: raphaelPath });
    const treantPath = self['_treant'] ? _treant.href : base + '/Treant.js';
    refs.push({ src: treantPath });
    downloadJSFilesInParallelButLoadInSequence(refs).then(() => {
        //initBillboardCharts();
    });
    const template = document.createElement('template');
    // <link rel="stylesheet" on-load="loaded" type="text/css" href$="[[cssPath]]">
    template.innerHTML = `
    <style>
         :host {
            display: block;
        }
    </style>
    <div id="chartTarget" style="visibility:hidden"></div>`;
    class XtalTreant extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            // BillboardCharts.observedAttributes.forEach(attrib => {
            //     this._upgradeProperty(this.snakeToCamel(attrib));
            // });
            // if (!this.cssPath) {
            //     this.cssPath = base +  '/billboard.min.css';
            // }
            //<link rel="stylesheet" on-load="loaded" type="text/css" href$="[[cssPath]]">
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', "text/css");
            link.setAttribute('href', base + '/Treant.css');
            link.addEventListener('load', e => {
                this.shadowRoot.getElementById('chartTarget').style.visibility = 'visible';
                //if(this._chart) this._chart.resize();
            });
            this.shadowRoot.appendChild(link);
            const link2 = document.createElement('link');
            link2.setAttribute('rel', 'stylesheet');
            link2.setAttribute('type', "text/css");
            link2.setAttribute('href', base + '/examples/basic-example/basic-example.css');
            this.shadowRoot.appendChild(link2);
            var config = {
                container: this.shadowRoot.getElementById('chartTarget'),
                connectors: {
                    type: 'step'
                },
                node: {
                    HTMLclass: 'nodeExample1'
                }
            }, ceo = {
                text: {
                    name: "Mark Hill",
                    title: "Chief executive officer",
                    contact: "Tel: 01 213 123 134",
                },
                image: "../examples/headshots/2.jpg"
            }, cto = {
                parent: ceo,
                text: {
                    name: "Joe Linux",
                    title: "Chief Technology Officer",
                },
                stackChildren: true,
                image: "../examples/headshots/1.jpg"
            }, cbo = {
                parent: ceo,
                stackChildren: true,
                text: {
                    name: "Linda May",
                    title: "Chief Business Officer",
                },
                image: "../examples/headshots/5.jpg"
            }, cdo = {
                parent: ceo,
                text: {
                    name: "John Green",
                    title: "Chief accounting officer",
                    contact: "Tel: 01 213 123 134",
                },
                image: "../examples/headshots/6.jpg"
            }, cio = {
                parent: cto,
                text: {
                    name: "Ron Blomquist",
                    title: "Chief Information Security Officer"
                },
                image: "../examples/headshots/8.jpg"
            }, ciso = {
                parent: cto,
                text: {
                    name: "Michael Rubin",
                    title: "Chief Innovation Officer",
                    contact: { val: "we@aregreat.com", href: "mailto:we@aregreat.com" }
                },
                image: "../examples/headshots/9.jpg"
            }, cio2 = {
                parent: cdo,
                text: {
                    name: "Erica Reel",
                    title: "Chief Customer Officer"
                },
                link: {
                    href: "http://www.google.com"
                },
                image: "../examples/headshots/10.jpg"
            }, ciso2 = {
                parent: cbo,
                text: {
                    name: "Alice Lopez",
                    title: "Chief Communications Officer"
                },
                image: "../examples/headshots/7.jpg"
            }, ciso3 = {
                parent: cbo,
                text: {
                    name: "Mary Johnson",
                    title: "Chief Brand Officer"
                },
                image: "../examples/headshots/4.jpg"
            }, ciso4 = {
                parent: cbo,
                text: {
                    name: "Kirk Douglas",
                    title: "Chief Business Development Officer"
                },
                image: "../examples/headshots/11.jpg"
            };
            const chart_config = [
                config,
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
            new Treant(chart_config);
        }
    }
    customElements.define(xtalTreant, XtalTreant);
})();
//# sourceMappingURL=xtal-treant.js.map