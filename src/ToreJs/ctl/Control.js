/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Control.js: Tore Js base visual control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { TObject, Component, sys, is, exc } from "../lib/index.js";
import { ctl } from "./ctl.js";
import { Container } from "./Container.js";
import { Display, display } from "./Display.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: cControl
  TASKS: Defines basic behaviours of Tore JS visual controls.
  NOTES:
	*	Parent - Child control hierarchy is mapped to standard owner-member
		system.
	*	Control defines an interactivity scheme. 
	*	Control defines an style name scheme which has:
		*	The class name of the control, like Label or Button etc.
		*	A suffix coming from controlState like, Alive or Sleep etc.
		*	A styleName if defined.
		*	A styleExtra if defined.
		Example: 
		An active Label instance with styleName Super and styleExtra Fancy
		will have a className :
		"Label LabelAlive Super SuperAlive SuperFancy SuperFancyAlive"
————————————————————————————————————————————————————————————————————————————*/

export class Control extends Component {

	static elementTag = 'div';	// Control dom tag.
	static defCanFocus = true;	// Control focusability default.
	static initialStyle = {
		top: "0px",
		left: "0px",
		width: "64px",
		height: "64px",
		zIndex: "0",
		opacity: "1",
		visibility: "visible"
	}
	
	static cdta = {				// property publishing map
		x				: {value: 0},
		y				: {value: 0},
		width			: {value: 64},
		height			: {value: 64},
		zIndex			: {value: 0},
		opacity			: {value: 1},
		tabIndex		: {value: 0},
		alignX			: {value: 'none'},
		alignY			: {value: 'none'},
		styleName		: {value: null},
		styleExtra		: {value: null},	
		controlState	: {value: ctl.ALIVE},
		
		visible			: {value: true},
		enabled			: {value: true},
		autosize		: {value: false},
		canFocus		: {value: false},
		
		// publish these normal variables
		anchorLeft		: {value: false, store: true},
		anchorTop		: {value: false, store: true},
		anchorRight		: {value: false, store: true},
		anchorBottom	: {value: false, store: true},
		dragEnabled		: {value: false, store: true},
		// Events
		onFocusIn		: {event: true},
		onFocusOut		: {event: true},
		onMemberResize	: {event: true},
		onOwnerResize	: {event: true},
		onLanguageChange: {event: true},
		onStartDrag		: {event: true},
		onDrag			: {event: true},
		onEndDrag		: {event: true},
		onClick			: {event: true},
		onDoubleClick	: {event: true},
		onMouseDown		: {event: true},
		onMouseUp		: {event: true},
		onMouseOut		: {event: true},
		onMouseOver		: {event: true},
		onMouseMove		: {event: true},
		// Native events that can be listened
		onKeyDown		: {event: true, typ:'keydown',		obj:'_element'},
		onKeyUp			: {event: true, typ:'keyup',		obj:'_element'},
	}

	_x = 0;						// X coordinate.
	_y = 0;						// Y coordinate.
	_width = 64;				// Width.
	_height = 64;				// Height.
	_zIndex = 0;				// Z index.
	_opacity = 1;				// Opacity (alpha).
	_tabIndex = 0;				// Tab index.
	_alignX = 'none';			// X axis alignment.
	_alignY = 'none';			// Y axis alignment.
	_styleName = null;			// Style root name.
	_styleExtra = null;			// Extra style name.
	_ctlState = 0;				// control state.
	_element = null;			// Dom element.
	_visible = true;			// Visibility setting.
	_enable = true;				// Enable flag.
	_autosize = false;			// Autosize flag.
	_canFocus = true;			// Control can focus or not.
	
	_interact = false;			// Interactibility state.
	_mouseOvr = false;			// Pointer over.
	_oldWidth = 0;				// Previous width of control.
	_oldHeight = 0;				// Previous height of control.
	_changeClass = true;		// Rewrite element class names.
	
