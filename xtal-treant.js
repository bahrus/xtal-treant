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
    class XtalTreant {
    }
    customElements.define('xtal-treant', XtalTreant);
})();
//# sourceMappingURL=xtal-treant.js.map