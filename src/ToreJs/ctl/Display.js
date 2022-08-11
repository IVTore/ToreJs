/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Display.js: Tore Js Display control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: cDisplay
  TASKS:
	This class generates a singleton control core.display. 
	It represents the display area of the browser, borrowing 
	properties from window and body.
	The display control manages:
	1) Browser tab behaviour.
	2) Focusing of all controls.
	3) Mouse and Touch events.
————————————————————————————————————————————————————————————————————————————*/

class Display extends Panel {

	static cdta = {
		tabsLoop		: {value: true},
		currentControl	: {value: null},
	};

	_ctl =	null;		// current control
	_con =	null;		// current container
	_dev =	null;		// display specific events
	_por =	null;		// pointer origin control
	_tcc =	null;		// touch current control
	_mcc =	null;		// mouse current control
	_dcc =	null;		// double click candidate
	_dct =	null;		// double click timer
	_drg =	null;		// drag data
	_zrd =	null;		// zoom-rotate data
	_ral =	null;		// requester animation list
	_raf =	false;		// requested animation frame
	_pr = 1;			// Device pixel ratio
	_vx = 1024;			// virtual screen box
	_vy = 768;
	_vl = 0;

	/*———————————————————————————————————————————————————————————————————————————
	  PROC: classInit
	  TASK: Queued to run after application load for class initializations.  
	———————————————————————————————————————————————————————————————————————————*/
	static classInit() {
		styler.addRule('Display', {
			border: '0px',
			padding: '0px',
			margin: '0px',
			boxSizing: 'border-box',
			overflow: 'hidden'
		});
	}

/*——————————————————————————————————————————————————————————————————————————
  PROC: cDisplay
  TASK: Constructs core.display singleton control.
——————————————————————————————————————————————————————————————————————————*/
construct:	function cDisplay (){
var t = this,
	l,
	f,
    ix,
    rx,
    ry,
    sx,
    sy,
    sc,
    vp;

	t.tabsLoop = true;
	t._con = t;							// display is current container 
	t._dev = {};						// display events list
	t._ral = [];						// request animation list
    
    // for cordova
    if(window.cordova){
		
		// For intel XDK
  		if(window.intel && intel.xdk && intel.xdk.device){
    	    ix = intel.xdk;
        	ix.device.setAutoRotate(true);
        	ix.device.setRotateOrientation("landscape");
			ix.device.hideStatusBar();
        }
        // Set mobile screen scaling
        rx  = window.screen.availWidth;
        ry  = window.screen.availHeight;
        if(rx < ry){
            l = rx;
            rx = ry;
            ry = l;
        }
	    sx = rx / t._vx;
	    sy = ry / t._vy;
        
        t._vl = Math.floor((sy > sx) ? t._vx : t._vx * (sx / sy));
        t._vx = t._vl;
        vp = document.querySelector("meta[name=viewport]");
        vp.setAttribute('content', 'width='+t._vl+', user-scalable=no');
    }
	    
    window.display = t;                 // display is a special case
    Sys.makeSingleton('display', t);	// set up as a singleton    
	for(l in Ctl.DSE){					// link and add event listeners
		f = Sys.linkHandler(t, Ctl.DSE[l]);
		t._dev[l] = f;
		window.addEventListener(l, t._dev[l], true);
	}
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: destroy
  TASK: Destroys display singleton. 
——————————————————————————————————————————————————————————————————————————*/
destroy: function (){
var t = this,
	l;
	
	for(l in Ctl.DSE){
		window.removeEventListener(l, t._dev[l],true);
		delete t._dev[l];
	}
	t._dev = null;	
	t._ral = null;
	Sys.killSingleton(t);
},

/*————————————————————————————————————————————————————————————————————————————
  PROC: makeDom [override]
  TASK: Binds display to its body element.
  ——————————————————————————————————————————————————————————————————————————*/
makeDom: function(){
var t = this,
	d = document,
	i,
	s;	

	if(t._dom)
		return;
	t._dom = d.body;
	t._sty = t._dom.style;
    t.setWidHei();
},

setWidHei: function(){
var t = this;
    
    t._w        = window.innerWidth;
    t._h        = window.innerHeight;
    t._sty.width  = t._w + 'px';
    t._sty.height = t._h + 'px';
},
    
    
/*——————————————————————————————————————————————————————————————————————————
  PROC: killDom [override]
  TASK: Frees display from its dom element.
  INFO: Some elements like body are not destroyable.
——————————————————————————————————————————————————————————————————————————*/
killDom: function(){
var t = this,
	d = this._dom;
	
	if(!d)
		return;
	t._dom = null;			
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: hideSplashScreen
  TASK: Hides splash screen on cordova or xdk environments.
——————————————————————————————————————————————————————————————————————————*/
hideSplashScreen: function(){
	if( navigator.splashscreen && navigator.splashscreen.hide )	// Cordova API
		navigator.splashscreen.hide() ;
            
	if( window.intel && intel.xdk && intel.xdk.device ) 		// Intel XDK device API 
		intel.xdk.device.hideSplashScreen() ;            
		
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: animate
  TASK: Adds invalidated control to queue.
——————————————————————————————————————————————————————————————————————————*/
animate: function(c){
var t = this;
	if(t._ral.indexOf(c)===-1)
    	t._ral.push(c);
	if(t._raf)
		return;
	t._raf = true;
	if(!window.requestAnimationFrame){
		setTimeout(t.validate, 16);
		return;
	}	
    window.requestAnimationFrame(t.validate);
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: validate
  TASK: Draws invalidated controls in queue.
——————————————————————————————————————————————————————————————————————————*/
validate: function(timeStamp){
var t = display,
	l = t._ral,
	i,
	c;
	
	t._ral = [];
	t._raf = false;
	
	for(i = 0; i < l.length; i++){
		c = l[i];
		c.draw();
		c._inv = false;
	}	
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: doOwnerResize [override]
  TASK: Flags the display that window is resized.
——————————————————————————————————————————————————————————————————————————*/
doOwnerResize: function() {
var t = this,
	d = t.onOwnerResize;
	
	t.resizing(true);
	if(d)
		t.dispatch(d,[t]);
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: resizing [override]
  TASK: Notifies member controls that display is resized.
  ARGS: align : Boolean : not used in override.
——————————————————————————————————————————————————————————————————————————*/
resizing: function(align){
var t = this,
	s;	

    t.setWidHei();
	for(s in t._mem){
		if(Ctl.isControl(t._mem[s]))
			t._mem[s].doOwnerResize();
	}
	t._owd = t._w;
	t._ohe = t._h;
	t.calculateLayout();
},

/*————————————————————————————————————————————————————————————————————————————
  : Application Focus Control.
    This subsystem works in coherence with focusing and tabbing
	mechanisms of containers and controls.
————————————————————————————————————————————————————————————————————————————*/
                      
/*——————————————————————————————————————————————————————————————————————————
 FUNC: 	processEvent
 TASK:	Processes an incoming mouse or touch event.
 ARGS:  e	: event 	: incoming event.
 		o	: object	: object to fetch page coords 
 RETV		: cControl	: topmost interactive control, else topmost control.
——————————————————————————————————————————————————————————————————————————*/
processEvent: function(e, o){
var t = this,
    c,
	ox = o.pageX,
	oy = o.pageY;
    
    e.stopImmediatePropagation();		// do not let it bubble any more
    e.preventDefault();
    c = document.elementFromPoint(ox, oy);
    if(!c)
		return(this);
   	c = Sys.fetchObject(c.id);
 	return((c._c2d && !c.hitAll) ? this.findOpaque(c, ox, oy) : c);
},


/*——————————————————————————————————————————————————————————————————————————
 FUNC: 	findOpaque
 TASK:	Finds the first opaque pixeled layer at hitpoint coordinates on 
 		focusable layers with transparency 
 ARGS:  c	: cImage 	: Image with transparent canvas
 		x	: number	: display x coordinate 
 		y	: number	: display y coordinate
 RETV		: cControl	: Topmost hit.
——————————————————————————————————————————————————————————————————————————*/
findOpaque: function(c, x, y){
var r  = c.g_displayPos(),
	ox = x - r.x,
	oy = y - r.y;

    if(c._c2d.getImageData(ox, oy, 1, 1).data[3] != 0)	// if opaque
		return(c);	
	c._sty.pointerEvents = 'none';
	r = Sys.fetchObject(document.elementFromPoint(x, y).id);
	if(r._c2d && !r.hitAll)
		r = this.findOpaque(r, x, y);
	c._sty.pointerEvents = 'auto';
	return(r);	
},

/*——————————————————————————————————————————————————————————————————————————
 PROC: 	clickChk
 TASK:	Double click checking function. Issues click and sets timer for
 		double click capture.
 ARGS:  n	: cControl 	: Click target control.
 		x	: number	: Control relative click x coordinate 
 		y	: number	: Control relative click y coordinate
——————————————————————————————————————————————————————————————————————————*/
clickChk: function(n, x, y){
var t = this,
	o = t._dcc;

	t.clickOut();
	n.doClick(x, y);
	if(n === o){
		n.doDblClick(x, y);
		return;
	}
	t._dcc = n;
	t._dct = setTimeout(t.clickOut, 500);	
},

/*——————————————————————————————————————————————————————————————————————————
 PROC: 	clickOut
 TASK:	Double click timeout function. 
——————————————————————————————————————————————————————————————————————————*/
clickOut: function(){
var t = display;
	
	if(!t._dct)
		return;
	clearTimeout(t._dct);
	t._dct = null;
	t._dcc = null;
},



/*——————————————————————————————————————————————————————————————————————————
 PROC: 	hndTouchStart
 TASK:	Application touch start handler.
——————————————————————————————————————————————————————————————————————————*/
hndTouchStart: function (e){
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
	c = t.processEvent(e, r);
	p = c.g_displayPos();
	x = r.pageX - p.x;
	y = r.pageY - p.y;

	t._por = c;
	t._tcc = c;
	c.doMouseOver(x, y);
	c.doMouseDown(x, y);
},

hndZoomStart: function(e) {
	Sys.log('zoomStart');
	return(true);
},

/*——————————————————————————————————————————————————————————————————————————
 PROC: 	hndTouchMove
 TASK:	Application touch move handler.
——————————————————————————————————————————————————————————————————————————*/
hndTouchMove: function (e){
var t = this,
	r = e.touches[0],
	n,
	p,
	x,
	y,
	o;
	
	if(e.touches.length > 1){
		if(t.hndZoomMove(e))
			return;
	}
	
	if(t._drg){
		t.doDrag(r.pageX, r.pageY);
		return;
	}
	
	n = t.processEvent(e, r);
	p = n.g_displayPos();
	x = r.pageX - p.x;
	y = r.pageY - p.y;
	o = t._tcc;
	
	if(n === o){
		n.doMouseMove(x, y);
		return;
	}
	if(o){
		if(t._por &&(o === t._por))
			o.doMouseUp();
		o.doMouseOut();
	}
	t._tcc = n;
	n.doMouseOver(x, y);
	if(n === t._por)
		n.doMouseDown(x, y);
},

hndZoomMove: function(e) {
	Sys.log('zoomMove');
	return(true);
},

/*——————————————————————————————————————————————————————————————————————————
 PROC: 	hndTouchEnd
 TASK:	Application touch end handler.
——————————————————————————————————————————————————————————————————————————*/
hndTouchEnd: function (e){
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
	
	n = t.processEvent(e, r),
	p = n.g_displayPos(),
	x = r.pageX - p.x,
	y = r.pageY - p.y,
	o = t._por;
	
	t._tcc = null;
	t._por = null;
	n.doMouseOut();
	n.doMouseUp();	
	if(n === o)
		t.clickChk(n, x, y);
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: hndMouseDown
  TASK:	Application mouse pressed over handler.
——————————————————————————————————————————————————————————————————————————*/
hndMouseDown: function (e){
var t = this;
	c = t.processEvent(e, e),
	p = c.g_displayPos(),
	x = e.pageX - p.x,
	y = e.pageY - p.y;
	
	t._por = c;
	t._mcc = c;
	c.doMouseDown(x, y);
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: hndMouseMove
  TASK:	Application mouse move handler.
  INFO: Generates mouse move, out and over.
——————————————————————————————————————————————————————————————————————————*/
hndMouseMove: function (e){
var t = this,
	n,
	p,
	x,
	y,
	o;
	
	if(t._drg){
		t.doDrag(e.pageX, e.pageY);
		return;
	}
	n = t.processEvent(e, e);
	p = n.g_displayPos();
	x = e.pageX - p.x;
	y = e.pageY - p.y;
	o = t._mcc;
	
	if(n === o){
		o.doMouseMove(x, y);
		return;
	}		
	if(o){
		if(t._por && (t._por === o))
			o.doMouseUp();
		o.doMouseOut();
	}	
		
	t._mcc = n;
	n.doMouseOver(x, y);
	if(n === t._por)
		n.doMouseDown(x, y);
},

/*——————————————————————————————————————————————————————————————————————————
  PROC: hndMouseUp
  TASK: Application mouse released over handler.
——————————————————————————————————————————————————————————————————————————*/
hndMouseUp: function (e){
var t = this,
	c,								// current control
	p,								// current control display position
	x,								// current control relative x and y
	y,
	o;								// old origin control
	
	o = t._por;
	t._por = null;

	if(t._drg){
		t.stopDrag();
		return;
	}
	
	c = t.processEvent(e, e);
	p = c.g_displayPos();
	x = e.pageX - p.x;
	y = e.pageY - p.y;
	
	c.doMouseUp();
	if(o === c)
		t.clickChk(c, x, y);		
},


/*————————————————————————————————————————————————————————————————————————————
  PROC: hndKeyUp
  TASK: Checks only for tab.
————————————————————————————————————————————————————————————————————————————*/
hndKeyUp: function(e) {
var kcod;

	e = e || window.event;				// access event object
	kcod = ('which' in e) ? e.which : e.keyCode;	
	if(kcod == 9){
		e.stopImmediatePropagation();
		e.preventDefault();
		this.reFocus();
	}
},

/*————————————————————————————————————————————————————————————————————————————
  PROC: hndKeyDown
  TASK: Changes the behaviour for keyboard triggered events.
————————————————————————————————————————————————————————————————————————————*/
hndKeyDown: function(e){
var t	= this,
	nctl,
	ncon,
	kcod;
	
	e = e || window.event;				// access event object
	kcod = ('which' in e) ? e.which : e.keyCode;
	if(kcod == 9){
		e.stopImmediatePropagation();
		e.preventDefault();
		ncon = t._con;
		nctl = t._con.nextTab(e.shiftKey);
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
		if(t._con.defaultControl !== null){
			t._con.defaultControl.doClick();
			return;
		}
		if(t._ctl !== null)
			t._ctl.doClick();
	}
},

/*————————————————————————————————————————————————————————————————————————————
  Drag-Drop subsystem 
————————————————————————————————————————————————————————————————————————————*/
/*————————————————————————————————————————————————————————————————————————————
  PROC: startDrag
  TASK: Initiates control dragging.
  ARGS: c	: Control to drag.
  		x	: Current pointer abscissa on the control.
  		y	: Current pointer ordinate on the control.
  		i	: Input range, a rectangle defining the boundaries of 
  			  drag input. Though coordinates are control owner relative,
  			  they can be defined to map out of owner boundries.
  			  When pointer goes out of input range, pointer 
  			  motions are not sent to control. 
  			  Rectangle is defined as follows:
  			  { l:<left>, t:<top>, r:<right>, b:<bottom>}
  			  If argument is not defined, it will default to owner
  			  boundaries.
  		m	: Map range,a rectangle defining the boundaries of 
  			  drag output. Coordinates are control owner relative.
  			  When input goes out of map range, pointer 
  			  motions are normalized accordingly. 
  			  Rectangle is defined as follows:
  			  { l:<left>, t:<top>, r:<right>, b:<bottom>}
  			  If argument is not defined, it will default to owner
  			  boundaries normalized for keeping the control fully 
  			  visible in the owner.  
————————————————————————————————————————————————————————————————————————————*/

startDrag: function(c, x, y, i, m){
var t = this,
	q = c._own,
	d = q.g_displayPos();
	
	
	if(t._drg)					// first stop dragging 
		t.stopDrag();
		
	// complete the data and map to display coordinates
	if(!i)
		i = {};
	if(!m)
		m = {};
	
	i.l = (i.l !== undefined)? d.x + i.l : -x;//d.x;
	i.t = (i.t !== undefined)? d.y + i.t : -y;//d.y;
	i.r = (i.r !== undefined)? d.x + i.r : d.x + q._w;
	i.b = (i.b !== undefined)? d.y + i.b : d.y + q._h;	
	
	m.l = (m.l !== undefined)? d.x + m.l : d.x;
	m.t = (m.t !== undefined)? d.y + m.t : d.y;
	m.r = (m.r !== undefined)? d.x + m.r : (d.x + q._w)-c._w;
	m.b = (m.b !== undefined)? d.y + m.b : (d.y + q._h)-c._h;	
		
	t._drg = {					// build drag data
		c: c,
		x: x,
		y: y,
		i: i,
		m: m,
		o: d		
	}
	d = c._eve.onStartDrag;		// fetch event to relay
	if(d)						// If event is assigned
		c.dispatch(d, [c]);		// dispatch it	
},

/*————————————————————————————————————————————————————————————————————————————
  PROC: doDrag
  TASK: Calculates coordinates and realizes dragging.
  ARGS: dx	: Current pointer abscissa on the display.
  		dy	: Current pointer ordinate on the display.
  INFO: * Fetches drag data from display._drg.
  		* Filters incoming coordinates with respect to input range.
  		* Calculates output coordinates with respect to map range.
  		* If there is "onDrag" handler of target control, calls it.
  		* If there is no "onDrag" handler of target control, drags the
  		  control.
————————————————————————————————————————————————————————————————————————————*/
doDrag: function(dx, dy){
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
},

stopDrag: function(){
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
},


/*————————————————————————————————————————————————————————————————————————————
  Focus subsystem get sets
————————————————————————————————————————————————————————————————————————————*/

/*————————————————————————————————————————————————————————————————————————————
  PROP:	currentControl : cControl;
  TASK:	GET : Returns current focused control.  
		SET : Tries to focus to the given control.
————————————————————————————————————————————————————————————————————————————*/
g_currentControl: function(){
	return(this._ctl);
},

s_currentControl: function(c) {
var t = this,
	i;

	if((c == null)||(!c.interactive)||(c === t._ctl)){
		t.reFocus(); 
		return;
	}
	if(t._ctl)
		t._ctl.doFocusOut();
	t._ctl = c;
	t._con = c.container;
	t._ctl.doFocusIn();	
	t.reFocus();
	i = t._con;
	while(i){
		i.focus = c;
		c		= i;
		i		= c.container;
	}
	if(t._ctl instanceof cContainer)
		t.currentControl = t._ctl.validFocus();
},

/*————————————————————————————————————————————————————————————————————————————
  PROC: reFocus
  TASK: refreshes the focus.
————————————————————————————————————————————————————————————————————————————*/
reFocus: function(){
var t = this;

	if((!t._ctl)||(!t._ctl.interactive))
		return;
	if(t._ctl.focusTarget)	
		t._ctl.focusTarget.focus();
	t._ctl.invalidate();
},

/*————————————————————————————————————————————————————————————————————————————
  PROP:	currentContainer : cContainer;
  TASK:	GET : Returns container of current focused control.  
————————————————————————————————————————————————————————————————————————————*/
g_currentContainer: function (){
	return(this._con);
},

//  endsubsys: Application focus control


/*——————————————————————————————————————————————————————————————————————————
  PROP: displaying [override]: Boolean true if control is being displayed.
  TASK: GET : Always true.
——————————————————————————————————————————————————————————————————————————*/
g_displaying: function (){
	return(true);
},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	x   : int;
  TASK:	GET : always 0.
		SET : blocked [override].
——————————————————————————————————————————————————————————————————————————*/
s_x: function(v){},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	y   : int;
  TASK:	GET : always 0.
		SET : blocked [override].
——————————————————————————————————————————————————————————————————————————*/
s_y: function(v){},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	displayX : int;
  TASK:	GET : Returns 0 for display control.
  INFO: Transformations not taken into account.
——————————————————————————————————————————————————————————————————————————*/
g_displayX: function(){
	return(this._x);
},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	displayY : int;
  TASK:	GET : Returns 0 for display control.
  INFO: Transformations not taken into account.
——————————————————————————————————————————————————————————————————————————*/
g_displayY: function(){
	return(this._y);
},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	width : int;
  TASK:	GET : Returns display width [override].
		SET : blocked [override].
——————————————————————————————————————————————————————————————————————————*/
g_width: function(){
	this._w = window.innerWidth;
	return(this._w);
},

s_width: function(v){},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	height : int;
  TASK:	GET : Returns display height [override].
		SET : blocked [override].
——————————————————————————————————————————————————————————————————————————*/
g_height: function () {
    this._h = window.innerHeight;
	return(this._h);
},

s_height: function (v){},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	autoSize : Boolean;
  TASK:	GET : always false.
		SET : blocked.
——————————————————————————————————————————————————————————————————————————*/
g_autoSize: function (){
	return(false);
},

s_autoSize: function (v){},

/*——————————————————————————————————————————————————————————————————————————
  PROP:	visible : Boolean;
  TASK:	GET : always true.
		SET : blocked.
——————————————————————————————————————————————————————————————————————————*/
g_visible: function(){
	return(true);
},

s_visible: function(v){}

});	// end class