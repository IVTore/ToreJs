/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230309
  Author	: 	IVT : İhsan V. Töre
  About		: 	TControl.js: Tore Js base visual component (control) class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, exc, core, TComponent } from "../lib/index.js";
import { cts } from "../ctl/TCtlSys.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TControl
  TASKS: Defines basic behaviours of Tore JS controls.
  NOTES:
	*	Parent - Child hierarchy is mapped to standard owner-member system.
	*	TControl defines an interactivity scheme. 
	*	TControl defines a style name scheme, look TStyler.js.
————————————————————————————————————————————————————————————————————————————*/

export class TControl extends TComponent {

    /*————————————————————————————————————————————————————————————————————————————
        TControl direct wrapper dom object. 
        Used for singleton controls like display (body). 
        If non null, wrapper will be set to this.
        If null, wrapper will be created according to wrapper tag.
    ————————————————————————————————————————————————————————————————————————————*/
    static wrapperDom = null;

    /*————————————————————————————————————————————————————————————————————————————
        TControl direct element dom object. 
        Used for singleton controls like display (body).
        If non null, element will be set to this.
        If null, element will be created according to element tag.
    ————————————————————————————————————————————————————————————————————————————*/  
    static elementDom = null;

    /*————————————————————————————————————————————————————————————————————————————
        TControl wrapper dom tag. 
        If non null, constructor will build the wrapper and 
        it will be positioned absolute, element will be relative.
        If null, wrapper will not be built, element will be positioned absolute.
    ————————————————————————————————————————————————————————————————————————————*/
    static wrapperTag = null;

    /*————————————————————————————————————————————————————————————————————————————
        TControl element dom tag. 
        If non null, constructor will build the element.
    ————————————————————————————————————————————————————————————————————————————*/
    static elementTag = 'div';	

    // TControl focusability default.
	static canFocusDefault = true;

