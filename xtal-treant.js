;
(function () {
    const xtalTreant = 'xtal-treant';
    if (customElements.get(xtalTreant))
        return;
    const cs_src = self['xtal_treant'] ? xtal_treant.href : document.currentScript.src;
    const base = cs_src.split('/').slice(0, -1).join('/');
    const template = document.createElement('template');
    let main_css;
    fetch(base + '/Treant.css', { credentials: 'include' }).then(resp => {
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
    class XtalTreant extends HTMLElement {
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
            this.onPropsChange();
        }
        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }
        connectedCallback() {
            this._upgradeProperty('config');
            this._mainCssLoaded = true;
            this.onPropsChange();
        }
        getChartTarget() {
            return this.shadowRoot.getElementById('chartTarget');
            ;
        }
        onPropsChange() {
            if (!this._config || !this._secondaryCssLoaded)
                return;
            if (!this._slotted && this.innerHTML.trim().length > 0)
                return;
            this._treant = new Treant(this.config, null, null, this);
        }
    }
    function initXtalTreant() {
        customElements.define(xtalTreant, XtalTreant);
        if (document.readyState !== "loading") {
            loadThemedWCs();
        }
        else {
            document.addEventListener("DOMContentLoaded", e => {
                loadThemedWCs();
            });
        }
    }
    function loadThemedWCs() {
        const links = [].slice.call(document.head.querySelectorAll('.treant.css'));
        loadThemedWCs2(links);
    }
    function loadThemedWCs2(links) {
        const link = links.pop();
        const postfix = link.dataset.postfix;
        let localTemplate = document.createElement('template');
        fetch(link.href, { credentials: 'include' }).then(resp => {
            resp.text().then(txt => {
                //const template = document.createElement('template');
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
            });
        });
        customElements.define(xtalTreant + '-' + postfix, class extends XtalTreant {
            addTemplate() {
                this.shadowRoot.appendChild(localTemplate.content.cloneNode(true));
            }
        });
    }
})();
//# sourceMappingURL=xtal-treant.js.map