;
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
    <slot></slot>
    <div id="resizingElement" style="width:100%;height:100%;visibility:hidden">
        <div id="chartTarget"></div>
    </div>
    `;
    class XtalTreant extends HTMLElement {
        constructor() {
            super();
            this._slotted = false;
            this._treeLoaded = false;
            this._zoom = 0;
            this._zoomSequence = [];
            //previousZoom = 1;
            this._configuredAutoZoom = false;
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            const slot = this.shadowRoot.querySelector('slot');
            slot.addEventListener('slotchange', e => {
                this._slotted = true;
                this.onPropsChange();
                console.log('light dom children changed!');
            });
        }
        get config() {
            return this._config;
        }
        set config(val) {
            this._config = val;
            let rootConfig;
            if (Array.isArray(val)) {
                rootConfig = val[0];
            }
            else {
                rootConfig = val.chart;
            }
            const cssPaths = rootConfig.cssPaths;
            if (cssPaths) {
                let cssPathsCopy = cssPaths.slice();
                ;
                rootConfig.cssPaths.forEach(cssPath => {
                    const link = document.createElement('link');
                    link.setAttribute('rel', 'stylesheet');
                    link.setAttribute('type', "text/css");
                    link.setAttribute('href', cssPath);
                    link.addEventListener('load', e => {
                        cssPathsCopy = cssPathsCopy.filter(path => path !== cssPath);
                        if (cssPathsCopy.length === 0)
                            this._secondaryCssLoaded = true;
                        setTimeout(() => {
                            this.onPropsChange();
                        }, 100);
                    });
                    this.shadowRoot.appendChild(link);
                });
            }
            else {
                this._secondaryCssLoaded = true;
            }
            rootConfig.container = this.getChartTarget();
            rootConfig.callback = {
                onTreeLoaded: () => {
                    this._treeLoaded = true;
                    if (this.autoZoom)
                        this.configureAutoZoom();
                }
            };
            this.onPropsChange();
        }
        get zoom() {
            return this._zoom;
        }
        set zoom(val) {
            this.setAttribute('zoom', val.toString());
        }
        get autoZoom() {
            return this._autoZoom;
        }
        set autoZoom(val) {
            if (val) {
                this.setAttribute('auto-zoom', '');
            }
            else {
                this.removeAttribute('auto-zoom');
            }
        }
        static get observedAttributes() {
            return [
                /** @type {number}
                 * Specify a zoom manification / miniaturizaion factor
                 */
                'zoom',
                /** @type {boolean}
                 * Indicatethat the chart should fill the container
                */
                'auto-zoom'
            ];
        }
        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'zoom':
                    this._zoom = parseFloat(newValue);
                    this.onPropsChange();
                    break;
                case 'auto-zoom':
                    this._autoZoom = newValue !== null;
                    if (this._autoZoom) {
                        this.configureAutoZoom();
                    }
                    else {
                        this.discontinueAutoZoom();
                    }
            }
        }
        configureAutoZoom() {
            if (!this._treeLoaded || this._configuredAutoZoom)
                return;
            this._configuredAutoZoom = true;
            this.ro = new ResizeObserver(entries => {
                //console.log('zoominprogress = ' + this._zoomInProgress);
                //if(this._zoomInProgress) return;
                for (let entry of entries) {
                    // entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';
                    const svg = entry.target.querySelector('svg');
                    if (!svg)
                        return;
                    setTimeout(() => {
                        const width = svg['width'].baseVal.value;
                        //document.write('svg_width = ' + width);
                        //document.write('contentRect_width = ' + entry['contentRect'].width);
                        //this.shadowRoot.querySelector('#temp')['innerText'] = svg.getAttribute('width');  
                        this.zoom = entry['contentRect'].width / (width);
                        //this.previousZoom = this.zoom;
                    }, 100);
                }
            });
            this.ro.observe(this.getResizingTarget(), null);
        }
        discontinueAutoZoom() {
            this.ro.disconnect();
        }
        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }
        connectedCallback() {
            this._upgradeProperty('autoZoom');
            this._upgradeProperty('config');
            this._upgradeProperty('zoom');
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', "text/css");
            link.setAttribute('href', base + '/Treant.css');
            link.addEventListener('load', e => {
                this._mainCssLoaded = true;
                this.onPropsChange();
            });
            this.shadowRoot.appendChild(link);
        }
        disconnectedCallback() {
            this.discontinueAutoZoom();
        }
        getChartTarget() {
            return this.shadowRoot.getElementById('chartTarget');
            ;
        }
        getResizingTarget() {
            return this.shadowRoot.getElementById('resizingElement');
        }
        onPropsChange() {
            if (!this._config || !this._mainCssLoaded || !this._secondaryCssLoaded)
                return;
            // console.log({
            //     innerHTML: this.innerHTML
            // })
            if (!this._slotted && this.innerHTML.trim().length > 0)
                return;
            //console.log('proceeding');
            if (this._treant && this._zoom > 0) {
                this.setZoom(this._zoom);
                return;
            }
            setTimeout(() => {
                this._treant = new Treant(this.config, null, null, this);
                if (this._zoom > 0) {
                    this.setZoom(this._zoom);
                }
                else {
                    this.displayResizableElement();
                }
            }, 1000);
        }
        displayResizableElement() {
            this.getResizingTarget().style.visibility = 'visible';
        }
        //_zoomInProgress = false;
        setZoom(zoom) {
            //https://jsfiddle.net/ex1f181o/
            //this._zoomInProgress = true;
            const transformOrigin = [0, 0];
            //el = el || instance.getContainer();
            const el = this.getChartTarget(); //.querySelector('svg');
            if (!el)
                return;
            //for (var i = 0, ii = div.childElementCount; i < ii; i++) {
            //const el = div.childNodes[i] as HTMLElement;
            var p = ["webkit", "moz", "ms", "o"], s = "scale(" + zoom + ")", oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";
            for (var i = 0; i < p.length; i++) {
                el.style[p[i] + "Transform"] = s;
                el.style[p[i] + "TransformOrigin"] = oString;
            }
            el.style.transform = s;
            el.style.transformOrigin = oString;
            el.style.width = (100 / zoom) + '%';
            this.displayResizableElement();
        }
    }
    customElements.define(xtalTreant, XtalTreant);
})();
//# sourceMappingURL=xtal-treant.js.map