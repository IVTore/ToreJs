/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Display.js: Tore Js Display control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { TObject, Component, sys, is, exc, core } from "../lib/index.js";
import { ctl, Container, Panel, styler } from "../ctl/index.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: Display
  TASKS:
	This class generates a singleton control display or core.display. 
	It represents the display area of the browser, borrowing 
	properties from window and body.
	The display control manages:
	1) Browser tab behaviour.
	2) Focusing of all controls.
	3) Mouse and Touch events.
————————————————————————————————————————————————————————————————————————————*/

class Display extends Panel {

	// Display does not make an element but binds to body.
	static elementTag = null;

	// Display special events and handler names.
	static displayEvents = {
		touchstart: 'hndTouchStart',
		touchmove:	'hndTouchMove',
		touchend:	'hndTouchEnd',
		mousedown:	'hndMouseDown',
		mousemove:	'hndMouseMove',		
		mouseup:	'hndMouseUp',
		resize: 	'doViewportResize',
		keydown:  	'hndKeyDown',
		keyup:		'hndKeyUp'
	}

	static cdta = {
		tabsLoop		: {value: true},
		currentControl	: {value: null},
	};

	_curCtl = null;		// current control
	_curCon = null;		// current container
	_events = null;		// display specific events
	_ptrOrg = null;		// pointer origin control
	_ptrChk = false;	// pointer checking.
	_tptCtl = null;		// touch pointer current control
	_mptCtl = null;		// mouse pointer current control
	_dblCan = null;		// double hit candidate
	_dblTim = null;		// double hit timer
	_drg =	null;		// drag data
	_zrd =	null;		// zoom-rotate data
	_renLst = null;		// render list
	_renFrm = false;	// render frame requested.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs display singleton.
	——————————————————————————————————————————————————————————————————————————*/
	constructor() {
		var l,
			e;

		if (core["display"])
			exc("E_SINGLETON", "core.display");
		super(sys.LOAD);
		this._sta = sys.LIVE;
		this.name = "display";
		core.attach(this);
		this._element = document.body;			// we do not make, but bind it.
		this._element.ToreJS_Control = this;
		this.tabsLoop = true;
		this._curCon = this;					// display is current container 
		this._events = {};						// display events list
		this._renLst = [];						// request animation list
		l = this.class.displayEvents;
		for(e in l){						// link and add event listeners
			this._events[e] = sys.bindHandler(this, l[e]);
			window.addEventListener(e, this._events[e], true);
		}
		this.controlState = ctl.ALIVE;
		this.doViewportResize();
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
		super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: addRenderQueue
	  TASK: Adds invalidated control to queue.
	  ARGS: control : Control : Control to add to queue.
	——————————————————————————————————————————————————————————————————————————*/
	addRenderQueue(control = null){
		var t = this;

		if (!is.control(control) || t._renLst.indexOf(control) > -1)
			return;
		t._renLst.push(control);
		if (t._renFrm)
			return;
		t._renFrm = true;
		window.requestAnimationFrame(t.validate);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: validate
	  TASK: Renders invalidated controls in queue.
	——————————————————————————————————————————————————————————————————————————*/
	validate(timeStamp) {
		var t = display,
			r = t._renLst,
			l = r.length,
			i,
			c;
		
		t._renLst = [];
		t._renFrm = false;
		
		for(i = 0; i < l; i++){
			c = r[i];
			c.render();
		}	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize [override]
	  TASK: Flags the display that window is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		this.width = 1;
		this.height = 1;
		return super.doViewportResize();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: resizing [override].
	  TASK: Notifies member controls that display is resized.
	  ARGS: align : Boolean : not used in override.
	—————————————————————————————————————————————————————————————————————————*/
	resizing(align) {
		super.resizing(false);
	}

	/*————————————————————————————————————————————————————————————————————————————
		Application Focus Control.
		This subsystem works in coherence with focusing and tabbing
		mechanisms of containers and controls.
	————————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hitChk
	  TASK:	
		Double hit checking function. Issues hit and sets timer for
		double hit capture.
	  ARGS:
		n	: Control 	: hit target control.
		x	: number	: Control relative click x coordinate 
		y	: number	: Control relative click y coordinate
		e	: UIEvent	: Original event.
	——————————————————————————————————————————————————————————————————————————*/
	hitChk(n, x, y, e) {
		var t = display,
			o = t._dblCan;

		t.hitOut();
		n.doHit(x, y, e);
		if(n === o){
			n.doDoubleHit(x, y, e);
			return;
		}
		t._dblCan = n;
		t._dblTim = setTimeout(t.hitOut, 500);	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hitOut
	  TASK:	Double hit timeout function. 
	——————————————————————————————————————————————————————————————————————————*/
	hitOut() {
		var t = display;
		
		if(!t._dblTim)
			return;
		clearTimeout(t._dblTim);
		t._dblTim = null;
		t._dblCan = null;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hndMouseDown.
	  TASK:	Application mouse pressed over handler.
	——————————————————————————————————————————————————————————————————————————*/
	hndMouseDown(e) {
		var	r = handleMouseEvent(e),
			c = r.c;
			
		this._ptrOrg = c;
		this._mptCtl = c;
		if (c) {
			c.doPointerDown(r.x, r.y, e);
			console.log(c.namePath, r.x, r.y);
		}
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROC: hndMouseMove
	  TASK: Application mouse move handler.
	  INFO: Generates mouse move, out and over.
	——————————————————————————————————————————————————————————————————————————*/
	hndMouseMove(e) {
		var t = this,
			r,
			c,
			o;

		if (t._ptrChk)
			return;
		if (t._drg){
			t.doDrag(e.pageX, e.pageY);
			return;
		}
		r = handleMouseEvent(e);
		c = r.c;
		o = t._mptCtl;
		
		if (c && c === o){
			o.doPointerMove(r.x, r.y, e);
			return;
		}		
		if (o){
			if (t._ptrOrg === o)
				o.doPointerUp(r.x, r.y, e);
			o.doPointerOut(r.x, r.y, e);
		}	
		t._mptCtl = c;
		if (!c)
			return;	
		c.doPointerOver(r.x, r.y, e);
		if (c === t._ptrOrg)
			c.doPointerDown(r.x, r.y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	PROC: hndMouseUp
	TASK: Application mouse released over handler.
	——————————————————————————————————————————————————————————————————————————*/
	hndMouseUp(e) {
	var t = this,
		c,								// current control
		r,								// current control info
		o = t._ptrOrg;					// old origin control

		t._ptrOrg = null;
		if(t._drg){
			t.stopDrag();
			return;
		}
		r = handleMouseEvent(e);
		c = r.c;
		
		if (c) {
			c.doPointerUp(r.x, r.y, e);
			if (o === c)
				t.hitChk(c, r.x, r.y);
		}		
	}
	

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: hndTouchStart
	  TASK:	Application touch start handler.
	——————————————————————————————————————————————————————————————————————————*/
	hndTouchStart(e) {
	var t = this,
		r,
		c,
		p,
		x,
		y;

		if(e.touches.length > 1){
			if(t.hndZoomStart(e))
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

	hndZoomStart(e) {
		console.log('zoomStart');
		return(true);
	}

	/*——————————————————————————————————————————————————————————————————————————
	PROC: 	hndTouchMove
	TASK:	Application touch move handler.
	——————————————————————————————————————————————————————————————————————————*/
	hndTouchMove(e) {
		var t = this,
			r = e.touches[0],
			n,
			p,
			x,
			y,
			o;
		
		
		if (e.touches.length > 1){
			if(t.hndZoomMove(e))
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

	hndZoomMove(e) {
		console.log('zoomMove');
		return(true);
	}

	/*——————————————————————————————————————————————————————————————————————————
	PROC: 	hndTouchEnd
	TASK:	Application touch end handler.
	——————————————————————————————————————————————————————————————————————————*/
	hndTouchEnd(e) {
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

	

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: hndKeyUp
	  TASK: Checks only for tab.
	————————————————————————————————————————————————————————————————————————————*/
	hndKeyUp(e) {
		e = e || window.event;				// access event object
		if (e.keyCode == 9){
			e.stopImmediatePropagation();
			e.preventDefault();
			this.reFocus();
		}
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: hndKeyDown
	  TASK: Changes the behaviour for keyboard triggered events.
	————————————————————————————————————————————————————————————————————————————*/
	hndKeyDown(e){
		var t	= this,
			nctl,
			ncon;
		
		e = e || window.event;				// access event object
		if(e.keyCode == 9){
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
	/*————————————————————————————————————————————————————————————————————————————
	  PROC: startDrag
	  TASK: Initiates control dragging.
	  ARGS:
		c	: Control to drag.
		x	: Pointer x on the control (Global).
		y	: Pointer y on the control (Global).
	————————————————————————————————————————————————————————————————————————————*/

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

	/*————————————————————————————————————————————————————————————————————————————
	  PROC: doDrag
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

		if (!is.control(c) || !c._interact || c === t._curCtl){
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
		if (t._curCtl instanceof Container)
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
	  PROP:	autosize : Boolean [override].
	  GET : always false.
	  SET : blocked.
	——————————————————————————————————————————————————————————————————————————*/
	get autosize() {
		return(false);
	}

	set autosize(v) {}

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

/*——————————————————————————————————————————————————————————————————————————
  FUNC: localMouseEvent
  TASK:	
  	Convert global (body) mouse event to local (control) mouse event.
  ARGS:
	control	: Control		: Control to fetch local event. 
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
					c: Control at topmost hit through transparencies,
					   or null if no eligible target,
					x: Control local offsetX,
					y: Control local offsetY
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
					c: Control at topmost hit through transparencies,
					   or null if no eligible target,
					x: Control local offsetX,
					y: Control local offsetY
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

export const display = new Display();