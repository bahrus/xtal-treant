;
import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { qsa } from 'xtal-latx/qsa.js';
import { downloadJSFilesInParallelButLoadInSequence } from 'xtal-latx/downloadJSFilesInParallelButLoadInSequence.js';
import { define } from 'xtal-latx/define.js';
let cs_src = self['xtal_treant'];
if (cs_src) {
    cs_src = cs_src.href;
}
else {
    cs_src = document.currentScript;
    if (cs_src) {
        cs_src = cs_src.src;
    }
    else {
        cs_src = import.meta.url;
    }
}
const base = cs_src.split('/').slice(0, -1).join('/');
const template = document.createElement('template');
let main_css;
fetch(base + '/Treant.css', { credentials: 'same-origin' }).then(resp => {
    resp.text().then(txt => {
        main_css = txt;
        template.innerHTML = `
<style>
     :host {
        display: block;
    }
    ${main_css}
</style>
<slot></slot>
<div id="chartTarget"></div>
`;
        downloadJSFiles();
    });
});
function downloadJSFiles() {
    const refs = [];
    const raphaelPath = self['_raphael'] ? _raphael.href : base + '/vendor/raphael.js';
    refs.push({ src: raphaelPath });
    const treantPath = self['_treant'] ? _treant.href : base + '/Treant.js';
    refs.push({ src: treantPath });
    downloadJSFilesInParallelButLoadInSequence(refs).then(() => {
        initXtalTreant();
    });
}
/**
 * `xtal-treant`
 *  Web component wrapper around the treant.js chart library
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class XtalTreant extends XtallatX(HTMLElement) {
    constructor() {
        super();
        this._slotted = false;
        this.attachShadow({ mode: 'open' });
        this.addTemplate();
        const slot = this.shadowRoot.querySelector('slot');
        slot.addEventListener('slotchange', e => {
            this._slotted = true;
            this.onPropsChange();
        });
    }
    static get is() { return 'xtal-treant'; }
    addTemplate() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
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
        if (cssPaths && cssPaths.length > 0) {
            let cssPathsCopy = cssPaths.slice();
            ;
            rootConfig.cssPaths.forEach((cssPath) => {
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
        this.onPropsChange();
    }
    connectedCallback() {
        this._upgradeProperties(['config']);
        this._mainCssLoaded = true;
        this.onPropsChange();
        this._ro = new ResizeObserver(entries => {
            //this.handleResize(entries)
            setTimeout(() => {
                console.log('element resize');
                this._dontRedraw = true;
                this.onPropsChange();
            }, 1000);
        });
        window.addEventListener('resize', e => {
            console.log('window resize');
            this.onPropsChange();
        });
        this._ro.observe(this, {});
    }
    // handleResize(entries){
    //     // //console.log('zoominprogress = ' + this._zoomInProgress);
    //     // //if(this._zoomInProgress) return;
    //     // for (let entry of entries) {
    //     // }
    // }
    disconnectedCallback() {
        this._ro.disconnect();
        this.onPropsChange();
    }
    ;
    getChartTarget() {
        return this.shadowRoot.getElementById('chartTarget');
        ;
    }
    onPropsChange() {
        if (!this._config || !this._secondaryCssLoaded)
            return;
        if (!this._slotted && this.innerHTML.trim().length > 0)
            return;
        if (this._dontRedraw) {
            this._dontRedraw = false;
            return;
        }
        console.log('redrawing');
        this._treant = new Treant(this.config, null, null, this);
    }
}
function initXtalTreant() {
    define(XtalTreant);
    loadThemedWCs();
}
function loadThemedWCs() {
    loadThemedWCs2(qsa('.treant.css', document));
}
function loadThemedWCs2(links) {
    const link = links.pop();
    const postfix = link.dataset.postfix;
    let localTemplate = document.createElement('template');
    fetch(link.href).then(resp => {
        resp.text().then(txt => {
            localTemplate.innerHTML = `
        <style>
             :host {
                display: block;
            }
            ${main_css}
            ${txt}
        </style>
        <slot></slot>
        <div id="chartTarget"></div>

        `;
            customElements.define(XtalTreant.is + '-' + postfix, class extends XtalTreant {
                addTemplate() {
                    this.shadowRoot.appendChild(localTemplate.content.cloneNode(true));
                }
            });
        });
    });
}
//# sourceMappingURL=xtal-treant.js.map