/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TDisplay.js: Tore Js display control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { TObject, TComponent, sys, is, exc, core } from "../lib/index.js";
import { TCtl, TControl, TContainer, TPanel, styler } from "../ctl/index.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TDisplay
  TASKS:
	This class generates a singleton control display or core.display. 
	It represents the display area of the browser, borrowing 
	properties from window and body.
	The display control manages:
	1) Browser tab behaviour.
	2) Focusing of all controls.
	3) Mouse (and TODO: Touch) events.
————————————————————————————————————————————————————————————————————————————*/

class TDisplay extends TPanel {

	// TDisplay does not make an element but binds to body.
	static elementTag = 'body';

	// TDisplay special events and handler names.
	static displayEvents = {
		touchstart: 'handleTouchStart',
		touchmove:	'handleTouchMove',
		touchend:	'handleTouchEnd',
		mousedown:	'handleMouseDown',
		mousemove:	'handleMouseMove',		
		mouseup:	'handleMouseUp',
		resize: 	'doViewportResize',
		keydown:  	'handleKeyDown',
		keyup:		'handleKeyUp'
	}

	static cdta = {
		tabsLoop		: {value: true},
		currentControl	: {value: null},
	};

	_curCtl = null;		// current control
	_curCon = null;		// current container
	_events = null;		// events specific to display.
	_ptrOrg = null;		// pointer origin control
	_ptrChk = false;	// pointer checking.
	_tptCtl = null;		// touch pointer current control
	_mptCtl = null;		// mouse pointer current control
	_dblCan = null;		// double hit candidate
	_dblTim = null;		// double hit timer
	_drgDta = null;		// drag data
	_zmrDta = null;		// zoom-rotate data
	_renLst = null;		// render list
	_rcaLst = null;		// calculate list.
	_rcaFrm = false;	// recalculating frame requested.
	_renFrm = false;	// render frame requested.
	_framed = false;	// true if there is an active frame requested.
    _vpsnam = 'md';		// Viewport size name.
	
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs display singleton.
	——————————————————————————————————————————————————————————————————————————*/
	constructor() {
		var l,
			e;

		if (core["display"])
			exc("E_SINGLETON", "core.display");
		super('display', null, null, false);
		this._sta = sys.LIVE;
		this.name = 'display';
		this.tabsLoop = true;
		this._curCon = this;				// display is current container 
		this._events = {};					// display events list
		this._renLst = [];					// render list.
		this._rcaLst = [];					// recalculate list.
		l = this.class.displayEvents;
		for(e in l){						// link and add event listeners
			this._events[e] = sys.bindHandler(this, l[e]);
			window.addEventListener(e, this._events[e], true);
		}		
		this._initControl('display', core);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys display singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		var t = this,
			e,
			l;
	
		if (t._sta == sys.DEAD)
			return;
		l = t.class.displayEvents;
		for(e in l){
			window.removeEventListener(e, t._events[e], true);
			delete t._events[e];
		}
		t._events = null;	
		t._renLst = null;
		t._rcaLst = null;
		super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: requestFrame.
	  TASK: Requests an animation frame if not requested.
	——————————————————————————————————————————————————————————————————————————*/
	requestFrame(){
		if (this._framed)
			return;
		this._framed = true;
		window.requestAnimationFrame(this.validate);
	}
    
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: addRenderQueue
	  TASK: Adds invalidated control to queue.
	  ARGS: control : TControl : TControl to add to queue.
	——————————————————————————————————————————————————————————————————————————*/
	addRenderQueue(control = null){
		var t = this;

		if (!(control instanceof TControl) || t._renLst.indexOf(control) > -1)
			return;
		t._renLst.push(control);
		if (t._renFrm)
			return;
		t._renFrm = true;
		t.requestFrame();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: validate
	  TASK: Renders invalidated controls in queue.
	——————————————————————————————————————————————————————————————————————————*/
	validate(timeStamp) {
		var t = core.display,
			r,
			l,
			i;

		t._framed = false;
		if (t._renFrm) {
			t._renFrm = false;
			r = t._renLst;
			t._renLst = [];
			l = r.length;
			console.log("render:", l) //, r);
			for(i = 0; i < l; i++)
				r[i].render();
			t._rcaLst = r;
			t._rcaFrm = true;
			t.requestFrame();
			return;
		}
		r = t._rcaLst;
		t._rcaLst = [];
		t._rcaFrm = false;
		l = r.length;
		for(i = 0; i < l; i++)
			r[i].recalculate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize [override]
	  TASK: Flags the display that window is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
        var n; 

		this.width = 1;
		this.height = 1;
        n = calculateViewportName();
		if (n !== this._vpsnam) {
			this._vpsnam = n;
		    styler.applyDynamicRules();
        }
		return super.doViewportResize();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: relocate [override].
	  TASK: Notifies member controls that display is resized.
	  INFO: Redundant in TDisplay.
	—————————————————————————————————————————————————————————————————————————*/
	relocate() { }

	/*————————————————————————————————————————————————————————————————————————————
		Application Focus TControl.
		This subsystem works in coherence with focusing and tabbing
		mechanisms of containers and controls.
		Hit means any pointer hit, regardless of mouse or touch.
	————————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hitChk
	  TASK:	
		Double hit checking function. Issues hit and sets timer for
		double hit capture.
	  ARGS:
		n	: TControl 	: (newly) hit target control.
		x	: number	: TControl relative click x coordinate 
		y	: number	: TControl relative click y coordinate
		e	: UIEvent	: Original javascript event coming from DOM.
	——————————————————————————————————————————————————————————————————————————*/
	hitChk(n, x, y, e) {
		var t = display,
			o = t._dblCan;			// Get old double hit candidate control.

		t.dblHitReset();			// Clear doublehit timer and candidate.
		n.doHit(x, y, e);			// Send a hit event to target control.
		if(n === o) {				// If new target and old candidate matches,
			n.doDoubleHit(x, y, e);	// send a double hit event to target control.
			return;					// done here.
		}
		t._dblCan = n;				// Set new target as double hit candidate.
		t._dblTim = setTimeout(t.dblHitReset, 500);			// activate timer.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hitOut
	  TASK:	Double hit timeout function. 
	——————————————————————————————————————————————————————————————————————————*/
	dblHitReset() {
		var t = display;			// Unbinded so use display as this reference.
		
		if(!t._dblTim)				// If timer is not active,
			return;					// we are done here.
		clearTimeout(t._dblTim);	// Clear timer.
		t._dblTim = null;			// Set handle to null for marking cleared.
		t._dblCan = null;			// Clear double hit candidate control.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: handleMouseDown.
	  TASK:	Application mouse pressed over handler.
	  ARGS:
		e	: UIEvent	: Original javascript event coming from DOM.
	  INFO: This method is bound to display, so this === display.
	——————————————————————————————————————————————————————————————————————————*/
	handleMouseDown(e) {
		var	r = handleMouseEvent(e),		// Pre process mouse event.
			c = r.c;						// Get control.
			
		this._ptrOrg = c;					// Set pointer down origin to control.
		this._mptCtl = c;					// Set mouse pointer origin to control.
		if (c) {							// If control is not null.
			c.doPointerDown(r.x, r.y, e);	// Send pointer down event to control.
			console.log(c.namePath, r.x, r.y);
		}
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROC: handleMouseMove
	  TASK: Application mouse move handler.
	  INFO: Generates mouse move, out and over.
	——————————————————————————————————————————————————————————————————————————*/
	handleMouseMove(e) {
		var t = this,
			r,
			c,
			o;

		if (t._ptrChk)						// If just checking (), 
			return;							// done here.
		r = handleMouseEvent(e);			// Pre-process mouse event.
		c = r.c;							// Get current target control.
		o = t._mptCtl;						// Get old target control.

		// ***********************************************
		// TODO: handleDragStart and handleDrag branching.
		// ***********************************************
		
		if (c && c === o) {					// If current and old controls match,
			o.doPointerMove(r.x, r.y, e);	// Send pointer move event to control.
			return;							// Done.
		}									// If mismatch,
		if (o) {							// If there is an old control,
			if (t._ptrOrg === o)			// If it is the pointer down origin,
				o.doPointerUp(r.x, r.y, e);	// send a pointer up event to old.
			o.doPointerOut(r.x, r.y, e);	// Send a pointer out event to old.
		}	
		t._mptCtl = c;						// Set as current mouse pointer control.
		if (!c)								// If no control,
			return;							// done here.
		c.doPointerOver(r.x, r.y, e);		// Send a pointer over event.
		if (c === t._ptrOrg)				// If current is down origin,
			c.doPointerDown(r.x, r.y, e);	// send a pointer down event.
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	PROC: handleMouseUp
	TASK: Application mouse released over handler.
	——————————————————————————————————————————————————————————————————————————*/
	handleMouseUp(e) {
	var c,									// current control
		r,									// current control info
		o = this._ptrOrg;					// old origin control

		this._ptrOrg = null;				// clear old origin.

		// ***********************************************
		// TODO: handleDragEnd branching.
		// ***********************************************
		
		r = handleMouseEvent(e);			// Pre-process mouse event.
		c = r.c;							// Get current control under mouse.
		if (c) {							// If there is a control,
			c.doPointerUp(r.x, r.y, e);		// Send a pointer up event,
			if (o === c)					// If old and current is same,
				this.hitChk(c, r.x, r.y);	// process if there is a pointer hit.
		}
	}
	

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: handleTouchStart
	  TASK:	Application touch start handler.
	——————————————————————————————————————————————————————————————————————————*/
	// TODO: handleTouchStart.
	handleTouchStart(e) {}
	/*——————————————————————————————————————————————————————————————————————————
	PROC: 	handleTouchMove
	TASK:	Application touch move handler.
	——————————————————————————————————————————————————————————————————————————*/
	// TODO: handleTouchMove.
	handleTouchMove(e) {}
	/*——————————————————————————————————————————————————————————————————————————
	  PROC: handleTouchEnd
	  TASK: Application touch end handler.
	——————————————————————————————————————————————————————————————————————————*/
	// TODO: handleTouchEnd.
	handleTouchEnd(e) {}

	/*	
	handleTouchStart(e) {
	var t = this,
		r,
		c,
		p,
		x,
		y;

		if(e.touches.length > 1){
			if(t.handleZoomStart(e))
				return;
		}

		r = e.touches[0];
		c = t.fetchMouseTarget(e, r);
		p = t.localMouseEvent(c, r.pageX, r.pageY);
		
		t._ptrOrg = c;
		t._tptCtl = c;
		c.doMouseOver(p.x, p.y);
		c.doMouseDown(p.x, p.y);
	}

	handleZoomStart(e) {
		console.log('zoomStart');
		return(true);
	}
	
	handleTouchMove(e) {
		var t = this,
			r = e.touches[0],
			n,
			p,
			x,
			y,
			o;
		
		
		if (e.touches.length > 1){
			if(t.handleZoomMove(e))
				return;
		}
		
		if (t._drg){
			t.doDrag(r.pageX, r.pageY);
			return;
		}
		
		n = t.fetchMouseTarget(e, r);
		p = n.g_displayPos();
		x = r.pageX - p.x;
		y = r.pageY - p.y;
		o = t._tptCtl;
		
		if(n === o){
			n.doMouseMove(x, y);
			return;
		}
		if(o){
			if(t._ptrOrg &&(o === t._ptrOrg))
				o.doMouseUp();
			o.doMouseOut();
		}
		t._tptCtl = n;
		n.doMouseOver(x, y);
		if(n === t._ptrOrg)
			n.doMouseDown(x, y);
	}

	handleZoomMove(e) {
		console.log('zoomMove');
		return(true);
	}
	
	handleTouchEnd(e) {
	var t = this,
		r = e.changedTouches[0],
		n,
		p,
		x,
		y,
		o;
		
		if(t._zrd){
			
		}
		
		if(t._drg){
			t.stopDrag();
			return;
		}	
		
		n = t.fetchMouseTarget(e, r),
		p = n.g_displayPos(),
		x = r.pageX - p.x,
		y = r.pageY - p.y,
		o = t._ptrOrg;
		
		t._tptCtl = null;
		t._ptrOrg = null;
		n.doMouseOut();
		n.doMouseUp();	
		if(n === o)
			t.clickChk(n, x, y);
	}
	*/
	

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: handleKeyUp
	  TASK: Checks only for tab.
	————————————————————————————————————————————————————————————————————————————*/
	handleKeyUp(e) {
		e = e || window.event;				// access event object
		if (e.keyCode === 9){
			e.stopImmediatePropagation();
			e.preventDefault();
			this.reFocus();
		}
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: handleKeyDown
	  TASK: Changes the behaviour for keyboard triggered events.
	————————————————————————————————————————————————————————————————————————————*/
	handleKeyDown(e){
		var t	= this,
			nctl,
			ncon;
		
		e = e || window.event;				// access event object
		if(e.keyCode === 9){
			e.stopImmediatePropagation();
			e.preventDefault();
			ncon = t._curCon;
			nctl = t._curCon.nextTab(e.shiftKey);
			while(nctl === null){
				ncon = ncon.container;
				if(ncon === null)
					break;
				nctl = ncon.nextTab(e.shiftKey);
			}
			t.currentControl = nctl; 
		}
		if(e.charCode === 13){
			e.stopImmediatePropagation();
			e.preventDefault();
			if(t._curCon.defaultControl !== null){
				t._curCon.defaultControl.doClick();
				return;
			}
			if(t._curCtl !== null)
				t._curCtl.doClick();
		}
	}

	/*————————————————————————————————————————————————————————————————————————————
	  Drag-Drop subsystem 
	————————————————————————————————————————————————————————————————————————————*/
	// TODO: Drag-Drop subsystem.

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: handleDragStart
	  TASK: Initiates control dragging.
	  ARGS:
		c	: TControl to drag.
		x	: Pointer x on the control (Global).
		y	: Pointer y on the control (Global).
	  INFO:
		* 	builds drag data into display._drg.
		*	Filters incoming coordinates with respect to input range.
		* 	If there is "onDragStart" handler of target control, calls it.
		* 	If there is no "onDragStart" handler of target control and it is 
			draggable, drags the control.
	————————————————————————————————————————————————————————————————————————————*/
	handleDragStart(c, x, y) {}

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: handleDrag
	  TASK: Calculates coordinates and realizes dragging.
	  ARGS:
		dx	: Pointer x on the control (Global).
		dy	: Pointer y on the control (Global).
	  INFO:
		* Fetches drag data from display._drg.
		* Filters incoming coordinates with respect to input range.
		* If there is "onDrag" handler of target control, calls it.
		* If there is no "onDrag" handler of target control, drags the
		  control.
	————————————————————————————————————————————————————————————————————————————*/
	handleDrag(dx, dy) {}

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: handleDragEnd
	  TASK: Terminates dragging.
	  INFO:
		* 	Fetches drag data from display._drg.
		*	Filters incoming coordinates with respect to input range.
		*	If there is "onDragEnd" handler of target control, calls it.
		*	If there is no "onDragEnd" handler of target control, tries to drop
			the control.
	————————————————————————————————————————————————————————————————————————————*/
	handleDragEnd() {}


	/*
	
	// Old and somewhat funny code:

	startDrag(c, x, y){
		var t = this,
			q = c._own,
			d = t.localMouseEvent(c, x, y);
	
		if(t._drg)					// first stop dragging 
			t.stopDrag();
			
		d = c._eve.onStartDrag;		// fetch event to relay
		if (d)						// If event is assigned
			c.dispatch(d, [c]);		// dispatch it	
	}

	doDrag(dx, dy){
	var t = this,
		d = t._drg,
		i,
		m,
		o,
		c,
		x,
		y;
		
		if(!d)						// if not dragging, return
			return;
		
		c = d.c;
		i = d.i;
		m = d.m;
		o = d.o;	
		x = dx - d.x;				// fetch top left page coordinates
		y = dy - d.y;
		
		if((x < i.l)				// if out of input range
		|| (x > i.r)
		|| (y < i.t)
		|| (y > i.b))
			return; 
			
			
		
		if(x < m.l) 				// normalize into map range
			x = m.l;
		if(x > m.r) 
			x = m.r;
		if(y < m.t) 
			y = m.t;
		if(y > m.b) 
			y = m.b;
									
		x -= o.x;					// convert to owner relative
		y -= o.y;
		
		d = c._eve.onDrag;			// fetch event to relay
		if(d){						// dispatch event if assigned
			c.dispatch(d,[c, x, y]);
		} else {					// else move it yourself
			c.x = x;
			c.y = y;
		}
	}

	stopDrag(){
	var t = this,
		d = t._drg,
		c;
		
		if(!d)
			return;
		c = d.c;
		t._drg = null;	
		d = c.onEndDrag;			// fetch event to relay
		if(d)						// If event is assigned
			c.dispatch(d,[c]);		// dispatch it
		d = null;	
	}

	*/

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	currentControl : cControl;
	  GET : Returns current focused control.  
	  SET : Tries to focus to the given control.
	————————————————————————————————————————————————————————————————————————————*/
	get currentControl() {
		return(this._curCtl);
	}

	set currentControl(c) {
		var t = this,
			i;

		if (!(c instanceof TControl) || !c._interact || c === t._curCtl){
			t.reFocus(); 
			return;
		}
		if (t._curCtl)
			t._curCtl.doFocusOut();
		t._curCtl = c;
		t._curCon = c.container;
		t._curCtl.doFocusIn();	
		t.reFocus();
		i = t._curCon;
		while(i){
			i.focus = c;
			c		= i;
			i		= c.container;
		}
		if (t._curCtl instanceof TContainer)
			t.currentControl = t._curCtl.validFocus();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: reFocus
	  TASK: refreshes the focus.
	————————————————————————————————————————————————————————————————————————————*/
	reFocus (){
		var t = this;

		if (!t._curCtl || !t._curCtl._interact)
			return;
		if (t._curCtl.focusTarget)	
			t._curCtl.focusTarget.focus();
		t._curCtl.invalidate();
	}

    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	viewportName : string.
	  GET : Returns current viewport size name.  
	————————————————————————————————————————————————————————————————————————————*/
    get viewportName() {
		return this._vpsnam;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	currentContainer : cContainer.
	  GET : Returns container of current focused control.  
	————————————————————————————————————————————————————————————————————————————*/
	get currentContainer() {
		return this._curCon;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	showing : Boolean [override].
	  GET : Always true.
	——————————————————————————————————————————————————————————————————————————*/
	get showing() {	return true;}	

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: displaying : Boolean [override].
	  GET : Always true.
	——————————————————————————————————————————————————————————————————————————*/
	get displaying() {
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	x   : int;
	  GET : always 0.
	  SET : blocked [override].
	——————————————————————————————————————————————————————————————————————————*/
	get x() {return 0;}
	set x(v) {}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	y   : int;
	  GET : always 0.
	  SET : blocked [override].
	——————————————————————————————————————————————————————————————————————————*/
	get y() {return 0}
	set y(v) {}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	width : int;
	  GET : Returns display width [override].
	  SET : blocked [override].
	——————————————————————————————————————————————————————————————————————————*/
	get width() {
		this._width = window.innerWidth;
		return this._width;
	}

	set width(v) {
		super.width = window.innerWidth;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	height : int;
	  GET : Returns display height [override].
	  SET : blocked [override].
	——————————————————————————————————————————————————————————————————————————*/
	get height() {
		this._height = window.innerHeight;
		return(this._height);
	}

	set height(v) {
		super.height = window.innerHeight;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	visible : Boolean [override].
	  GET : always true.
	  SET : blocked.
	——————————————————————————————————————————————————————————————————————————*/
	get visible() {
		return(true);
	}

	set visible(v) {}

}

/*—————————————————————————————————————————————————————————————————————————
  FUNC: calculateViewportName
  TASK: Returns the viewport size name.
  ARGS: w   : number : Viewport width in pixels or null for auto.
  RETV:		: string : viewport size name.
—————————————————————————————————————————————————————————————————————————*/
function calculateViewportName(w = null) {
    var s = TCtl.viewportSizes,
        i,
        l = s.length;

    if (w === null)
        w = document.documentElement.clientWidth;
    for(i = 0; i < l; i++) {
        if (w < s[i])
            break;
    }
    return TCtl.viewportNames[i];
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: localMouseEvent
  TASK:	
  	Convert global (body) mouse event to local (control) mouse event.
  ARGS:
	control	: TControl		: TControl to fetch local event. 
	event	: MouseEvent 	: Incoming global event.
  RETV:		: MouseEvent	: Localized event.
——————————————————————————————————————————————————————————————————————————*/
function localMouseEvent(control, event){
	var e;
	if (control === display) 
		return event;
	display._ptrChk = true;
	e = new MouseEvent("mousemove", event);
	control._element.dispatchEvent(e);
	display._ptrChk = false;
	return e;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: handleMouseEvent
  TASK:	Processes an incoming mouse event.
  ARGS:
	event	: MouseEvent 	: incoming event.
  RETV:		: Object		: 
  				{	
					c: TControl at topmost hit through transparencies,
					   or null if no eligible target,
					x: TControl local offsetX,
					y: TControl local offsetY
				}
——————————————————————————————————————————————————————————————————————————*/
function handleMouseEvent(event) {
	event.stopImmediatePropagation();		// do not let it go anywhere.
	event.preventDefault();
	return findOpaque(event);
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: findOpaque [private].
  TASK:
	Finds the first opaque pixeled layer at hitpoint coordinates on 
	focusable layers even with transparency involved.
  ARGS:
	event	: MouseEvent	: Incoming mouseEvent.
  RETV:		: Object		: 
  				{	
					c: TControl at topmost hit through transparencies,
					   or null if no eligible target,
					x: TControl local offsetX,
					y: TControl local offsetY
				}
——————————————————————————————————————————————————————————————————————————*/
function findOpaque(event) {
	var tar,
		cct,
		eve,
		lst,
		ret = {c: null, x: event.clientX, y: event.clientY};
	
	lst = document.elementsFromPoint(event.clientX, event.clientY);
	while (lst.length > 1){
		ret.c = null;
		tar = lst.shift();
		if (!tar || !tar.ToreJS_Control) 
			break;
		cct = tar.ToreJS_Control; 
		if (!cct._interact && !cct._yieldFocus)
			break;
		ret.c = cct;
		if (cct === display) 
			break
		eve = localMouseEvent(cct, event);
		if (!cct._hitOpaque || cct.isEventOffsetOpaque(eve)){
			ret.x = eve.offsetX;
			ret.y = eve.offsetY;
			break;
		}
	}
	return ret;
}

export const display = new TDisplay();
display.doViewportResize();