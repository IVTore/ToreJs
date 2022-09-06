/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Control.js: Tore Js base visual control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, is, core, Component } from "../lib/index.js";
import { ctl } from "../ctl/ctl.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: Control
  TASKS: Defines basic behaviours of Tore JS visual controls.
  NOTES:
	*	Parent - Child hierarchy is mapped to standard owner-member system.
	*	Control defines an interactivity scheme. 
	*	Control defines a style name scheme, look Styler.js.
————————————————————————————————————————————————————————————————————————————*/
export class Control extends Component {

	// Control dom tag. If null, element is not built in Control constructor.
	static elementTag = 'div';	
	// Control focusability default.
	static canFocusDefault = true;	

	// Initial values of control.
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
		styleExtra		: {value: null},
		styleColor		: {value: null},
		styleSize		: {value: null},	
		controlState	: {value: ctl.ALIVE},
		
		visible			: {value: true},
		enabled			: {value: true},
		autosize		: {value: false},
		canFocus		: {value: false},
		yieldFocus		: {value: false},
		
		// publish these normal variables
		anchorLeft		: {value: true, store: true},
		anchorTop		: {value: true, store: true},
		anchorRight		: {value: false, store: true},
		anchorBottom	: {value: false, store: true},
		dragEnabled		: {value: false, store: true},
		// Events
		onFocusIn		: {event: true},
		onFocusOut		: {event: true},
		onViewportResize: {event: true},
		onMemberResize	: {event: true},
		onOwnerResize	: {event: true},
		onLanguageChange: {event: true},
		onStartDrag		: {event: true},
		onDrag			: {event: true},
		onEndDrag		: {event: true},
		onHit			: {event: true},
		onDoubleHit		: {event: true},
		onPointerDown	: {event: true},
		onPointerUp		: {event: true},
		onPointerOut	: {event: true},
		onPointerOver	: {event: true},
		onPointerMove	: {event: true},
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
	_styleExtra = null;			// Extra style name. 
	_styleColor = null;			// Color style name.
	_styleSize = null;			// Size style name.
	_ctlState = 0;				// control state.
	_element = null;			// Dom element.
	_visible = true;			// Visibility setting.
	_enable = true;				// Enable flag.
	_autosize = false;			// Autosize flag.
	_canFocus = true;			// Control can focus or not.
	_interact = false;			// Interactibility state.
	_yieldFocus = false;		// If control can yield focus
								// to the other controls under it 
								// when it can not get focus.

	anchorLeft = true;			// Anchors.
	anchorTop = true;
	anchorRight = false;
	anchorBottom = false;
	dragEnabled = false;
	
	// Internal properties.
	
	_ptrOver = false;			// Pointer over.
	_oldWidth = 0;				// Previous width of control.
	_oldHeight = 0;				// Previous height of control.
	_vpResize = false;			// Viewport resizing.
	
