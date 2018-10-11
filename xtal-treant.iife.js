
    //@ts-check
    (function () {
    function define(custEl) {
    let tagName = custEl.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}
function qsa(css, from) {
    return [].slice.call(from.querySelectorAll(css));
}
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
const disabled = 'disabled';
/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this._evCount = {};
        }
        static get observedAttributes() {
            return [disabled];
        }
        /**
         * Any component that emits events should not do so if it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in should ensure not to call "de" if this property is set to true.
         */
        get disabled() {
            return this._disabled;
        }
        set disabled(val) {
            this.attr(disabled, val, '');
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Turn number into string with even and odd values easy to query via css.
         * @param n
         */
        to$(n) {
            const mod = n % 2;
            return (n - mod) / 2 + '-' + mod;
        }
        /**
         * Increment event count
         * @param name
         */
        incAttr(name) {
            const ec = this._evCount;
            if (name in ec) {
                ec[name]++;
            }
            else {
                ec[name] = 0;
            }
            this.attr('data-' + name, this.to$(ec[name]));
        }
        attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
                case disabled:
                    this._disabled = newVal !== null;
                    break;
            }
        }
        /**
         * Dispatch Custom Event
         * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
         * @param detail Information to be passed with the event
         * @param asIs If true, don't append event name with '-changed'
         */
        de(name, detail, asIs) {
            const eventName = name + (asIs ? '' : '-changed');
            const newEvent = new CustomEvent(eventName, {
                detail: detail,
                bubbles: true,
                composed: false,
            });
            this.dispatchEvent(newEvent);
            this.incAttr(eventName);
            return newEvent;
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        _upgradeProperties(props) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = this[prop];
                    delete this[prop];
                    this[prop] = value;
                }
            });
        }
    };
}
;
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
class XtalTreant extends XtallatX(HTMLElement) {
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
    })();  
        