/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20231203
  Author	: 	IVT : İhsan V. Töre
  About		: 	TRenderer.js: Tore Js control rendering subsystem.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, log, core, TComponent, TJobQueue, TFuncJobQueue }  from "../lib/index.js";
import { TControl } from "./TControl.js";
 

/*————————————————————————————————————————————————————————————————————————————
  CLASS:    TRenderer
  TASKS:    This singleton manages rendering of controls.
            Tightly coupled with controls and display.            
————————————————————————————————————————————————————————————————————————————*/
class TRenderer extends TComponent {

    static allowMemberClass = TJobQueue;
    static serializable = false;

    _logEna = true;
    _renBlk = false;
    _renFrm = false;
    
    /*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs renderer singleton.
	——————————————————————————————————————————————————————————————————————————*/
	constructor() {
		if (core["renderer"])
			exc("E_SINGLETON", "core.renderer");
		super('renderer', core);
        new TRenderQueue('renderQueue', this);
        new TPostRenderQueue('postRenderQueue', this);    
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: requestFrame.
	  TASK: Requests an animation frame if not requested.
	——————————————————————————————————————————————————————————————————————————*/
	requestFrame() {
        var t = this;
        
		if (t._renFrm || t._renBlk || (t.renderQueue.empty && t.postRenderQueue.empty)) 
            return;
		t._renFrm = true;
		window.requestAnimationFrame(t.validate);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: avoidRender.
	  TASK: Avoids all renderings.
	——————————————————————————————————————————————————————————————————————————*/
    avoidRender() {
        this._renBlk = true;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: allowRender.
	  TASK: Allows all renderings.
	——————————————————————————————————————————————————————————————————————————*/
    allowRender() {
        this._renBlk = false;
        this.requestFrame();
    }
    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: validate
	  TASK: Renders invalidated controls in queue.
	——————————————————————————————————————————————————————————————————————————*/
    validate(timeStamp) {
        var t = core.renderer,
            rq = t.renderQueue,
            pq = t.postRenderQueue,
            rl = rq.length,
            pl = pq.length,
            ic,
            lg;
            
        if (t._logEna) {
            lg = 'Render: ';
            ic = 0;
        }
        while(rl > 0 || pl > 0) {
            if (rl > 0)
                t.renderQueue.execute();
            if (pl > 0)
                t.postRenderQueue.execute();
            if (t._logEna) {
                lg += '[r: ' + rl + ((pl > 0) ? ' p: '+ pl : '') +'] ';
                ic++;
            }
            rl = rq.length;
            pl = pq.length;            
        }  
        if (t._logEna)
            log(lg, 'i:', ic, 't:', Math.ceil(1000*(performance.now()-timeStamp)), 'µs');  
        t._renFrm = false;
        t.requestFrame();
    }
    
}

/*————————————————————————————————————————————————————————————————————————————
  CLASS:    TPostRenderQueue
  TASKS:    A Singleton Queue for post rendering (Class not exported).
            This runs inside renderer right after renderQueue.
            Renderer owns and executes this.
————————————————————————————————————————————————————————————————————————————*/
class TPostRenderQueue extends TFuncJobQueue {
    start() {
        this._own.requestFrame();
    }

    stop() {
        // renderer handles this.
    }
}


/*————————————————————————————————————————————————————————————————————————————
  CLASS:    TRenderQueue
  TASKS:    A Singleton Queue for rendering (Class not exported).
            When controls invalidate, they are added to render queue.
            Renderer owns and executes this.
            This renders then recalculates the controls.
————————————————————————————————————————————————————————————————————————————*/
class TRenderQueue extends TJobQueue {
      
     
    add(control = null) {
        if (!(control instanceof TControl) || this._jobLst.indexOf(control) > -1)
            return; 
        this._jobLst.push(control);
        this._own.requestFrame();
    }

    // Renderer handles cycling, logging so this is tight.
    execute() {
        var t = this,   // queue.
            l,          // list of controls.
            c;          // control.
        
        if (t._jobLst.length === 0)
            return;
        l = t._jobLst;
        t._jobLst = [];
        for(c of l)
            c.render();
        for(c of l)
            c.recalculate();        
    }
}


sys.registerClass(TRenderer);
sys.registerClass(TRenderQueue);
sys.registerClass(TPostRenderQueue);

const renderer = new TRenderer();
const renderQueue = renderer.renderQueue;
const postRenderQueue = renderer.postRenderQueue;



export { renderer, renderQueue, postRenderQueue };