	_shade = initStyle;			// shadow style.
	anchorLeft = true;
	anchorTop = true;
	anchorRight = false;
	anchorBottom = false;
	dragEnabled = false;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a Control component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: Component	: Owner of the new control if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name);
		makeElement(this);
		this.canFocus = this.class.defCanFocus;
		if (name == sys.LOAD)
			return;
		this.controlState = ctl.ALIVE;
		if (data)
			sys.propSet(this, data);
		if (owner)
			owner.attach(this);
		this.invalidate();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the control.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.controlState = ctl.DYING;
		super.destroy();		// inherited destroy
		killElement(this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	Attaches a member component to the Control.
	  ARGS:
		component	: Component	: new member component :DEF: null.
	  RETV: 		: Boolean	: True on success
	  INFO:	
		If member component is a Control;
		* It is refreshed.
		* Interactivity checked.
		* ... and this (owner) is size adjusted if auto sizing.
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		var t = this,
			c = component;

		if (!super.attach(c))
			return false;
		if (!is.control(c))
			return true;
		t._element.appendChild(c._element);
		c.refresh();
		c.checkEvents();
		if (t._autosize)
			t.adjustSize();
		return true;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	Detaches a member component from the control.
	  ARGS:	
		component 	: Component : member component to detach. :DEF: null.
	  RETV: Boolean	: True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null){
		var t = this,
			c = component;

		if (!super.detach(c))
			return false;
		if (!is.control(c))
			return true;
		if (c._element.parentNode === t._element)
			t._element.removeChild(c._element);	
		c.checkEvents();
		if (t._autosize)
			t.adjustSize();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidate
	  TASK: Invalidates current render status of control. 
	——————————————————————————————————————————————————————————————————————————*/
	invalidate() {
		if (this._invalid)
			return;
		this._invalid = true;
		display.addRenderQueue(this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: render
	  TASK: This draws the control. Called by display before new frame.
	——————————————————————————————————————————————————————————————————————————*/
	render() {
		var t = this,
			i,
			cls,
			stn,
			ext,
			sfx,
			cnm,
			sha = t.shade;
			
		t._shade = {};
		if (!t._ctlState)
			return;
		if (t._changeClass){
			t._changeClass = false;	
			cls = t.class.name;
			sfx = ctl.SUFFIX[t._ctlState];
			stn = t._styleName;
			ext = t._styleExtra;
			cnm = cls + ' ' + cls + sfx;
			if (stn)
				cnm += ' ' + stn + ' ' + stn + sfx;
			if (ext) 
				cnm += ' ' + cls + ext + ' ' + cls + ext + sfx; 
			if (stn && ext)
				cnm += ' ' + stn + ext + ' ' + stn + ext + sfx;
			t._element.className = cnm;
		}
		for(i in sha)
			sty[i] = sha[i];
		if (t._autosize)
			t.adjustSize();
		t.reAlign();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  SUBSYS: Interactivity	

	  This is a sub system for adding and removing event listeners and
	  executing other code required when shifting to respective control states.

	  * Only focusable Controls are allowed to attach interactivity events.
	  * Containers check interactivity of sub controls for focus management.
	———————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: checkEvents
	  TASK: Checks state of control & then decides to make control interactive.
	——————————————————————————————————————————————————————————————————————————*/
	checkEvents() {
	var t = this,
		b;
	
		if (!t._sta)						// if dead...
			return;
		b =(t._visible && t._ctlState && t._ctlState !== ctl.SLEEP && t._canFocus);
		t._element.style.pointerEvents = (b) ? 'auto': 'none';
		if(b == t._interact)				// if no change in interactivity
			return;
		t._interact = b;
		t.invalidateContainerTabs();		// container tab order is invalid
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doClick
	  TASK: Flags the control that mouse is clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doClick(x, y) {
		var e = this._eve.onClick;						// fetch event to relay
		
		if (this._ctlState != ctl.FOCUS)
			return null;
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doDoubleClick
	  TASK: Flags the control that mouse is double clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doDoubleClick(x, y) {
		var e = this._eve.onDoubleClick;				// fetch event to relay
		
		if (this._ctlState != ctl.FOCUS)
			return null;
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMouseDown
	  TASK:	Flags the control that it has mouse pressed over.
	——————————————————————————————————————————————————————————————————————————*/
	doMouseDown(x, y) {
		var e = this._eve.onMouseDown;					// fetch  event to relay
		
		this.setFocus();								// Draws the control too
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMouseUp
	  TASK: Flags the control that it has mouse released over.
	——————————————————————————————————————————————————————————————————————————*/
	doMouseUp(x, y) {
	var e = this._eve.onMouseUp;						// fetch event to relay
		
		this.invalidate();
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMouseMove
	  TASK: Flags the control that it has mouse moving over.
	——————————————————————————————————————————————————————————————————————————*/
	doMouseMove(x, y) {
	var e = this._eve.onMouseMove;	
		
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMouseOver
	  TASK: Flags the control that it has mouse over.
	——————————————————————————————————————————————————————————————————————————*/
	doMouseOver(x, y) {
	var e = this._eve.onMouseOver;						// fetch event to relay
	
		this._mouseOvr = true;							// flag mouse over
		if(this._ctlState < ctl.FOCUS)					// if state is ALIVE 
			this.controlState = ctl.HOVER;				// set it to HOVER
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMouseOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doMouseOut() {
	var e = this._eve.onMouseOut;					// fetch event to relay
	
		this._mouseOvr = false;						// not any more.
		if(this._ctlState < ctl.FOCUS)
			this.controlState = ctl.ALIVE;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusIn
	  TASK: Flags the control that it enters focus.  
	——————————————————————————————————————————————————————————————————————————*/
	doFocusIn() {
		var e = this._eve.onFocusIn;				// fetch event
	
		this.controlState = ctl.FOCUS;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusOut
	  TASK: Flags the control that it leaves focus.
	——————————————————————————————————————————————————————————————————————————*/
	doFocusOut() {
		var e = this._eve.onFocusOut;				// fetch event
	
		if (this._ctlState == ctl.SLEEP)
			return null;""
		if (this._ctlState == ctl.FOCUS)
			this.controlState = (this._mouseOvr ? ctl.HOVER : ctl.ALIVE);
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidateContainerTabs
	  TASK: Finds container of control and forces recalculation of tab sequence.
	——————————————————————————————————————————————————————————————————————————*/
	invalidateContainerTabs(){
		var c = this.fetchContainer();
		if (c)
			c.invalidateTabsCache();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: setFocus
	  TASK: Sets focus to control.
	——————————————————————————————————————————————————————————————————————————*/
	setFocus() {
		var d = this.display;
		if (d)
			display.currentControl = this;
	}

	/*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Size control
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberResize
	  TASK: Flags the control that its member is resized or repositioned.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberResize(member = null) {
	var e = this._eve.onMemberResize;						// fetch event
		
		if (this._autosize)
			this.adjustSize();
		return ((e) ? e.dispatch([this, member]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doOwnerResize
	  TASK: Flags the control that its owner is resized.
	  INFO: Anchors and alignments recalculated
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		var t = this,
			e = t._eve.onOwnerResize,
			o = t._own,
			dx = o._width - o._oldWidth,
			dy = o._height - o._oldHeight;
	
		if (dx && t.anchorRight){
			if (t.anchorLeft) 
				t.width += dx;
			else
				t.x += dx;
		}
		if (dy && t.anchorBottom){
			if (t.anchorTop)
				t.height += dy;
			else
				t.y += dy;
		}
		if (dx && t._alignX != 'none')
			t.calcAlignX();	
		if (dy && t._alignY != 'none')
			t.calcAlignY();
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: resizing 
	  TASK: 
	  	Adjusts alignments optionally.  
		notifies owner if resized and / or repositioned,
		notifies members if it is resized.
	  ARGS: align : Boolean : if true alignments will be refreshed.
	  INFO: align parameter blocks unnecessary call loop of the procedure 
			from alignX or alignY when set to false.
	—————————————————————————————————————————————————————————————————————————*/
	resizing(align) {
		var t = this,
			s;
		
		if (align)
			t.reAlign();
		if (is.control(t._own))
			t._own.doMemberResize(t);
		if (t._oldWidth == t._width && t._oldHeight == t._height)
			return;
		for(s in t._mem){
			if (is.control(t._mem[s]))
				t._mem[s].doOwnerResize();
		}
		t._oldWidth = t._width;
		t._oldHeight = t._height;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: reAlign
	  TASK: Coordinate reAlign.
	——————————————————————————————————————————————————————————————————————————*/
	reAlign(){
		if (this._alignX != 'none')
			this.calcAlignX();
		if (this._alignY != 'none')
			this.calcAlignY();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcAlignX
	  TASK: Calculates horizontal alignment. 
	——————————————————————————————————————————————————————————————————————————*/
	calcAlignX() {
		var t = this,
			i,
			w,
			x;
		
		if(!is.control(t._own))
			return;
		i = ctl.ALIGN_X.indexOf(t._alignX);
		if(i < 1)							// align = none
			return;
		w = t._own.width - t._own.dimensionsX().total;
		switch(i){
		case 1: x = 0; 						// left
				break;
		case 2: x = (w - t._width) / 2;		// center
				break;
		case 3: x = w - t._width;			// right
		}
		x = (x < 0)? 0 : x;
		if (x != t._x){
			t._x = x;
			t._shade.left = '' + t._x + 'px';
			t.resizing(false);
			t.invalidate();
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcAlignY
	  TASK: Calculates vertical alignment. 
	——————————————————————————————————————————————————————————————————————————*/
	calcAlignY() {
		var t = this,
			i,
			h,
			y;
		
		if(!is.control(t._own))
			return;
		i = ctl.ALIGN_Y.indexOf(t._alignY);
		if(i < 1)							// align = none
			return;
		d = t._own.dimensionsY();
		h = t._own.height - (d.total);
		switch(i) {
		case 1: y = 0;						// top
				break;
		case 2: y = (h - t._height) / 2;	// center
				break;
		case 3: y =  h - t._height;			// bottom
		}
		y = (y < 0)? 0 : y;
		if (y != t._y){
			t._y = y;
			t._shade.top = '' + t._y + 'px';
			t.resizing(false);
			t.invalidate();
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dimensionsX
	  TASK: Gets computed horisontal dimensions of the control
	——————————————————————————————————————————————————————————————————————————*/
	dimensionsX() {
		var s = window.getComputedStyle(this._element),
			r = {
				left: parseInt(s.paddingLeft, 10),
				right: parseInt(s.paddingRight, 10),
				borderLeft:	parseInt(s.borderLeftWidth, 10),
				borderRight: parseInt(s.borderRightWidth, 10) 
			};
		r.total = r.left + r.right + r.borderLeft + r.borderRight;
		return r;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dimensionsY
	  TASK: Gets computed vertical dimensions of the control
	——————————————————————————————————————————————————————————————————————————*/
	dimensionsY() {
		var s = window.getComputedStyle(this._element),
			r = {
				top: parseInt(s.paddingTop, 10),
				bottom: parseInt(s.paddingBottom, 10),	// padding	bottom
				borderTop: parseInt(s.borderTopWidth, 10),
				borderBottom: parseInt(s.borderBottomWidth, 10)
			};
		r.total = r.top + r.bottom + r.borderTop + r.borderBottom;
		return r;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: adjustSize
	  TASK: Changes the size of control according to content.
	——————————————————————————————————————————————————————————————————————————*/
	adjustSize() {
		var t = this,
			w,
			h,
			dx,
			dy;
		
		if (!t._autosize)
			return;
		dx = t.dimensionsX();
		dy = t.dimensionsY();
		w = dx.total + t._element.scrollWidth;
		h = dy.total + t._element.scrollHeight; 
		if (w != t._width)
			t.width = w;
		if (h != t._height)
			t.height = h;
	}

	/*——————————————————————————————————————————————————————————————————————————
		Control getter-setters
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	x   : int;
	  GET : Returns  control x coordinate.
	  SET : Sets the control x coordinate.
	  INFO: When alignX is not 'none' setting x coordinate is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get x() {
		return this._x;
	}

	set x(value = 0) {
		if (!is.num(value) || this._x == value || this._alignX != 'none')
			return;
		this._x = value;
		this._shade.left = '' + value +'px';
		this.resizing(false);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	y   : int;
	  GET : Returns  control y coordinate.
	  SET : Sets the control y coordinate.
	  INFO: When alignY is not 'none' setting y coordinate is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get y() {
		return(this._y);
	}

	set y(value = 0) {
		if (!is.num(value) || this._y == value || this._alignY != 'none')
			return;
		this._y = value;
		this._shade.top = '' + value +'px';
		this.resizing(false);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	width : int;
	  GET : Returns  control width.
	  SET : Sets the control width.
	——————————————————————————————————————————————————————————————————————————*/
	get width() {
		return this._width;
	}

	set width(value = 64) {
		if (!is.num(value) || this._width == value)
			return;
		this._width = value;
		this._shade.width = '' + value + 'px';
		this.resizing(true);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	height : int;
	  GET : Returns  control height.
	  SET : Sets the control height.
	——————————————————————————————————————————————————————————————————————————*/
	get height(){
		return this._height;
	}

	set height(value = 64){
		if (!is.num(value) || this._height == value)
			return;
		this._height = value; 
		this._shade.height = '' + value + 'px';
		this.resizing(true);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	zIndex : int;
	  GET : Returns  zIndex.
	  SET : Sets     zIndex.
	  INFO: zIndex determines the layering of controls, not z coordinate.
	——————————————————————————————————————————————————————————————————————————*/
	get zIndex() {
		return(this._zIndex);
	}

	set zIndex(value = 0){
		if (!is.num(value) || this._zIndex == value)
			return;	
		this._zIndex = value;
		this._shade.zIndex = '' + value;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	opacity : Number;
	  GET : Returns  control alpha.
	  SET : Sets the control alpha.
	  INFO: This effects control and all sub controls.
	——————————————————————————————————————————————————————————————————————————*/
	get opacity() {
		return(this._opacity);
	}

	set opacity(value = 1){
		if (!is.num(value) || value < 0 || value > 1 || this._opacity == value)
			return;
		this._opacity = value;
		this._shade.opacity = '' + value;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	tabIndex : Boolean ;
	  GET : Returns the tab index of the control.
	  SET : Sets    the tab index of the control.
	  INFO:
		*	A negative value like -1 makes control ignored as tab stop.
		*	Effective only if :
			Control is interactive,
			Control is in a Container descendant.
	——————————————————————————————————————————————————————————————————————————*/
	get tabIndex() {
		return(this._tabIndex);
	}

	set tabIndex(value = 0) {
		if (!is.num(value) || this._tabIndex == value)
			return;
		this._tabIndex = value;
		this.invalidateContainerTabs();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	alignX : String;
	  GET : Returns  control x alignment.
	  SET : Sets the control x alignment.
	  INFO:
		Alignment values are 'none', 'left', 'center', 'right'.
		If owner is cPanel descendant, margins are taken into account.
	——————————————————————————————————————————————————————————————————————————*/
	get alignX() {
		return(this._alignX);
	}

	set alignX(value = 'none') {
		value = (ctl.ALIGN_X.indexOf(value) < 0) ? 'none' : value;
		if (this._alignX == value)
			return;
		this._alignX = value;
		this.calcAlignX();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	alignY : String;
	  GET : Returns  control y alignment.
	  SET : Sets the control y alignment.
	  INFO:
		Alignment values are 'none', 'top', 'center', 'bottom'.
		If owner is cPanel descendant, margins are taken into account.
	——————————————————————————————————————————————————————————————————————————*/
	get alignY() {
		return(this._alignY);
	}

	set alignY(value = 'none') {
		value = (ctl.ALIGN_Y.indexOf(value) < 0) ? 'none' : value;
		if (this._alignY == value)
			return;
		this._alignY = value;
		this.calcAlignY();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleName : String;
	  GET : Returns  control style name if exists.
	  SET : Sets the control style name.
	  INFO: styleName is the name root for the style classes of control.
	——————————————————————————————————————————————————————————————————————————*/
	get styleName() {
		return this._styleName;
	}

	set styleName(value = null) {
		if (value != null || !is.str(value) || this._styleName == value)
			return;
		this._styleName = value;		// set style name
		this._changeClass = true;		// update element class names.
		this.invalidate();				// redraw control with new style
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleExtra : String;
	  GET : Returns  control style extra name if exists.
	  SET : Sets the control style extra name.
	  INFO: styleExtra is the extra name for the style classes of control.
	——————————————————————————————————————————————————————————————————————————*/
	get styleExtra() {
		return this._styleExtra;
	}

	set styleExtra(value = null) {
		if (value != null || !is.str(value) || this._styleExtra == value)
			return;
		this._styleExtra = value;		// set style extra name
		this._changeClass = true;		// update element class names.
		this.invalidate();				// redraw control with new style
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	controlState : int;
	  GET : Returns control state.
	  SET : Sets the control state and assigns the respective styles
			  to the control element class. 
	——————————————————————————————————————————————————————————————————————————*/
	get controlState() {
		if (this._sta == sys.SAVE)
			return((this._ctlState == ctl.SLEEP) ? ctl.SLEEP : ctl.ALIVE);
		return(this._ctlState);
	}
		
	set controlState(value = 0){
		if (!is.num(value) || value < ctl.DYING || value > ctl.SLEEP || value == this._ctlState)
			return
		this._ctlState = value;
		this._changeClass = true;		// update element class names.
		this.checkEvents();
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	visible : Boolean;
	  GET : Returns  control visibility setting.
	  SET : Sets the control visibility setting.
	  INFO: 
		When set to true: 
		If all controls in owner chain are visible showing will be true.
		If it is in clip rectangles of owner chain, then it is displaying.
		Otherwise control will stay invisible but the value will be true.
	——————————————————————————————————————————————————————————————————————————*/
	get visible() {
		return this._visible;
	}

	set visible(value = true) {
		var v = !!value;

		if (this._visible == v)
			return;
		this._visible = v;
		this.checkEvents();
		cascadeShowing(this, this.showing);
		this.resizing(v);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	showing : Boolean;
	  GET : Returns  control logical visibility state.
	  INFO: 
		When visible is set to true: 
		If all controls in owner chain are visible showing will be true.
	——————————————————————————————————————————————————————————————————————————*/
	get showing() {
		var c = this;
		while(c instanceof Control){
			if(!c._visible)					// if invisible
				return(false);
			if (c instanceof Display)		// if display
				return(true);
			c = c._own;
		}
		return false;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: displaying : Boolean	
	  GET : Returns true if control is actually on display.
	——————————————————————————————————————————————————————————————————————————*/
	get displaying() {
		
	}


	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	enabled : Boolean;
	  GET : Returns  control enabled state.
	  SET : Sets the control enabled state.
	——————————————————————————————————————————————————————————————————————————*/
	get enabled() {
		return this._ctlState != ctl.SLEEP;
	}

	set enabled(value = true) {
		var m;

		if (value == (this._ctlState != ctl.SLEEP))
			return;
		this.controlState = (value) ? Ctl.ALIVE : Ctl.SLEEP;
		for(m in this._mem){
			if (is.control(this._mem[m]))
				this._mem[m].enabled = value;
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autosize : Boolean;
	  GET : Returns the auto sizing status.
	  SET : Sets    the auto sizing status.
	  INFO: * When true the control tries to auto size to fit its contents.
	——————————————————————————————————————————————————————————————————————————*/
	get autosize() {
		return(this._autosize);
	}

	set autosize(value = true){
		var v = !!value;

		if (v == this._autosize)
			return;
		this._autosize = v;
		if (v)
			this.adjustSize();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	canFocus : Boolean ;
	  GET : Returns true if control is a focusable one.
	  SET : if true flags control as focusable.
	  INFO: Control should be on display, enabled and visible to be focusable.
	——————————————————————————————————————————————————————————————————————————*/
	get canFocus() {
		return(this._canFocus);
	}

	set canFocus(value){
		var v = (value == true);

		if (this._canFocus == v)
			return;
		this._canFocus = v;
		t.checkEvents();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: container
	  GET : Returns the container of the control or null.
	——————————————————————————————————————————————————————————————————————————*/
	get container() {
		var o = this._own; 
	
		while(is.control(o)){
			if (o instanceof Container)
				return(o);
			o = o._own;
		}
		return null;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	interactive: Boolean;
	  GET : Returns if control is currently interactive.
	——————————————————————————————————————————————————————————————————————————*/
	get interactive() {
		return this._interact;
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: makeElement [private].
  TASK: Builds a document object model element if not given, for control.
		then binds element and its style to control.
  ARGS:
	control 	: Control	: Control to bind to element.
	element		: Element	: Element to bind to control :DEF: null.
——————————————————————————————————————————————————————————————————————————*/
function makeElement(control, element = null) {
	var t = control;
	
	if (t._element)
		return;
	t._element = (!element) ? document.createElement(t.class.elementTag) : element;
	t._element.ToreJS_Control = t;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: killElement [private].
  TASK: Frees control from its document object model element.
  ARGS:
	control 	: Control	: Control to unbind.
——————————————————————————————————————————————————————————————————————————*/
function killElement(control) {
	var t = control,
		e = t._element;

	if (!e)
		return;
	if (is.asg(e.ToreJS_Control))
		delete(e.ToreJS_Control);	
	if (e.tagName !== 'BODY' && e.parentNode)
		e.parentNode.removeChild(e);
	t._element = null;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: cascadeShowing [private].
  TASK: Sets control and sub control style visibilities.
  ARGS:
	control 	: Control	: Control to set visibility.
	showing		: bool		: Visibility state.
——————————————————————————————————————————————————————————————————————————*/
function cascadeShowing(control, showing = false) {
	var t = control,
		m,
		c,
		v = (showing) ? 'visible': 'hidden';

	if (t._element.style.visibility != v) {
		t._shade.visibility = v;
		t.invalidate();
	}
	for(m in t._mem) {
		c = t._mem[m];
		if(!(c instanceof Control))
			continue;
		cascadeShowing(c, (showing) ? c._visible : false);		
	}
}

sys.registerClass(Control);