declare class ResizeObserver extends MutationObserver { };
declare var _raphael: HTMLLinkElement;
declare var _treant: HTMLLinkElement;
declare var self: any;
declare var Treant: any;

import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { qsa } from 'xtal-latx/qsa.js'
import { downloadJSFilesInParallelButLoadInSequence, IDynamicJSLoadStep } from 'xtal-latx/downloadJSFilesInParallelButLoadInSequence.js';
import { define } from 'xtal-latx/define.js';

let cs_src = self['xtal_treant'];
if (cs_src) {
    cs_src = cs_src.href;
} else {
    cs_src = document.currentScript as HTMLScriptElement;
    if (cs_src) {
        cs_src = cs_src.src;
    } else {
        cs_src = (<any>import.meta).url;
    }
}

const base = cs_src.split('/').slice(0, -1).join('/');
const template = document.createElement('template');
let main_css!: string;
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
    })
})
function downloadJSFiles() {
    const refs = [] as IDynamicJSLoadStep[];

    const raphaelPath = self['_raphael'] ? _raphael.href : base + '/vendor/raphael.js';
    refs.push({ src: raphaelPath });
    const treantPath = self['_treant'] ? _treant.href : base + '/Treant.js';
    refs.push({ src: treantPath });
    downloadJSFilesInParallelButLoadInSequence(refs).then(() => {
        initXtalTreant();
    })
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
    static get is() { return 'xtal-treant'; }

    _slotted = false;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addTemplate();
        const slot = this.shadowRoot!.querySelector('slot');
        slot!.addEventListener('slotchange', e => {
            this._slotted = true;
            this.onPropsChange();
        });
    }

    addTemplate() {
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }

    _config!: any;
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
        const cssPaths = rootConfig.cssPaths as string[];
        if (cssPaths && cssPaths.length > 0) {
            let cssPathsCopy = cssPaths.slice() as string[];;
            rootConfig.cssPaths.forEach((cssPath: string) => {
                const link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', "text/css");
                link.setAttribute('href', cssPath);
                link.addEventListener('load', e => {
                    cssPathsCopy = cssPathsCopy.filter(path => path !== cssPath);
                    if (cssPathsCopy.length === 0) this._secondaryCssLoaded = true;
                    setTimeout(() => {
                        this.onPropsChange();
                    }, 100)

                });
                this.shadowRoot!.appendChild(link);

            })

        } else {
            this._secondaryCssLoaded = true;
        }
        rootConfig.container = this.getChartTarget();
        this.onPropsChange();
    }


    _ro!: ResizeObserver;
    _dontRedraw!: boolean;
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
            }, 1000)

        });
        window.addEventListener('resize', e => {
            console.log('window resize');
            this.onPropsChange()
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

    _mainCssLoaded!: boolean;;
    _customCssLoaded!: boolean;

    getChartTarget() {
        return this.shadowRoot!.getElementById('chartTarget') as HTMLDivElement;;
    }

    _secondaryCssLoaded!: boolean;
    _treant!: any;
    onPropsChange() {
        if (!this._config || !this._secondaryCssLoaded) return;
        if (!this._slotted && this.innerHTML.trim().length > 0) return;
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
    loadThemedWCs2(qsa('.treant.css', document) as HTMLLinkElement[]);
}

function loadThemedWCs2(links: HTMLLinkElement[]) {
    const link = links.pop();
    const postfix = link!.dataset.postfix;
    let localTemplate = document.createElement('template');
    fetch(link!.href, { credentials: 'include' }).then(resp => {
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
                    this.shadowRoot!.appendChild(localTemplate.content.cloneNode(true));
                }
            })
        })
    })


}
