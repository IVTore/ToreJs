/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Control.js: Tore Js base visual control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, is, core, Component, exc } from "../lib/index.js";
import { ctl } from "../ctl/ctl.js";
import { styler } from "../ctl/Styler.js";

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
		autoX			: {value: null},
		autoY			: {value: null},
		autoWidth		: {value: null},
		autoHeight		: {value: null},
		alignX			: {value: 'none'},
		alignY			: {value: 'none'},
		anchorLeft		: {value: true, store: true},
		anchorTop		: {value: true, store: true},
		anchorRight		: {value: false, store: true},
		anchorBottom	: {value: false, store: true},

		zIndex			: {value: 0},
		opacity			: {value: 1},
		tabIndex		: {value: 0},
		styleExtra		: {value: null},
		styleColor		: {value: null},
		styleSize		: {value: null},	
		controlState	: {value: ctl.ALIVE},
		visible			: {value: true},
		canFocus		: {value: false},
		yieldFocus		: {value: false},
		
		dragEnabled		: {value: false, store: true},
		dropEnabled		: {value: false, store: true},

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
	_autoX = null;				// Automatic X.
	_autoY = null;				// Automatic Y.
	_autoWidth = null;			// Automatic Width.
	_autoHeight = null;			// Automatic Height.
	_alignX = 'none';			// X axis alignment.
	_alignY = 'none';			// Y axis alignment.
	anchorLeft = true;			// Anchors.
	anchorTop = true;
	anchorRight = false;
	anchorBottom = false;
	
	_zIndex = 0;				// Z index.
	_opacity = 1;				// Opacity (alpha).
	_tabIndex = 0;				// Tab index.
	
	_styleExtra = null;			// Extra style name. 
	_styleColor = null;			// Color style name.
	_styleSize = null;			// Size style name.

	_ctlState = 0;				// control state.
	_element = null;			// Dom element.
	_visible = true;			// Visibility setting.
	_canFocus = true;			// Control can focus or not.
	_interact = false;			// Interactibility state.
	_yieldFocus = false;		// If control can yield focus
								// to the other controls under it 
								// when it can not get focus.
	dragEnabled = false;		// If true control is draggable.
	dropEnabled = false;		// If true control is a dropzone.
	
	// Internal properties.
	
	_ptrOver = false;			// Pointer over.
	_oldX = 0;					// Previous x of control.
	_oldY = 0;					// Previous y of control.
	_oldWidth = 0;				// Previous width of control.
	_oldHeight = 0;				// Previous height of control.
	_vpResize = false;			// Viewport resizing flag.
	_invalid = false;			// If true rendering is required.
	_blockValidate = false;		// If true block invalidation and therefore render.
	
	// styling.
	_shade = {};				// shadow style.
	_computed = null;			// Computed style.
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
		this._computed = getComputedStyle(this._element);
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
		this.controlState = ctl.ALIVE;
		this._blockValidate = true;
		if (owner)
			owner.attach(this);
		if (data)
			sys.propSet(this, data);
		this._blockValidate = false;
		if (!this.autoAdjust())
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
		this.autoAdjust();
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
		this.autoAdjust();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidate
	  TASK: Invalidates current render status of control. 
	——————————————————————————————————————————————————————————————————————————*/
	invalidate() {
		if (this._invalid || this._blockValidate)
			return;
		this._invalid = true;
		core.display.addRenderQueue(this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: contentChanged.
	  TASK: Invalidates control flagging with content change. 
	——————————————————————————————————————————————————————————————————————————*/
	contentChanged() {
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
		this.autoAdjust();
		this.reAlign();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the control content. Called by render before new frame.
	  INFO: This is a placeholder method to override.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() { }


	/*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Dimension management.
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
		if (this._blockValidate)
			return;
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
		if (this._blockValidate)
			return;
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
		if (this._blockValidate)
			return;
		this.resizing(true);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	height : int;
	  GET : Returns  control height.
	  SET : Sets the control height.
	——————————————————————————————————————————————————————————————————————————*/
	get height() {
		return this._height;
	}

	set height(value = 64) {
		if (!is.num(value) || this._height == value)
			return;
		this._height = value; 
		this._shade.height = '' + value + 'px';
		if (this._blockValidate)
			return;
		this.resizing(true);
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoX : *.
	  GET : Returns the autoX value.
	  SET : Sets    the autoX value.
	  INFO: 
		autoX can be:
		* null.
			x will not be automatic.
		* Viewport values object.
			The value will be extracted from object and processed.
		* A string: Will be treated as a CSS property.
		* A number between 0 and 1 (exclusive) i.e: 0.5 .
			x will be set to owner innerWidth * autoX.
		* A number with value <= 0 or value >= 1, x = value.
	——————————————————————————————————————————————————————————————————————————*/
	get autoX() {
		return(this._autoX);
	}

	set autoX(value = null){
		var typ;

		if (value == this._autoX)
			return;
		if (value == null) {
			this._autoX = null;
			return;
		}
		typ = typeof value;
		if (typ != "number" && typ != "string" && value.constructor != Object) 
			return;
		this._autoX = value;
		if (this._own instanceof Control)
			calcAutoX(this, this._own.innerWidth);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoY : *.
	  GET : Returns the autoY value.
	  SET : Sets    the autoY value.
	  INFO: 
		autoY can be:
		* null.
			y will not be automatic.
		* Viewport values object.
			The value will be extracted from object and processed.
		* A string: Will be treated as a CSS property.
		* A number between 0 and 1 (exclusive) i.e: 0.2 .
			y will be set to owner innerWidth * autoX.
		* A number with value <= 0 or value >= 1, y = value.
	——————————————————————————————————————————————————————————————————————————*/
	get autoY() {
		return(this._autoY);
	}

	set autoY(value = null){
		var typ;

		if (value == this._autoY)
			return;
		if (value == null) {
			this._autoY = null;
			return;
		}
		typ = typeof value;
		if (typ != "number" && typ != "string" && value.constructor != Object) 
			return;
		this._autoY = value;
		if (this._own instanceof Control)
			calcAutoY(this, this._own.innerHeight);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoWidth : *.
	  GET : Returns the autoWidth value.
	  SET : Sets    the autoWidth value.
	  INFO: 
		autoWidth can be:
		* null.
			width will not be automatic.
		* Viewport values object.
			The value will be extracted from object and processed.
		* A string: Will be treated as a CSS property.
		* A number between (0 and 1] (0 excluded, 1 included) i.e: 0.5 .
			width will be set to owner inner width * autoWidth.
		* A number with value = 0 or value >= 1, width = value.
	——————————————————————————————————————————————————————————————————————————*/
	get autoWidth() {
		return(this._autoWidth);
	}

	set autoWidth(value = null){
		var typ;

		if (value === this._autoWidth)
			return;
		if (value === null) {
			this._autoWidth = null;
			return;
		}
		typ = typeof value;
		if (typ !== "number" && typ !== "string" && value.constructor !== Object) 
			return;
		this._autoWidth = value;
		if (this._own instanceof Control)
			calcAutoWidth(this, this._own.innerWidth);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoHeight : *.
	  GET : Returns the autoHeight value.
	  SET : Sets    the autoHeight value.
	  INFO: 
		autoHeight can be:
		* null.
			height will not be automatic.
		* Viewport values object.
			The value will be extracted from object and processed.
		* A string: Will be treated as a CSS property.
		* A number between (0 and 1] (0 excluded, 1 included) i.e: 0.5 .
			height will be set to owner inner height * autoHeight.
		* A number with value = 0 or value >= 1, height = value.
	——————————————————————————————————————————————————————————————————————————*/
	get autoHeight() {
		return(this._autoHeight);
	}

	set autoHeight(value = null){
		var typ;

		if (value === this._autoHeight)
			return;
		if (value === null) {
			this._autoHeight = null;
			return;
		}
		typ = typeof value;
		if (typ !== "number" && typ !== "string" && value.constructor !== Object) 
			return;
		this._autoHeight = value;
		if (this._own instanceof Control)
			calcAutoHeight(this, this._own.innerHeight);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	alignX : String;
	  GET : Returns  control x alignment.
	  SET : Sets the control x alignment.
	  INFO:
		Alignment values are 'none', 'center', 'right'.
		If set to 'center' or 'right' autoX becomes null.
		For left alignment, just set x to 0.
	——————————————————————————————————————————————————————————————————————————*/
	get alignX() {
		return(this._alignX);
	}

	set alignX(value = 'none') {
		value = (ctl.ALIGN_X[value]) ? value : 'none';
		if (this._alignX === value)
			return;
		this._alignX = value;
		if (value === 'none')
			return;
		this._autoX = null;
		if (this._own instanceof Control)
			calcAlignX(t, this._own.innerWidth);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	alignY : String;
	  GET : Returns  control y alignment.
	  SET : Sets the control y alignment.
	  INFO:
		Alignment values are 'none', 'center', 'bottom'.
		If set to 'center' or 'bottom' autoY becomes null.
		For top alignment, just set y to 0.
	——————————————————————————————————————————————————————————————————————————*/
	get alignY() {
		return(this._alignY);
	}

	set alignY(value = 'none') {
		value = (ctl.ALIGN_Y[value]) ? value : 'none';
		if (this._alignY === value)
			return;
		this._alignY = value;
		if (value === 'none')
			return;
		this._autoY = null;
		if (this._own instanceof Control)
			calcAlignY(t, this._own.innerHeight);
	}
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dimensions
	  TASK: Computes dimension values of the control all at once.
	——————————————————————————————————————————————————————————————————————————*/
	dimensions() {
		var s,
			pw,
			ph,
			tw,
			th;

		s = this._computed;
		pw = parseFloat(s.paddingLeft || '0') + parseFloat(s.paddingRight || '0');
		tw = parseFloat(s.borderLeftWidth || '0') +  parseFloat(s.borderRightWidth || '0') + pw;
		ph = parseFloat(s.paddingTop || '0') + parseFloat(s.paddingBottom || '0');
		th = parseFloat(s.borderTopWidth || '0') + parseFloat(s.borderBottomWidth || '0') + ph;
		return {
			shellW: tw,
			innerW: this._width - tw,
			rangeW: this._element.scrollWidth - pw,
			shellH: th,
			innerH: this._height - th,
			rangeH: this._element.scrollHeight - ph
		}
	}

	


	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerWidth
	  GET : Gets the computed control visible content width.
	——————————————————————————————————————————————————————————————————————————*/
	get innerWidth(){
		var s = this._computed;
		return this._width - (
			parseFloat(s.paddingLeft || '0') + parseFloat(s.paddingRight || '0') +
			parseFloat(s.borderLeftWidth || '0') + parseFloat(s.borderRightWidth || '0') 
		);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerHeight
	  GET : Gets the computed control visible content height.
	——————————————————————————————————————————————————————————————————————————*/
	get innerHeight(){
		var s = this._computed;
		return this._height - (
			parseFloat(s.paddingTop || '0') + parseFloat(s.paddingBottom || '0') +
			parseFloat(s.borderTopWidth || '0') + parseFloat(s.borderBottomWidth || '0')
		);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: contentWidth
	  GET : Gets the control content width.
	——————————————————————————————————————————————————————————————————————————*/
	get contentWidth(){
		var s = this._computed;
		return this._element.scrollWidth - (
			parseFloat(s.paddingLeft || '0') +
			parseFloat(s.paddingRight || '0')
		);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: contentHeight
	  GET : Gets the control content height.
	——————————————————————————————————————————————————————————————————————————*/
	get contentHeight(){
		var s = this._computed;
		return this._element.scrollHeight - (
			parseFloat(s.paddingTop || '0') +
			parseFloat(s.paddingBottom || '0')
		);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: autoAdjust
	  TASK: Changes the size and position of control according to properties.
	  RETV: 	: Boolean : true if adjust done, false if not required.
	——————————————————————————————————————————————————————————————————————————*/
	autoAdjust() {
		var t = this,
			ow = t._own,
			dx,
			dy,
			od;
		
		if (!(ow instanceof Control))
			return false,
		dx = ow._width - ow._oldWidth;
		dy = ow._height - ow._oldHeight;
		if 	(!(	t._autoWidth || 
				t._autoHeight || 
				t._autoX || 
				t._autoY ||
				(dx && t.anchorRight) || 
				(dy && t.anchorBottom) ||
				(dx && t._alignX == "none") || 
				(dy && t._alignY == "none")))
			return false;
		od = t._own.dimensions();
		t._blockValidate = true;
		if (t._autoWidth) 
			calcAutoWidth(t, od.innerW);
		if (t._autoHeight) 
			calcAutoHeight(t, od.innerH);
		if (t.autoX)
			calcAutoX(t, od.innerW);
		if (t.autoY)
			calcAutoY(t, od.innerH);
		if (dx && t.anchorRight) {
			if (t.anchorLeft) 
				t.width += dx;
			else
				t.x += dx;
		}
		if (dy && t.anchorBottom) {
			if (t.anchorTop)
				t.height += dy;
			else
				t.y += dy;
		}
		if (dx && t._alignX != 'none')
			calcAlignX(t, od.innerW);
		if (dx && t._alignY != 'none')
			calcAlignY(t, od.innerH);
		t._blockValidate = false;
		t.invalidate();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize
	  TASK: Flags the control that viewport is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		var s,
			e = this._eve.onViewportResize;
		this._vpResize = true;
		this.autoAdjust();
		for(s in this._mem){
			if (is.control(this._mem[s]))
				this._mem[s].doViewportResize();
		}
		this._vpResize = false;
		return ((e) ? e.dispatch([this]) : null);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberResize
	  TASK: Flags the control that its member is resized or repositioned.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberResize(member = null) {
	var e;

		if (this._vpResize)
			return;
		this.autoAdjust();
		e = this._eve.onMemberResize;
		return ((e) ? e.dispatch([this, member]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doOwnerResize
	  TASK: Flags the control that its owner is resized.
	  INFO: Dimensions recalculated.
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		var e = this._eve.onOwnerResize;

		this.autoAdjust();
		return ((e) ? e.dispatch([this]) : null);
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

/*——————————————————————————————————————————————————————————————————————————
  SUBSYS: Dimension. Private functions.
——————————————————————————————————————————————————————————————————————————*/

/*——————————————————————————————————————————————————————————————————————————
  FUNC: getViewportValue [private].
  TASK: 
  	Gets a property value corresponding to current viewport from a 
	viewport values object.
  ARGS:
	t	: Control	: Control to set visibility.
	v	: Object	: Viewport Values object.
	name: String	: Property name for exception message.
  RETV: : * 		: Extracted string or number.
——————————————————————————————————————————————————————————————————————————*/
function getViewportValue (t, v, name) {
	var n = styler.viewportName;

	v = (v[n]) ? v[n] : v.df;
	if (!v)
		exc('E_CTL_VP_VAL', t.namePath+'.'+name + ':{'+ n +': ?, df: ?}');
	return v;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoX [private].
  TASK: Calculates control x.
  ARGS: 
  	t 				: Control : (this).
	ownerInnerWidth : number  : Inner width of owner.
  INFO: 
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoX(t, ownerInnerWidth){
	var val = t._autoX,
		typ;

	if (val.constructor === Object)
		val = getViewportValue(t, val, "autoX");
	if (val === null)
		return;
	typ = typeof val;
	if (typ === "number") {
		t.x = (val <= 0 || val >= 1) ? val : ownerInnerWidth * val;
		return;
	}
	if (typ === "string") {
		t._element.style.y = y;
		t.y = parseFloat(t._computed.x || 0);
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoY [private].
  TASK: Calculates control y.
  ARGS: 
	t					: Control : (this).
	ownerInnerHeight	: number  : Inner height of owner.
  INFO: 
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoY(t, ownerInnerHeight){
	var val = t._autoY,
		typ;

	if (val.constructor === Object)
		val = getViewportValue(t, val, "autoY");
	if (val === null)
		return;
	typ = typeof val;
	if (typ === "number") {
		t.y = (val <= 0 || val >= 1) ? val : ownerInnerHeight * val;
		return;
	}
	if (typ === "string") {
		t._element.style.y = val;
		t.y = parseFloat(t._computed.y || 0);
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoWidth [private].
  TASK: Calculates control width.
  ARGS: 
  	t 				: Control : (this).
	ownerInnerWidth	: number  : inner width of owner.
  INFO: 
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoWidth(t, ownerInnerWidth) {
	var val = t._autoWidth,
		typ; 

	if (val.constructor === Object) 
		val = getViewportValue(t, val, "autoWidth");
	if (val === null)
		return;
	typ = typeof val;
	if (typ === "number") {
		t.width = (val > 1) ? val : val * ownerInnerWidth;
		return;
	}
	if (typ === "string") {
		t._element.style.width = val;
		t.width = parseFloat(t._computed.width || 0);
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoHeight [private].
  TASK: Calculates control height.
  ARGS: 
	t					: Control : (this).
	ownerInnerHeight	: number  : Inner height of owner.
  INFO: 
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoHeight(t, ownerInnerHeight){
	var val = t._autoHeight,
		typ;

	if (val.constructor === Object) 
		val = getViewportValue(t, val, "autoHeight");
	if (val === null)
		return;
	typ = typeof val;
	if (typ === "number") {
		t.height = (val > 1) ? val : val * ownerInnerHeight;
		return;
	}
	if (typ === "string") {
		t._element.style.height = w;
		t.height = parseFloat(t._computed.height || 0);
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAlignX [private].
  TASK: Calculates horizontal alignment.
  ARGS: 
  	t 				: Control : (this).
	ownerInnerWidth	: number  : inner width of owner.
  INFO: 
  	Values can be "center" or "right". Left is unnecessary, just set x = 0.
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAlignX(t = null, ownerInnerWidth) {
	var i,
		x;

	i = ctl.ALIGN_X[t._alignX];
	switch(i) {
	case 1:
		x = (ownerInnerWidth - t._width) / 2;	// center
		break;
	case 2: 
		x = ownerInnerWidth - t._width;			// right
		break;
	default: 
		return;
	}
	x = (x < 0)? 0 : x;
	if (x != t._x){
		t._x = x;
		t._shade.left = '' + t._x + 'px';
		if (t._blockValidate)
			return;
		t.resizing(false);
		t.invalidate();
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAlignY [private].
  TASK: Calculates vertical alignment.
  ARGS: 
  	t 					: Control : (this).
	ownerInnerHeight	: number  : inner height of owner.
  INFO: 
  	Values can be "center" or "bottom". top is unnecessary, just set y = 0.
	The routine is called only when this (t) has an owner.
——————————————————————————————————————————————————————————————————————————*/
function calcAlignY(t = null, ownerInnerHeight) {
	var i,
		y;

	i = ctl.ALIGN_Y[t._alignY];
	switch(i) {
	case 1:
		y = (ownerInnerHeight - t._height) / 2;	// center
		break;
	case 2: 
		y = ownerInnerHeight - t._height;		// right
		break;
	default: 
		return;
	}
	y = (y < 0)? 0 : y;
	if (y != t._y){
		t._y = y;
		t._shade.top = '' + t._y + 'px';
		if (t._blockValidate)
			return;
		t.resizing(false);
		t.invalidate();
	}
}