	// styling.
	_shade = {};				// shadow style.
	_contentChanged = false;	// Content change flag.
	_classesChanged = true;		// Rewrite element class names.
	_styleRoot = null;			// Style root extension name.
	_sBase = null;				// Calculated element class names.
	_sSize = null;
	_sColor = null;
	_sExtra = null;

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
		this.canFocus = this.class.canFocusDefault;
		sys.propSet(this._shade, this.class.initialStyle);
		if (name == sys.LOAD)
			return;
		this._initControl(owner, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _initControl [protected].
	  TASK: Initializes control.
	  ARGS:
		owner 	: Control	: owner if any.
		data	: Object	: data if any.
	——————————————————————————————————————————————————————————————————————————*/
	_initControl(owner = null, data = null) {
		if (data)
			sys.propSet(this, data);
		if (owner)
			owner.attach(this);
		this.controlState = ctl.ALIVE;
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
		var	c = component;

		if (!super.attach(c))
			return false;
		if (!is.control(c))
			return true;
		this._element.appendChild(c._element);
		c.reAlign();
		c.checkEvents();
		if (this._autosize)
			this.adjustSize();
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
		if (!super.detach(component))
			return false;
		if (!is.control(component))
			return true;
		if (component._element.parentNode === this._element)
			this._element.removeChild(component._element);	
		component.checkEvents();
		if (this._autosize)
			this.adjustSize();
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
		core.display.addRenderQueue(this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: contentChanged.
	  TASK: Invalidates control flagging with content change. 
	——————————————————————————————————————————————————————————————————————————*/
	contentChanged() {
		if (this._autosize)
			this.adjustSize();
		if (this._contentChanged)
			return;
		this._contentChanged = true;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: classesChanged.
	  TASK: Invalidates control flagging with element classes change. 
	——————————————————————————————————————————————————————————————————————————*/
	classesChanged() {
		if (this._classesChanged)
			return;
		this._classesChanged = true;
		this.invalidate();
	}
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: render
	  TASK: This draws the control. Called by display before new frame.
	——————————————————————————————————————————————————————————————————————————*/
	render() {
		var i,
			g = this._shade,
			s = this._element.style,
			cla = this._classesChanged,
			con = this._contentChanged;
			
		this._invalid = false;
		this._classesChanged = false;
		this._contentChanged = false;
		this._shade = {};
		if (!this._ctlState)
			return;
		if (cla)
			this._element.className = this._sBase + this._sSize + this._sColor + this._sExtra;
		for(i in g)
			s[i] = g[i];
		if (con)
			this.renderContent();
		if (this._autosize)
			this.adjustSize();
		this.reAlign();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the control content. Called by render before new frame.
	  INFO: This is a placeholder method to override.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() { }

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
		var b;
	
		if (!this._sta)						// if dead...
			return;
		b =(this._visible && 
			this._ctlState && 
			this._ctlState !== ctl.SLEEP &&
			this._canFocus);
		this._element.style.pointerEvents = (b) ? 'auto': 'none';
		if (b == this._interact)			// if no change in interactivity
			return;
		this._interact = b;
		if (this._tabIndex)
			this.invalidateContainerTabs();	// container tab order is invalid
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doHit
	  TASK: Flags the control that mouse is clicking or touch tapping on it.
	——————————————————————————————————————————————————————————————————————————*/
	doHit(x, y, e) {
		var eve = this._eve.onHit;
		
		if (this._ctlState != ctl.FOCUS)
			return null;
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doDoubleClick
	  TASK: Flags the control that mouse is double clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doDoubleHit(x, y, e) {
		var eve = this._eve.onDoubleHit;
		
		if (this._ctlState != ctl.FOCUS)
			return null;
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerDown
	  TASK:	Flags the control that it has mouse pressed over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerDown(x, y, e) {
		var eve = this._eve.onPointerDown;
		
		this.setFocus();
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerUp
	  TASK: Flags the control that it has mouse released over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerUp(x, y, e) {
		var eve = this._eve.onPointerUp;
		
		this.invalidate();
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerMove
	  TASK: Flags the control that it has mouse moving over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerMove(x, y) {
		var eve = this._eve.onPointerMove;	
		
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOver
	  TASK: Flags the control that it has mouse over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOver(x, y) {
	var e = this._eve.onPointerOver;					// fetch event to relay
	
		this._mouseOvr = true;							// flag mouse over
		if (this._ctlState === ctl.ALIVE)				// if state is ALIVE 
			this.controlState = ctl.HOVER;				// set it to HOVER
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOut() {
	var e = this._eve.onPointerOut;					// fetch event to relay
	
		this._mouseOvr = false;						// not any more.
		if (this._ctlState === ctl.HOVER)
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
			return null;
		if (this._ctlState == ctl.FOCUS)
			this.controlState = (this._ptrOver ? ctl.HOVER : ctl.ALIVE);
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidateContainerTabs
	  TASK: Finds container of control and forces recalculation of tab sequence.
	——————————————————————————————————————————————————————————————————————————*/
	invalidateContainerTabs(){
		var c = this.container;
		if (c)
			c.invalidateContainerTabs();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: setFocus
	  TASK: Sets focus to control.
	——————————————————————————————————————————————————————————————————————————*/
	setFocus() {
		core.display.currentControl = this;
	}

	/*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Size control
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize
	  TASK: Flags the control that viewport is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		var s,
			e = this._eve.onViewportResize;
		this._vpResize = true;
		for(s in this._mem){
			if (is.control(this._mem[s]))
				this._mem[s].doViewportResize();
		}
		this._vpResize = false;
		if (this._autosize)
			this.adjustSize();
		return ((e) ? e.dispatch([this, member]) : null);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberResize
	  TASK: Flags the control that its member is resized or repositioned.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberResize(member = null) {
	var e;

		if (this._vpResize)
			return;
		if (this._autosize)
			this.adjustSize();
		e = this._eve.onMemberResize;
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
		var	s;
		
		if (align)
			this.reAlign();
		if (is.control(this._own))
			this._own.doMemberResize(this);
		if (this._oldWidth == this._width && this._oldHeight == this._height)
			return;
		for(s in this._mem){
			if (is.control(this._mem[s]))
				this._mem[s].doOwnerResize();
		}
		this._oldWidth = this._width;
		this._oldHeight = this._height;
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
		var i,
			w,
			x;
		
		if(!is.control(this._own))
			return;
		i = ctl.ALIGN_X.indexOf(this._alignX);
		if(i < 1)							// align = none
			return;
		w = this._own.width - this._own.dimensionsX().total;
		switch(i){
		case 1: x = 0; 							// left
				break;
		case 2: x = (w - this._width) / 2;		// center
				break;
		case 3: x = w - this._width;			// right
		}
		x = (x < 0)? 0 : x;
		if (x != this._x){
			this._x = x;
			this._shade.left = '' + this._x + 'px';
			this.resizing(false);
			this.invalidate();
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcAlignY
	  TASK: Calculates vertical alignment. 
	——————————————————————————————————————————————————————————————————————————*/
	calcAlignY() {
		var i,
			h,
			y;
		
		if(!is.control(this._own))
			return;
		i = ctl.ALIGN_Y.indexOf(this._alignY);
		if(i < 1)							// align = none
			return;
		h = this._own.height - (this._own.dimensionsY().total);
		switch(i) {
		case 1: y = 0;						// top
				break;
		case 2: y = (h - this._height) / 2;	// center
				break;
		case 3: y =  h - this._height;		// bottom
		}
		y = (y < 0)? 0 : y;
		if (y != this._y){
			this._y = y;
			this._shade.top = '' + this._y + 'px';
			this.resizing(false);
			this.invalidate();
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dimensionsX
	  TASK: Gets computed horisontal dimensions of the control
	——————————————————————————————————————————————————————————————————————————*/
	dimensionsX() {
		var s = window.getComputedStyle(this._element),
			r = {
				pLeft: parseInt(s.paddingLeft, 10),
				pRight: parseInt(s.paddingRight, 10),
				bLeft:	parseInt(s.borderLeftWidth, 10),
				bRight: parseInt(s.borderRightWidth, 10) 
			};
		r.total = r.pLeft + r.pRight + r.bLeft + r.bRight;
		return r;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dimensionsY
	  TASK: Gets computed vertical dimensions of the control
	——————————————————————————————————————————————————————————————————————————*/
	dimensionsY() {
		var s = window.getComputedStyle(this._element),
			r = {
				pTop: parseInt(s.paddingTop, 10),
				pBottom: parseInt(s.paddingBottom, 10),	// padding	bottom
				bTop: parseInt(s.borderTopWidth, 10),
				bBottom: parseInt(s.borderBottomWidth, 10)
			};
		r.total = r.pTop + r.pBottom + r.bTop + r.bBottom;
		return r;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: adjustSize
	  TASK: Changes the size of control according to content.
	  INFO: +1's are for potential losses of subpixel accuracies.
	——————————————————————————————————————————————————————————————————————————*/
	adjustSize() {
		var st, sc,
			cw, ch,
			sw, sh;
		
		if (!this._autosize)
			return;
		sc = window.getComputedStyle(this._element);
		st = this._element.style;
		sw = sc.width;
		sh = sc.height;
		st.width = "auto";
		st.height = "auto";
		cw = this._element.scrollWidth + 1 + 
			 parseInt(sc.borderLeftWidth, 10) + 
			 parseInt(sc.borderRightWidth, 10);
		ch = this._element.scrollHeight + 1 + 
			 parseInt(sc.borderTopWidth, 10) +
			 parseInt(sc.borderBottomWidth, 10); 
		if (cw != this._width)
			this.width = cw;
		else 
			st.width = sw;
		if (ch != this._height)
			this.height = ch;
		else
			st.height = sh;
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
	  PROP:	styleExtra : String;
	  GET : Returns  control extra style name if exists.
	  SET : Sets the control extra style name.
	——————————————————————————————————————————————————————————————————————————*/
	get styleExtra() {
		return this._styleExtra;
	}

	set styleExtra(v = null) {
		if ((!is.str(v) && v !== null) || this._styleExtra == v)
			return;
		this._styleExtra = v;
		this._sExtra = calcClassNameSub(this, this._styleExtra);
		this.classesChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleColor : String;
	  GET : Returns  control color style name if exists.
	  SET : Sets the control color style name.
	——————————————————————————————————————————————————————————————————————————*/
	get styleColor() {
		return this._styleColor;
	}

	set styleColor(v) {
		if ((v !== null && !is.str(v)) || this._styleColor == v)
			return;
		if (v && !ctl.COLORS[v])
			return;
		this._styleColor = v;
		this._sColor = calcClassNameSub(this, this._styleColor);
		this.classesChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleSize : String;
	  GET : Returns  control size style name if exists.
	  SET : Sets the control color style name.
	——————————————————————————————————————————————————————————————————————————*/
	get styleSize() {
		return this._styleSize;
	}

	set styleSize(v = null) {
		if ((!is.str(v) && v !== null) || this._styleSize == v)
			return;
		if (v && !ctl.SIZES[v])
			return;
		this._styleSize = v;		// set style size name
		this._sSize = calcClassNameSub(this, this._styleSize);
		this.classesChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcAllClassNames.
	  TASK: Calculates all control element class names.
	  INFO: Invalidates the control.
	——————————————————————————————————————————————————————————————————————————*/
	calcAllClassNames() {
		var c = this.class.name + ((this._styleRoot !== null) ? this._styleRoot : ''),
			s = ctl.SUFFIX[this._ctlState];
		
		function calcSub(n){
			return (is.str(n))? ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s : '';
		}

		this._sBase = c + ' ' + c + s;
		this._sSize = calcSub(this._styleSize);
		this._sColor = calcSub(this._styleColor);
		this._sExtra = calcSub(this._styleExtra);
		this.classesChanged();
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
		if (!is.num(value) || 
			value < ctl.DYING ||
			value > ctl.SLEEP || 
			value == this._ctlState)
			return;
		this._ctlState = value;
		this.calcAllClassNames();
		this.checkEvents();
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
			if (c === core.display)				// if display
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

		value = !!value;
		if (value == (this._ctlState != ctl.SLEEP))
			return;
		this.controlState = (value) ? ctl.ALIVE : ctl.SLEEP;
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
		var v = !!value;

		if (this._canFocus == v)
			return;
		this._canFocus = v;
		this.checkEvents();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	yieldFocus : Boolean ;
	  GET : Returns true if control can yield focus.
	  SET : if true flags that control can yield focus.
	  INFO:
		This is valid only when control canFocus = false.
		Determines if control can yield focus to the other controls under it 
		when it can not get focus.
	——————————————————————————————————————————————————————————————————————————*/
	get yieldFocus() {
		return(this._yieldFocus);
	}

	set yieldFocus(value){
		this._yieldFocus = !!value;
	}
	/*——————————————————————————————————————————————————————————————————————————
	  PROP: container
	  GET : Returns the container of the control or null.
	——————————————————————————————————————————————————————————————————————————*/
	get container() {
		var o = this._own; 
	
		while(is.control(o)){
			if (is.container(o))
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
  TASK: Builds and binds a document object model element to control.
  ARGS:
	control 	: Control	: Control to bind to element.
——————————————————————————————————————————————————————————————————————————*/
function makeElement(control) {
	var t = control,
		e = t.class.elementTag;

	if (e == null || t._element)
		return;
	t._element = document.createElement(e);
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
	if (e !== document.body){ 
		if (e.parentNode)
			e.parentNode.removeChild(e);
	}
	t._element = null;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: cascadeShowing [private].
  TASK: Sets control and sub control style visibilities.
  ARGS:
	t 			: Control	: Control to set visibility.
	showing		: bool		: Visibility state.
——————————————————————————————————————————————————————————————————————————*/
function cascadeShowing(t, showing = false) {
	var m,
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

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcClassNameSub [private].
  TASK: Calculates control element class name.
  ARGS: 
  	t : Control : (this) ;)
	n : String  : Style class name or null.
  RETV:
	  : String  : Something wicked.
——————————————————————————————————————————————————————————————————————————*/
function calcClassNameSub(t, n){
	var c = t.class.name+ ((t._styleRoot !== null) ? t._styleRoot : ''),
		s = ctl.SUFFIX[t._ctlState];

	return (is.str(n))? ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s : '';
}
