declare var xtal_treant;
declare class ResizeObserver extends MutationObserver { };
declare var _raphael, _treant: HTMLLinkElement;
declare var Treant;
(function () {
    interface IDynamicJSLoadStep {
        src?: string;
    }
    const xtalTreant = 'xtal-treant';
    if (customElements.get(xtalTreant)) return;
    const cs_src = self['xtal_treant'] ? xtal_treant.href : (document.currentScript as HTMLScriptElement).src
    function downloadJSFilesInParallelButLoadInSequence(refs: IDynamicJSLoadStep[]) {
        //see https://www.html5rocks.com/en/tutorials/speed/script-loading/
        return new Promise((resolve, reject) => {
            const notLoadedYet: { [key: string]: boolean } = {};
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
                    })
                    if (Object.keys(notLoadedYet).length === 0) {
                        resolve();
                    }
                }
                document.head.appendChild(script);
            });
        })

    }

    // <!-- <script src="../vendor/raphael.js"></script>
    // <script src="../Treant.js"></script>
    const base = cs_src.split('/').slice(0, -1).join('/');
    const refs = [] as IDynamicJSLoadStep[];

    const raphaelPath = self['_raphael'] ? _raphael.href : base + '/vendor/raphael.js';
    refs.push({ src: raphaelPath });
    const treantPath = self['_treant'] ? _treant.href : base + '/Treant.js';
    refs.push({ src: treantPath });
    downloadJSFilesInParallelButLoadInSequence(refs).then(() => {
        //initBillboardCharts();
    })

    const template = document.createElement('template');
    // <link rel="stylesheet" on-load="loaded" type="text/css" href$="[[cssPath]]">
    template.innerHTML = `
    <style>
         :host {
            display: block;
        }
        
    </style>
    <slot></slot>
    <div id="resizingElement" style="width:100%;height:100%">
        <div id="chartTarget" style="width:100%;height:100%"></div>
    </div>
    <span style="font-size:5pt" id="temp"></span>
    `;
    class XtalTreant extends HTMLElement {
        _slotted = false;
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            const slot = this.shadowRoot.querySelector('slot');
            slot.addEventListener('slotchange', e => {
                this._slotted = true;
                this.onPropsChange();
                console.log('light dom children changed!');
            });
        }
        _config;
        get config() {
            return this._config;
        }
        set config(val) {
            this._config = val;
            let rootConfig;
            if (Array.isArray(val)) {
                rootConfig = val[0];

            } else {
                rootConfig = val.chart;
            }
            const cssPaths = rootConfig.cssPaths;
            if (cssPaths) {
                let cssPathsCopy = cssPaths.slice() as string[];;
                rootConfig.cssPaths.forEach(cssPath => {
                    const link = document.createElement('link');
                    link.setAttribute('rel', 'stylesheet');
                    link.setAttribute('type', "text/css");
                    link.setAttribute('href', cssPath);
                    link.addEventListener('load', e => {
                        cssPathsCopy = cssPathsCopy.filter(path => path !== cssPath);
                        if (cssPathsCopy.length === 0) this._secondaryCssLoaded = true;
                        this.onPropsChange();
                    });
                    this.shadowRoot.appendChild(link);

                })

            } else {
                this._secondaryCssLoaded = true;
            }
            rootConfig.container = this.getChartTarget()
            this.onPropsChange();
        }

        _zoom: number = 0;
        get zoom() {
            return this._zoom;
        }
        set zoom(val) {
            this.setAttribute('zoom', val.toString());
        }

        _autoZoom: boolean;
        get autoZoom() {
            return this._autoZoom;
        }
        set autoZoom(val) {
            if (val) {
                this.setAttribute('auto-zoom', '');
            } else {
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
            ]
        }
        _zoomSequence = [];
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
                    } else {
                        this.discontinueAutoZoom();
                    }
            }
        }
        ro: ResizeObserver;
        configureAutoZoom() {
            this.ro = new ResizeObserver(entries => {
                //console.log('zoominprogress = ' + this._zoomInProgress);
                //if(this._zoomInProgress) return;
                for (let entry of entries) {
                    // entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';

                    const svg = (entry.target as HTMLDivElement).querySelector('svg') as SVGElement;
                    if (!svg) return;
                    setTimeout(() =>{
                        
                        const width = svg['width'].baseVal.value;
                        //document.write('svg_width = ' + width);
                        //document.write('contentRect_width = ' + entry['contentRect'].width);
                        this.shadowRoot.querySelector('#temp')['innerText'] = entry['contentRect'].width + '/' + width + ',' + svg['currentScale'] + ',' + svg['width'].baseVal.unitType + ',' + svg['width'].baseVal.valueInSpecifiedUnits;  
                        this.zoom = entry['contentRect'].width / width;
                    }, 100);
    
                }
            });
            this.ro.observe(this.getResizingTarget(), null);
        }
        discontinueAutoZoom() {
            this.ro.disconnect();
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
                this._mainCssLoaded = true;
                this.onPropsChange();
                //this.shadowRoot.getElementById('chartTarget').style.visibility = 'visible';
                //if(this._chart) this._chart.resize();
            });
            this.shadowRoot.appendChild(link);





        }
        disconnectedCallback() {
            this.discontinueAutoZoom();
        }
        _mainCssLoaded;
        _customCssLoaded;

        getChartTarget() {
            return this.shadowRoot.getElementById('chartTarget') as HTMLDivElement;;
        }
        getResizingTarget() {
            return this.shadowRoot.getElementById('resizingElement') as HTMLDivElement;
        }
        _secondaryCssLoaded;
        _treant;
        onPropsChange() {
            if (!this._config || !this._mainCssLoaded || !this._secondaryCssLoaded) return;
            // console.log({
            //     innerHTML: this.innerHTML
            // })
            if (!this._slotted && this.innerHTML.trim().length > 0) return;
            //console.log('proceeding');
            if (this._treant && this._zoom > 0) {
                this.setZoom(this._zoom);
                return;
            }
            setTimeout(() => {
                this._treant = new Treant(this.config, null, null, this);
                if (this._zoom > 0) this.setZoom(this._zoom);
            }, 0);

        }
        //_zoomInProgress = false;
        setZoom(zoom) {
            //https://jsfiddle.net/ex1f181o/
            //this._zoomInProgress = true;
            const transformOrigin = [0, 0];
            //el = el || instance.getContainer();
            const el = this.getChartTarget();//.querySelector('svg');
            if (!el) return;
            //for (var i = 0, ii = div.childElementCount; i < ii; i++) {
            //const el = div.childNodes[i] as HTMLElement;
            var p = ["webkit", "moz", "ms", "o"],
                s = "scale(" + zoom + ")",
                oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

            for (var i = 0; i < p.length; i++) {
                el.style[p[i] + "Transform"] = s;
                el.style[p[i] + "TransformOrigin"] = oString;
            }

            el.style.transform = s;
            el.style.transformOrigin = oString;

            el.style.width = (100 / zoom) + '%';
            // setTimeout( () =>{
            //     this._zoomInProgress = false;
            // }, 1000)

            //}

        }
    }
    customElements.define(xtalTreant, XtalTreant);
})();