declare var xtal_treant;
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
    refs.push({ src: raphaelPath});
    const treantPath = self['_treant'] ? _treant.href : base + '/Treant.js';
    refs.push({src: treantPath});
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
    <div id="chartTarget" style="visibility:hidden"></div>`;
    class XtalTreant extends HTMLElement{
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

            
            
        
            
        }

        _config;
        get config(){
            return this._config;
        }
        set config(val){
            this._config = val;
            const config0 = val[0];
            if(config0.cssPath){
                const link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', "text/css");
                link.setAttribute('href', config0.cssPath);
                this.shadowRoot.appendChild(link);
            }
            config0.container = this.shadowRoot.getElementById('chartTarget');
            this.onPropsChange();
        }

        onPropsChange(){
            if(!this._config) return;
            new Treant( this.config);
        }
    }
    customElements.define(xtalTreant, XtalTreant);
})();