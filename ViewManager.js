const ViewManager =  {
    parentElement: document.body,
    logicalWidth: 0,
    logicalHeight: 0,
    physicalWidth: 0,
    physicalHeight: 0,
    deadAreaColor: '#000',
    Mode: { FULL_SCREEN: 0, FRAME: 1 },
    viewMode: 0,
    Scale: {
        NONE: 0,
        KEEP_RATIO: 1,
        KEEP_WIDTH: 2,
        KEEP_HEIGHT: 3,
        FILL: 4,
        x: 1,
        y: 1,
        factor: 1
    },
    scaleMode: 0,
    setup: function(parentElement, width, height, viewMode, scaleMode, deadAreaColor, resizeCallback){

        this.parentElement = parentElement;
        this.logicalWidth = width;
        this.logicalHeight = height;
        this.viewMode = viewMode;
        this.scaleMode = scaleMode;
        this.deadAreaColor = deadAreaColor;
        this.resizeCallback = resizeCallback;

        this.createHTMLStructure();

        if (this.scaleMode === this.Scale.NONE) return;

        this.displaySizeMap = new Map([[this.container, [this.container.clientWidth, this.container.clientHeight]]]);
        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(this.container, { box: 'content-box' } );
    },
    createHTMLStructure: function(){
        const css = `
        #quick-game-container{
            width: 100%;
            height: 100%;
            position: relative;
        }

        #quick-game-box{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
        }

        #quick-game-canvas{
            display: block;
            width: 100%;
            height: 100%;
        }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        
        this.container = document.createElement('div');
        this.container.setAttribute('id', 'quick-game-container');
        this.container.style.backgroundColor = this.deadAreaColor;
        
        this.canvasBox = document.createElement('div');
        this.canvasBox.setAttribute('id', 'quick-game-box');
        this.canvasBox.style.width = this.logicalWidth + 'px';
        this.canvasBox.style.height = this.logicalHeight + 'px';

        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', 'quick-game-canvas');

        if (this.viewMode === this.Mode.FULL_SCREEN)
        {
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
            document.body.style.margin = '0px';
        }

        this.canvasBox.appendChild(this.canvas);
        this.container.appendChild(this.canvasBox);
        this.parentElement.appendChild(this.container);
    },
    onResize: function(entries){
        for (const entry of entries)
        {
            let width;
            let height;
            let dpr = window.devicePixelRatio;

            if (entry.devicePixelContentBoxSize)
            {
                // NOTE: Only this path gives the correct answer
                // The other 2 paths are an imperfect fallback
                // for browsers that don't provide anyway to do this
                width = entry.devicePixelContentBoxSize[0].inlineSize;
                height = entry.devicePixelContentBoxSize[0].blockSize;
                dpr = 1; // it's already in width and height
            }
            else if(entry.contentBoxSize)
            {
                if (entry.contentBoxSize[0])
                {
                    width = entry.contentBoxSize[0].inlineSize;
                    height = entry.contentBoxSize[0].blockSize;
                }
                else
                {
                    // legacy
                    width = entry.contentBoxSize.inlineSize;
                    height = entry.contentBoxSize.blockSize;
                }
            }
            else
            {
                // legacy
                width = entry.contentRect.width;
                height = entry.contentRect.height;
            }

            const displayWidth = Math.round(width * dpr);
            const displayHeight = Math.round(height * dpr);
            this.displaySizeMap.set(entry.target, [displayWidth, displayHeight]);
            this.applyResize();
        }
        this.resizeCallback();
    },
    applyResize: function(){
        const [displayWidth, displayHeight] = this.displaySizeMap.get(this.container);

        this.Scale.x = displayWidth / this.logicalWidth;
        this.Scale.y = displayHeight / this.logicalHeight; 

        const factor = Math.min(this.Scale.x, this.Scale.y);
        this.Scale.factor = factor;

        switch (this.scaleMode) {
            case this.Scale.KEEP_RATIO:
                this.physicalWidth = this.logicalWidth * factor;
                this.physicalHeight = this.logicalHeight * factor;
                break;
            case this.Scale.KEEP_WIDTH:
                this.physicalWidth = this.logicalWidth * factor;
                this.physicalHeight = displayHeight;
                break;
            case this.Scale.KEEP_HEIGHT:
                this.physicalWidth = displayWidth;
                this.physicalHeight = this.logicalHeight * factor;
                break;
            case this.Scale.FILL:
                this.physicalWidth = displayWidth;
                this.physicalHeight = displayHeight;
            default:
                break;
        }

        this.physicalWidth = Math.round(this.physicalWidth);
        this.physicalHeight = Math.round(this.physicalHeight);

        this.canvasBox.style.width = this.physicalWidth + 'px';
        this.canvasBox.style.height = this.physicalHeight + 'px';

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        

        //const output = `SCALED \n x: ${this.Scale.x} y: ${this.Scale.y} pw: ${this.physicalWidth} ph: ${this.physicalHeight} dw: ${displayWidth} dh: ${displayHeight}`;
        //console.log(output);
    }
}

export default ViewManager;