    // Initial values of control.
	static initialStyle = {
		left: "0px",
		top: "0px",
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
		controlState	: {value: cts.ALIVE},
		visible			: {value: true},
		canFocus		: {value: false},
		hitOpaque		: {value: false},
		yieldFocus		: {value: false},
		
		dragEnabled		: {value: false, store: true},
		dropEnabled		: {value: false, store: true},

		// Events
		onFocusIn		: {event: true},
		onFocusOut		: {event: true},
		onViewportResize: {event: true},
		onMemberRelocate: {event: true},
		onOwnerResize	: {event: true},
		onLanguageChange: {event: true},
		onDragStart		: {event: true},
		onDrag			: {event: true},
		onDragEnd		: {event: true},
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
	_wrapper = null;			// Wrapper element.
	_visible = true;			// Visibility setting.
	_canFocus = true;			// TControl can focus or not.
	_interact = false;			// Interactibility state.
	_hitOpaque = false;			// When true, transparent control 
								// surfaces must not interact with
								// hit events. This is for controls
								// like Canvas, TImage etc.
	_yieldFocus = false;		// If control must yield focus
								// to the other controls under it.
	dragEnabled = false;		// If true control is draggable.
	dropEnabled = false;		// If true control is a dropzone.

    // Readonly.
	_shellW = 0;
	_shellH = 0;

	// Internal properties.
	_ctl = [];					// Sub controls array.
	_ptrOver = false;			// Pointer over.
	_oldW = 0;					// Previous width of control.
	_oldH = 0;					// Previous height of control.
	_viewResize = false;		// Viewport resizing flag.
	_invalidate = false;		// If true rendering is required.
	_noValidate = false;		// If true block invalidation and therefore render.
	
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
	  TASK: Constructs a TControl component, attaches it to its owner if any.
	  ARGS: 
		name : string	    : Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner: TComponent   : Owner of the new control if any :DEF: null.
		data : Object	    : An object containing instance data :DEF: null.
      WARN:
        When name is sys.LOAD owner and data will be useless.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name);
		this._initControl();
        if (name === sys.LOAD)
			return;
        this._noValidate = true;
        if (owner)
            owner.attach(this);
        if (data)
            sys.propSet(this, data);
        this._noValidate = false;
        this.autoAdjust();
		this.invalidate();		
	}

    
    /*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the control.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.controlState = cts.DYING;
		super.destroy();		        // inherited destroy
		this._ctl = null;
		killElements(this);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _initControl [protected].
	  TASK: Initializes control.
	  INFO:
		This is for setting the initial values of control.
        When overridden, super._initControl(); must be called first.
	——————————————————————————————————————————————————————————————————————————*/
    _initControl(){
        if (this._element)
            return;
        makeElements(this);
        this._computed = getComputedStyle(this._element);
		this._canFocus = this.class.canFocusDefault;
        this._ctlState = cts.ALIVE;
		sys.propSet(this._shade, this.class.initialStyle);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	Attaches a member component to the TControl.
	  ARGS:
		component   : TComponent	: new member component :DEF: null.
	  RETV:         : Boolean	    : True on success
	  INFO:	
		If member component is a TControl;
		* Member is refreshed and interactivity checked.
		* this (owner) is size adjusted if auto sizing.
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component))
			return false;
		if (component instanceof TControl) {
			this._ctl.push(component);
			this._element.appendChild(component._wrapper);
			component.checkEvents();
			this.contentChanged();
		}
		return true;
	}

    /*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	Detaches a member component from the control.
	  ARGS:	
		component	: TComponent    : member component to detach. :DEF: null.
	  RETV:         : Boolean       : True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null){
		var i;

		if (!super.detach(component))
			return false;
		if (component instanceof TControl) {
            i = this._ctl.indexOf(component);
            if (i !== -1)
                this._ctl.splice(i, 1);
            if (component._wrapper.parentNode === this._element)
                this._element.removeChild(component._wrapper);
            component.checkEvents();
            this.contentChanged();
        }
		return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Rendering.
	——————————————————————————————————————————————————————————————————————————*/
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidate
	  TASK: Invalidates current render status of control. 
	——————————————————————————————————————————————————————————————————————————*/
	invalidate() {
		if (this._invalidate || this._noValidate)
			return;
		this._invalidate = true;
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
	  FUNC: coordsChanged.
	  TASK: Coordinate change dispatcher.
	——————————————————————————————————————————————————————————————————————————*/
	coordsChanged(){
		if (this._noValidate || this._invalidate)
			return;
		this.relocate();	
		this.invalidate();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: render
	  TASK: This draws the control. Called by display before new frame.
	——————————————————————————————————————————————————————————————————————————*/
	render() {
		var index,
			shade,
			style,
			clChg,
			coChg;

		if (!this._sta)
			return;
		shade = this._shade;
		if (this._wrapper !== this._element) {
            style = this._wrapper.style;
            if (shade.height)
                style.height = shade.height;
            if (shade.width)
                style.width = shade.width;
            if (shade.visibility)
                style.visibility = shade.visibility;
        }
        style = this._element.style;
        clChg = this._classesChanged;
		coChg = this._contentChanged;
        this._shade = {};
		this._invalidate = false;
		this._classesChanged = false;
		this._contentChanged = false;
		for(index in shade)
			style[index] = shade[index];
		if (!this._ctlState)
			return;
		if (clChg)
			this._element.className = this._sBase + this._sSize + this._sColor + this._sExtra;
		if (coChg)
			this.renderContent();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the control content. Called by render before new frame.
	  INFO: This is a placeholder method to override.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() { }


    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: relocate
	  TASK: 
		Notifies owner if it is relocated.
		Notifies members if it is resized.		
	—————————————————————————————————————————————————————————————————————————*/
	relocate() {
		var	c;

		if (this._own instanceof TControl)
			this._own.doMemberRelocate(this);
		if (this._oldW === this._width && 
			this._oldH === this._height)
			return;
		for(c of this._ctl)
			c.doOwnerResize();
		this._oldW = this._width;
		this._oldH = this._height;
	}

    
    /*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Dimension management.
	——————————————————————————————————————————————————————————————————————————*/

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	x   : int;
	  GET : Returns  control x coordinate.
	  SET : Sets the control x coordinate.
	  INFO: When autoX is non-null setting x coordinate is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get x() {
		return this._x;
	}

	set x(val = 0) {
		if (this._autoX !== null)
			return;
		if (this._setX(val)) 
			this.coordsChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	y   : int;
	  GET : Returns  control y coordinate.
	  SET : Sets the control y coordinate.
	  INFO: When autoY is non-null setting y coordinate is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get y() {
		return(this._y);
	}

	set y(val = 0) {
		if (this._autoY !== null)
			return;
		if (this._setY(val))
			this.coordsChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	width : int;
	  GET : Returns  control width.
	  SET : Sets the control width.
	  INFO: When autoWidth is non-null setting width is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get width() {
		return this._width;
	}

	set width(val = 64) {
		if (this._autoWidth !== null)
			return;
		if (this._setW(val)) {
			if (this._autoX)	// not 0 or null?
				calcAutoX(this, this._own.innerWidth)
			this.coordsChanged(true);
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	height : int;
	  GET : Returns  control height.
	  SET : Sets the control height.
	  INFO: When autoHeight is non-null setting height is not allowed.
	——————————————————————————————————————————————————————————————————————————*/
	get height() {
		return this._height;
	}

	set height(val = 64) {
		if (this._autoHeight !== null)
			return;
		if (this._setH(val)){
			if (this._autoY)	// not 0 or null?
				calcAutoY(this, this._own.innerHeight)
			this.coordsChanged(true);
		}
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
		* A number between 0 and 1 (exclusive) i.e: 0.5 .
			x will be set to owner innerWidth * autoX.
		* A number with value <= 0 or value >= 1, x = value.
		* A string:
			"right" 	: Aligns the control to right.
			"center"	: Aligns the control to center.
			Other values will be treated as a CSS property which 
			may cause a reflow.
	——————————————————————————————————————————————————————————————————————————*/
	get autoX() {
		return(this._autoX);
	}

	set autoX(val = null) {
		if (this._setAutoValue(val, '_autoX', 'autoX'))
			this.autoAdjust();
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
		* A number between 0 and 1 (exclusive) i.e: 0.2 .
			y will be set to owner innerHeight * autoY.
		* A number with value <= 0 or value >= 1, y = value.
		* A string: 
			"bottom" 	: Aligns the control to bottom.
			"center"	: Aligns the control to center.
			Other values will be treated as a CSS property which 
			may cause a reflow.
	——————————————————————————————————————————————————————————————————————————*/
	get autoY() {
		return(this._autoY);
	}

	set autoY(val = null) {
		if (this._setAutoValue(val, '_autoY', 'autoY'))
			this.autoAdjust();
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
		* A number between (0 and 1] (0 excluded, 1 included) i.e: 0.5 .
			width will be set to owner inner width * autoWidth.
		* A number with value = 0 or value >= 1, width = value.
		* A string: 
			Always causes reflow.
			"fit"	: This is a tricky fit-content directive.
			Other values will be treated as a CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoWidth() {
		return(this._autoWidth);
	}

	set autoWidth(val = null) {
		if (this._setAutoValue(val, '_autoWidth', 'autoWidth'))
			this.autoAdjust();
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
		* A string: 
			Always causes reflow.
			"fit"	: This is a tricky fit-content directive.
			Other values will be treated as a CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoHeight() {
		return(this._autoHeight);
	}

	set autoHeight(val = null){
		if (this._setAutoValue(val, '_autoHeight', 'autoHeight'))
			this.autoAdjust();
	}

    /*——————————————————————————————————————————————————————————————————————————
		_setX, _setY, _setW, _setH:
		*	Are raw calls which do not make alignment or auto checkings.
		*	Operate on shadow style values only.
		*	No relocation dispatching and invalidation is done.
		*	They return true only if shadow coordinates change.
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setX [protected].
	  TASK: Sets the x coordinate of control without checking.
	  ARGS:	x	: number	: X coordinate value in pixels.
	  RETV:     : boolean	: true if x changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setX(x = 0) {
		if (typeof x !== "number" || this._x === x)
			return false;
		this._x = x;
		this._shade.left = '' + x +'px';
		return true;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setY [protected].
	  TASK:	Sets the y coordinate of control without checking.
	  ARGS:	y	: number	: Y coordinate value in pixels.
	  RETV:     : boolean	: true if y changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setY(y = 0) {
		if (typeof y !== "number" || this._y === y)
			return false;
		this._y = y;
		this._shade.top = '' + y +'px';
		return true;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setW [protected].
	  TASK: 
		Sets the width of control without autoWidth checking.
	  ARGS:
		w	: number	: Width value in pixels.
	  RETV: : boolean	: true if width changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setW(w = 0) {
		if (typeof w !== "number" || this._width === w || w < 0)
			return false;
		this._width = w;
		this._shade.width = '' + w +'px';
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setH [protected].
	  TASK: 
		Sets the height of control without autoHeight checking.
	  ARGS:
		h	: number	: Height value in pixels.
	  RETV: : boolean	: true if height changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setH(h = 0) {
		if (typeof h !== "number" || this._height === h || h < 0)
			return false;
		this._height = h;
		this._shade.height = '' + h +'px';
		return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setAutoValue [protected].
	  TASK: 
		Sets automatic values to automatic properties.
	  ARGS:
		val		: number	: Value as number.
				: string	: Value as string.
				: object	: Value as viewport value object.
		pvar	: string	: Protected var name associated to property.
		prop	: string	: Property setter name (for exception info).
        numOk   : boolean   : Value can be a number when true :DEF: true.
        strOk   : boolean   : Value can be a string when true :DEF: true.
	  RETV: 	: boolean	: true if autoAdjust required.
	——————————————————————————————————————————————————————————————————————————*/
	_setAutoValue(val = null, pvar, prop, numOk = true, strOk = true) {
        var	t = typeof val;
        
		if (val === this[pvar])
			return false;		// No autoAdjust required.
		if (val === null) {
			this[pvar] = null;
			return false;		// No autoAdjust required.
		}
		if (strOk && t === "string") {
			sys.str(val, this.namePath + '.' + prop, 'E_INV_VAL');
			this[pvar] = val;
			return true;		// autoAdjust required.
		}
		if (numOk && t === "number") {
			this[pvar] = val;
			return true;        // autoAdjust required.
		}
		if (is.vpObj(val)) {
			this[pvar] = Object.assign({}, val);
			return true;		// autoAdjust required.
		}
        exc('E_INV_VAL',  this.namePath + '.' + prop);        
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: autoAdjust
	  TASK: Changes the size and position of control according to properties.
	  RETV: 	: Boolean : true if adjust done, false if not required.
	——————————————————————————————————————————————————————————————————————————*/
	autoAdjust() {
		var t = this,
			o = t._own,
			dx, dy,
			ow, oh,
			aw = false, ah = false,
			ax = false, ay = false,
			ar = false, ab = false;

		if (!(o instanceof TControl))
			return false;
		dx = o._width - o._oldW;
		dy = o._height - o._oldH;
		if (!(	t._autoX !== null || t._autoY !== null ||
				t._autoWidth !== null || t._autoHeight !== null || 
				(dx && t.anchorRight) || (dy && t.anchorLeft)))
			return false;
		ow = o.innerWidth;
		oh = o.innerHeight;
		if (t._autoWidth) 
			aw = calcAutoWidth(t, ow);
		if (t._autoHeight) 
			ah = calcAutoHeight(t, oh);
		if (t.autoX)
			ax = calcAutoX(t, ow);
		if (t.autoY)
			ay = calcAutoY(t, oh);
		if (dx && t.anchorRight) {
			if (t.anchorLeft) 
				ar = this._setW(t, t._width + dx);
			else
				ar = this._setX(t, t._x + dx);
		}
		if (dy && t.anchorBottom) {
			if (t.anchorTop)
				ab = this._setH(t, t.height + dy);
			else
				ab = this._setY(t, t._y + dy);
		}
		aw = (aw || ah || ax || ay || ar || ab);
		if (aw)
			t.coordsChanged();
		return aw;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: recalculate.
	  TASK: Called by display, this calculates the necessary values for
			the control after rendering.
	——————————————————————————————————————————————————————————————————————————*/
	recalculate() {
		var s = this._computed;

		if (!this._sta)
			return;
		this._shellW = 
			parseFloat(s.paddingLeft || '0') +
			parseFloat(s.paddingRight || '0') +
			parseFloat(s.borderLeftWidth || '0') +
			parseFloat(s.borderRightWidth || '0');
		this._shellH = 
			parseFloat(s.paddingTop || '0') +
			parseFloat(s.paddingBottom || '0') +
			parseFloat(s.borderTopWidth || '0') + 
			parseFloat(s.borderBottomWidth || '0');
		this.autoAdjust();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _fitWidth [protected].
	  TASK: Sets width to fit the content.
	  RETV:		: Boolean : True if width changed.
	  INFO: This is called when autoWidth = "fit".
			Should be overridden according to the nature of TControl.
	——————————————————————————————————————————————————————————————————————————*/
	_fitWidth() {
		return false;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _fitHeight [protected].
	  TASK: Sets height to fit the content.
	  RETV: 	: Boolean : True if height changed.
	  INFO: This is called when autoHeight = "fit".
			Should be overridden according to the nature of TControl.
	——————————————————————————————————————————————————————————————————————————*/
	_fitHeight() { 
        return false;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: shellWidth : number.
	  GET : Gets the computed sum of control padding and border width.
	——————————————————————————————————————————————————————————————————————————*/
	get shellWidth() {
		return this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: shellHeight : number.
	  GET : Gets the computed sum of control padding and border height.
	——————————————————————————————————————————————————————————————————————————*/
	get shellHeight() {
		return this._shellH;	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerWidth : number.
	  GET : Gets the computed control visible content width.
	——————————————————————————————————————————————————————————————————————————*/
	get innerWidth(){
		return this._width - this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerHeight : number.
	  GET : Gets the computed control visible content height.
	——————————————————————————————————————————————————————————————————————————*/
	get innerHeight() {
		return this._height - this._shellH;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: membersWidth : number.
	  GET : Gets the maximum width of visible sub controls.
	——————————————————————————————————————————————————————————————————————————*/
    get membersWidth() {
		var c,
			x, 
			w = 0;

		for(c of this._ctl){
			if (c._visible){
				x = c._x + c._width;
				if (x > w)
					w = x;
			}
		}
		return w;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: membersHeight : number.
	  GET : Gets the maximum height of visible sub controls.
	——————————————————————————————————————————————————————————————————————————*/
	get membersHeight() {
		var c,
			y, 
			h = 0;

		for(c of this._ctl){
			if (c._visible){
				y = c._y + c._height;
				if (y > h)
					h = y;
			}
		}
		return h;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: maxAllowedInnerWidth.
	  TASK: This finds the maximum allowed inner width for the control.
	  RETV: 	: number : maximum allowed inner width for the control.
	  INFO: When autoWidth is "fit", tries find maximum width possible.
      TODO: This goes soo up... Check if necessary.
	——————————————————————————————————————————————————————————————————————————*/
	maxAllowedInnerWidth() {
		var c = this,
			s = 0,
			w;

		while(c instanceof TControl){
			w = c._width;
			s += c._shellW;
			if(c._autoWidth !== 'fit')
				break;
			c = c._own;
		}
		return w - s;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: maxAllowedInnerHeight.
	  TASK: This finds the maximum allowed inner height for the control.
	  RETV: 	: number : maximum allowed inner height for the control.
	  INFO: When autoWidth is "fit", tries find maximum height possible.
      TODO: This goes soo up... Check if necessary.
	——————————————————————————————————————————————————————————————————————————*/
	maxAllowedInnerHeight() {
		var c = this,
			s = 0,
			h;

		while(c instanceof TControl){
			h = c._height;
			s += c._shellH;
			if(c._autoHeight !== 'fit')
				break;
			c = c._own;
		}
		return h - s;
	}

    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize
	  TASK: Flags the control that viewport is resized.
	  INFO: This is a global dispatch from display control.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		var c,
			e = this._eve.onViewportResize;

		this._viewResize = true;
		this.autoAdjust();
		this.invalidate();
		for(c of this._ctl){
			if (c instanceof TControl)
				c.doViewportResize();
		}
		this._viewResize = false;
		return ((e) ? e.dispatch([this]) : null);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberRelocate
	  TASK: Flags the control that its member is resized or repositioned.
	  ARGS: 
		member	: TControl :	Member control that is relocated.
	  INFO: 
		Dimensions recalculated.
		Called from relocate() method of member.
		During viewport resize, autoAdjust is supressed.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberRelocate(member = null) {
		var e = this._eve.onMemberRelocate;

		if (!this._viewResize)
			this.contentChanged();
		return ((e) ? e.dispatch([this, member]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doOwnerResize
	  TASK: Flags the control that its owner is resized.
	  INFO: Dimensions recalculated.
			Called from relocate() method of owner.
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		var e = this._eve.onOwnerResize;
		
		if (!this._viewResize)
			this.autoAdjust();
		return ((e) ? e.dispatch([this]) : null);
	}

    /*———————————————————————————————————————————————————————————————————————————
	  SUBSYS: Interactivity	

	  This is a sub system for adding and removing event listeners and
	  executing other code required when shifting to respective control states.
      The display control is bound to the native events on screen. It makes
      these calls to the involved controls. 

	  * Only focusable Controls are allowed to attach interactivity events.
	  * Containers check interactivity of sub controls for focus management.
	———————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: checkEvents.
	  TASK: Checks state of control & then decides to make control interactive.
	——————————————————————————————————————————————————————————————————————————*/
	checkEvents() {
		var b;
	
		if (!this._sta)						// if dead...
			return;
		b =(this._visible && 
			this._ctlState && 
			this._ctlState !== cts.SLEEP &&
			this._canFocus);
		this._element.style.pointerEvents = (b) ? 'auto': 'none';
		if (b === this._interact)			// if no change in interactivity
			return;
		this._interact = b;
		if (this._tabIndex)
			this.invalidateContainerTabs();	// container tab order is invalid
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
	  PROP: container
	  GET : Returns the container of the control or null.
      TODO: This gets way up to the container, is this necessary
            when container is not immediate?  
	——————————————————————————————————————————————————————————————————————————*/
	get container() {
		var o = this._own; 
	
		while(o instanceof TControl){
			if (o instanceof TContainer)
				return(o);
			o = o._own;
		}
		return null;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doHit
	  TASK: Flags the control that mouse is clicking or touch tapping on it.
	——————————————————————————————————————————————————————————————————————————*/
	doHit(x, y, e) {
		var eve = this._eve.onHit;
		
		if (this._ctlState != cts.FOCUS)
			return null;
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doDoubleClick
	  TASK: Flags the control that mouse is double clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doDoubleHit(x, y, e) {
		var eve = this._eve.onDoubleHit;
		
		if (this._ctlState != cts.FOCUS)
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
	
		this._ptrOver = true;							// flag pointer over
		if (this._ctlState === cts.ALIVE)				// if state is ALIVE 
			this.controlState = cts.HOVER;				// set it to HOVER
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOut() {
	var e = this._eve.onPointerOut;					// fetch event to relay
	
		this._ptrOver = false;						// not any more.
		if (this._ctlState === cts.HOVER)
			this.controlState = cts.ALIVE;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusIn
	  TASK: Flags the control that it enters focus.  
	——————————————————————————————————————————————————————————————————————————*/
	doFocusIn() {
		var e = this._eve.onFocusIn;				// fetch event
	
		this.controlState = cts.FOCUS;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusOut
	  TASK: Flags the control that it leaves focus.
	——————————————————————————————————————————————————————————————————————————*/
	doFocusOut() {
		var e = this._eve.onFocusOut;				// fetch event
	
		if (this._ctlState == cts.SLEEP)
			return null;
		if (this._ctlState == cts.FOCUS)
			this.controlState = (this._ptrOver ? cts.HOVER : cts.ALIVE);
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}

}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: makeElements [private].
  TASK: Builds and binds a document object model elements of control.
——————————————————————————————————————————————————————————————————————————*/
function makeElements(ctl) {
    var c;

    function innerMake(dom, tag) {
        var m = null; 
        if (dom)
            m = dom;
        if (!m && tag)
            m = document.createElement(tag); 
        if (m)
            m.ToreJS_Control = ctl;
        return m; 
    }

    if (!(ctl instanceof TControl))
        exc('E_INV_ARG','ctl');
    if (ctl._element)
        return;
    c = ctl.class;
    ctl._wrapper = innerMake(c.wrapperDom, c.wrapperTag);
    ctl._element = innerMake(c.elementDom, c.elementTag);
    if (!ctl._element) 
        exc('E_CTL_NO_DOM', ctl.class.name + "\n static elementTag = null;" + "\n static elementDom = null;" );
    if (ctl._wrapper) {
        ctl._wrapper.appendChild(ctl._element);
        ctl._element.style.position = relative;
    } else {   
        ctl._wrapper = ctl._element;
    }    
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: killElements [private].
  TASK: Frees control from its document object model elements.
——————————————————————————————————————————————————————————————————————————*/
function killElements(ctl) {
    var w = this._wrapper,
        e = this._element;

    if (!e)
        return;
    if (typeof w.ToreJS_Control !== 'undefined')
        delete(w.ToreJS_Control);
    if (typeof e.ToreJS_Control !== 'undefined')
        delete(e.ToreJS_Control);
    if (w.parentNode && w !== document.body)
        w.parentNode.removeChild(w);
    if (w !== e) 
        w.removeChild(e);    
    this._wrapper = null;
    this._element = null;
}

sys.registerClass(TControl);