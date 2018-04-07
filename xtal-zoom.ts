(function () {
interface IScale{
    X: number,
    Y: number,
}
class XtalZoom extends HTMLElement{
    static get is(){return 'xtal-zoom';}
    _scale: IScale;
    get scale(){
        return this._scale;
    }
    set scale(val){
        this._scale = val;
        const style = this.getResizingTarget().style;
        style.transform = `scale(${val.X}, ${val.Y}`;
        style.transformOrigin = '0% 0%';
        this.de('scale', val);
        this.setAttribute('scale', `scale(${val.X}, ${val.Y}`);
    }
    _scaleY; number;

    
    // handleResize(entries){
    //     const contentRect = entries[0].contentRect;

    // }
    getResizingTarget(){
        return this.firstElementChild as HTMLElement;
    }
    de(name: string, value: any) {
        const newEvent = new CustomEvent(name + '-changed', {
            detail: {
                value: value
            },
            bubbles: true,
            composed: false,
        } as CustomEventInit);
        this.dispatchEvent(newEvent);
        return newEvent;
    }

    _ro: ResizeObserver;
    connectedCallback(){
        this._ro = new ResizeObserver(entries => {
            this.handleResize(entries)
        });
        this._ro.observe(this, null);
    }
    handleResize(entries){
            //console.log('zoominprogress = ' + this._zoomInProgress);
            //if(this._zoomInProgress) return;
            for (let entry of entries) {
                // entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';

                const target = this.getResizingTarget();
                if (!target) {
                    setTimeout(() =>{
                        this.handleResize(entries)
                    }, 100);
                    return;
                }
                const contentRect = entry['contentRect'];
                console.log(contentRect.width);
                this.scale = {
                    X: contentRect.width / target.clientWidth,
                    Y: contentRect.height / target.clientHeight,
                }

            }
    }
    disconnectedCallback(){
        this._ro.disconnect();
    }
}
if(customElements.get(XtalZoom.is)) return;
customElements.define(XtalZoom.is, XtalZoom);
})();