/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TControl.js: Tore Js base visual component (control) class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, is, core, TComponent, exc } from "../lib/index.js";
import { TCtl } from "../ctl/TCtl.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TControl
  TASKS: Defines basic behaviours of Tore JS controls.
  NOTES:
	*	Parent - Child hierarchy is mapped to standard owner-member system.
	*	TControl defines an interactivity scheme. 
	*	TControl defines a style name scheme, look TStyler.js.
————————————————————————————————————————————————————————————————————————————*/
export class TControl extends TComponent {

	// TControl dom tag. If null, element is not built in TControl constructor.
	static elementTag = 'div';	
	// TControl focusability default.
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
		controlState	: {value: TCtl.ALIVE},
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
	  TASK: Constructs a TControl component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: TComponent	: Owner of the new control if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null, init = true) {
		super(name);
		this.makeElement();
		this._computed = getComputedStyle(this._element);
		this.canFocus = this.class.canFocusDefault;
		sys.propSet(this._shade, this.class.initialStyle);
		this._initControl(name, owner, data, init);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _initControl [protected].
	  TASK: Initializes control.
	  ARGS:
		owner 	: TControl	: owner if any.
		data	: Object	: data if any.
	——————————————————————————————————————————————————————————————————————————*/
	_initControl(name = null, owner = null, data = null, init = true) {
		if (name === sys.LOAD || !init)
			return;
		this.controlState = TCtl.ALIVE;
		this._blockValidate = true;
		if (owner)
			owner.attach(this);
		if (data)
			sys.propSet(this, data);
		this._blockValidate = false;
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
		this.controlState = TCtl.DYING;
		super.destroy();		// inherited destroy
		this._ctl = null;
		this.killElement();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: makeElement.
	  TASK: Builds and binds a document object model element to control.
	——————————————————————————————————————————————————————————————————————————*/
	makeElement() {
		var e = this.class.elementTag;

		if (this._element)
			return;
		this._element = (e !== 'body') ? document.createElement(e) : document.body;
		this._element.ToreJS_Control = this;
		this._wrapper = this._element;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: killElement.
	  TASK: Frees control from its document object model element.
	——————————————————————————————————————————————————————————————————————————*/
	killElement() {
		var e = this._element;

		if (!e)
			return;
		if (typeof e.ToreJS_Control !== 'undefined')
			delete(e.ToreJS_Control);	
		if (e !== document.body){ 
			if (e.parentNode)
				e.parentNode.removeChild(e);
		}
		this._wrapper = null;
		this._element = null;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	Attaches a member component to the TControl.
	  ARGS:
		component	: TComponent	: new member component :DEF: null.
	  RETV: 		: Boolean	: True on success
	  INFO:	
		If member component is a TControl;
		* Member is refreshed and interactivity checked.
		* this (owner) is size adjusted if auto sizing.
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		var	c = component;

		if (!super.attach(c))
			return false;
		if (c instanceof TControl) {
			this._ctl.push(c);
			this._wrapper.appendChild(c._element);
			c.checkEvents();
			this.contentChanged();
		}
		return true;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	Detaches a member component from the control.
	  ARGS:	
		component 	: TComponent : member component to detach. :DEF: null.
	  RETV: Boolean	: True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null){
		var i;

		if (!super.detach(component))
			return false;
		if (!(component instanceof TControl))
			return true;
		i = this._ctl.indexOf(component);
		if (i !== -1)
			this._ctl.splice(i, 1);
		if (component._element.parentNode === this._wrapper)
			this._wrapper.removeChild(component._element);
		component.checkEvents();
		this.contentChanged();
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
	  FUNC: coordsChanged.
	  TASK: Coordinate change dispatcher.
	——————————————————————————————————————————————————————————————————————————*/
	coordsChanged(){
		if (this._blockValidate || this._invalid)
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
		shade = this._shade,
		style = this._element.style,
		clChg = this._classesChanged,
		coChg = this._contentChanged;
		this._shade = {};
		this._invalid = false;
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
	  FUNC: recalculate
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
		All '_set' methods:
		*	Are raw calls which do not make necessary checkings.
		*	Operate on shadow coordinates only.
		*	Do not set element style values. 
		*	No relocation dispatching and invalidation is done.
		*	They return true if shadow coordinates change.
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setX [protected].
	  TASK: 
		Sets the x coordinate of control without alignment or autoX checking.
	  ARGS:
		x	: number	: X coordinate value in pixels.
	  RETV: : boolean	: true if x changes.
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
	  TASK: 
		Sets the y coordinate of control without alignment or autoY checking.
	  ARGS:
		y	: number	: Y coordinate value in pixels.
	  RETV: : boolean	: true if y changes.
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
		prop	: string	: Property setter name (for exception info)
	  RETV: 	: boolean	: true if autoAdjust required.
	——————————————————————————————————————————————————————————————————————————*/
	_setAutoValue(val = null, pvar, prop, allowInt = true, allowStr = true) {
        var	t = typeof val;
        
		if (val === this[pvar])
			return false;		// No autoAdjust required.
		if (val === null) {
			this[pvar] = null;
			return false;		// No autoAdjust required.
		}
		if ((allowStr && t === "string") || (allowInt && t === "number")) {
			this[pvar] = val;
			return true;		// autoAdjust required.
		} 
		if (is.vpObj(val)) {
			this[pvar] = Object.assign({}, val);
			return true;		// autoAdjust required.
		}
        exc('E_INV_VAL',  this.namePath + '.' + prop);        
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
			"fit"	: This is a tricky fit-content.
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
			"fit"	: This is a tricky fit-content.
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
	  PROP: shellWidth
	  GET : Gets the computed sum of control padding and border width.
	——————————————————————————————————————————————————————————————————————————*/
	get shellWidth(){
		return this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: shellHeight
	  GET : Gets the computed sum of control padding and border height.
	——————————————————————————————————————————————————————————————————————————*/
	get shellHeight() {
		return this._shellH;	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerWidth
	  GET : Gets the computed control visible content width.
	——————————————————————————————————————————————————————————————————————————*/
	get innerWidth(){
		return this._width - this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerHeight
	  GET : Gets the computed control visible content height.
	——————————————————————————————————————————————————————————————————————————*/
	get innerHeight() {
		return this._height - this._shellH;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: maxAllowedInnerWidth.
	  TASK: This finds the maximum allowed inner width for the control.
	  RETV: 	: number : maximum allowed inner width for the control.
	  INFO: When autoWidth is "fit", tries find maximum width possible.
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
	  FUNC: widthToFit
	  TASK: Sets width to fit the content.
	  RETV:		: Boolean : True if width changed.
	  INFO: This is called when autoWidth = "fit".
			Should be overridden according to the nature of TControl.
	——————————————————————————————————————————————————————————————————————————*/
	widthToFit() {
		var s = this._element.style,
			r;
		
		s.left = '0px';
		r = this._widthByStyle("fit-content");
		s.left = ''+ this._x + 'px';
		return r;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: heightToFit
	  TASK: Sets height to fit the content.
	  RETV: 	: Boolean : True if height changed.
	  INFO: This is called when autoHeight = "fit".
			Should be overridden according to the nature of TControl.
	——————————————————————————————————————————————————————————————————————————*/
	heightToFit() {
		var s = this._element.style,
			r;
		
		s.top = '0px';
		r = this._heightByStyle("fit-content");
		s.top = ''+ this._y + 'px';
		return r;
	}

	// Do not meddle with these methods...
	_widthByStyle(val) {
		var s = this._element.style;

		s.width = val;							// reflow.
		val = parseFloat(this._computed.width || '0');
		if (this._width === val) {
			s.width = '' + this._width + 'px';	// reflow.
			return false; 
		}
		return this._setW(val);
	}

	_heightByStyle(val) {
		this._element.style.height = val;							// reflow.
		val = parseFloat(this._computed.height || '0');
		if (this._height === val) {
			this._element.style.height = '' + this._height + 'px';	// reflow.
			return false; 
		}
		return this._setH(val);
	}

	_widthByMembers() {
		return this._setW(this.membersWidth + this._shellW);
	}

	_heightByMembers() {
		return this._setH(this.membersHeight + this._shellH);
	}

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
	  FUNC: doViewportResize
	  TASK: Flags the control that viewport is resized.
	  INFO: This is a global dispatch from display control.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		var c,
			e = this._eve.onViewportResize;

		this._vpResize = true;
		this.autoAdjust();
		this.invalidate();
		for(c of this._ctl){
			if (c instanceof TControl)
				c.doViewportResize();
		}
		this._vpResize = false;
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

		if (!this._vpResize)
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
		
		if (!this._vpResize)
			this.autoAdjust();
		return ((e) ? e.dispatch([this]) : null);
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
			this._ctlState !== TCtl.SLEEP &&
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
		
		if (this._ctlState != TCtl.FOCUS)
			return null;
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doDoubleClick
	  TASK: Flags the control that mouse is double clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doDoubleHit(x, y, e) {
		var eve = this._eve.onDoubleHit;
		
		if (this._ctlState != TCtl.FOCUS)
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
		if (this._ctlState === TCtl.ALIVE)				// if state is ALIVE 
			this.controlState = TCtl.HOVER;				// set it to HOVER
		return ((e) ? e.dispatch([this, x, y]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOut() {
	var e = this._eve.onPointerOut;					// fetch event to relay
	
		this._ptrOver = false;						// not any more.
		if (this._ctlState === TCtl.HOVER)
			this.controlState = TCtl.ALIVE;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusIn
	  TASK: Flags the control that it enters focus.  
	——————————————————————————————————————————————————————————————————————————*/
	doFocusIn() {
		var e = this._eve.onFocusIn;				// fetch event
	
		this.controlState = TCtl.FOCUS;
		return ((e) ? e.dispatch([this]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusOut
	  TASK: Flags the control that it leaves focus.
	——————————————————————————————————————————————————————————————————————————*/
	doFocusOut() {
		var e = this._eve.onFocusOut;				// fetch event
	
		if (this._ctlState == TCtl.SLEEP)
			return null;
		if (this._ctlState == TCtl.FOCUS)
			this.controlState = (this._ptrOver ? TCtl.HOVER : TCtl.ALIVE);
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

	set zIndex(val = 0){
		if (typeof val !== "number" || this._zIndex == val)
			return;	
		this._zIndex = val;
		this._shade.zIndex = '' + val;
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

	set opacity(val = 1){
		if (typeof val !== "number" || val < 0 || val > 1 || this._opacity === val)
			return;
		this._opacity = val;
		this._shade.opacity = '' + val;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	tabIndex : Boolean ;
	  GET : Returns the tab index of the control.
	  SET : Sets    the tab index of the control.
	  INFO:
		*	A negative value like -1 makes control ignored as tab stop.
		*	Effective only if :
			TControl is interactive,
			TControl is in a TContainer descendant.
	——————————————————————————————————————————————————————————————————————————*/
	get tabIndex() {
		return(this._tabIndex);
	}

	set tabIndex(val = 0) {
		if (typeof val !== "number" || this._tabIndex === val)
			return;
		this._tabIndex = val;
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

	set styleExtra(val = null) {
		if ((typeof val !== "string" && val !== null) || this._styleExtra === val)
			return;
		this._styleExtra = val;
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

	set styleColor(val) {
		if ((val !== null && typeof val !== "string") || this._styleColor === val)
			return;
		if (val && !TCtl.COLORS[val])
			return;
		this._styleColor = val;
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

	set styleSize(val = null) {
		if ((typeof val !== "string" && val !== null) || this._styleSize === val)
			return;
		if (val && !TCtl.SIZES[val])
			return;
		this._styleSize = val;		// set style size name
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
			s = TCtl.SUFFIX[this._ctlState];
		
		function calcSub(n){
			if (typeof n === 'string') 
				return ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s;
			return '';
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
			return((this._ctlState == TCtl.SLEEP) ? TCtl.SLEEP : TCtl.ALIVE);
		return(this._ctlState);
	}
		
	set controlState(val = 0){
		if (typeof val !== 'number' || 
			val < TCtl.DYING ||
			val > TCtl.SLEEP || 
			val === this._ctlState)
			return;
		this._ctlState = val;
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
		If it is in rectangles of owner chain, then it is displaying.
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
		this.relocate(v);
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
		while(c instanceof TControl){
			if(!c._visible)					// if invisible
				return(false);
			if (c === core.display)			// if display
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
		return this._ctlState != TCtl.SLEEP;
	}

	set enabled(value = true) {
		var c;

		value = !!value;
		if (value === (this._ctlState != TCtl.SLEEP))
			return;
		this.controlState = (value) ? TCtl.ALIVE : TCtl.SLEEP;
		for(c of this._ctl)
			c.enabled = value;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	canFocus : Boolean ;
	  GET : Returns true if control is a focusable one.
	  SET : if true flags control as focusable.
	  INFO: TControl should be on display, enabled and visible to be focusable.
	——————————————————————————————————————————————————————————————————————————*/
	get canFocus() {
		return(this._canFocus);
	}

	set canFocus(val){
		var v = !!val;

		if (this._canFocus === v)
			return;
		this._canFocus = v;
		this.checkEvents();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	hitOpaque : Boolean ;
	  GET : Returns true if control can be only hit at opaque surfaces.
	  SET : Sets if control can be only hit at opaque surfaces.
	  INFO:	This is for controls like TImage, Canvas etc.
	——————————————————————————————————————————————————————————————————————————*/
	get hitOpaque() {
		return(this._hitOpaque);
	}

	set hitOpaque(val){
		this._hitOpaque = !!val;
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

	set yieldFocus(val){
		this._yieldFocus = !!val;
	}
	/*——————————————————————————————————————————————————————————————————————————
	  PROP: container
	  GET : Returns the container of the control or null.
	——————————————————————————————————————————————————————————————————————————*/
	get container() {
		var o = this._own; 
	
		while(o instanceof TControl){
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
  FUNC: cascadeShowing [private].
  TASK: Sets control and sub control style visibilities.
  ARGS:
	t 			: TControl	: TControl to set visibility.
	showing		: bool		: Visibility state.
——————————————————————————————————————————————————————————————————————————*/
function cascadeShowing(t, showing = false) {
	var c,
		v = (showing) ? 'visible': 'hidden';

	if (t._element.style.visibility !== v) {
		t._shade.visibility = v;
		t.invalidate();
	}
	for(c of t._ctl) 
		cascadeShowing(c, (showing) ? c._visible : false);
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcClassNameSub [private].
  TASK: Calculates control element class name.
  ARGS: 
  	t : TControl : (this) ;)
	n : String  : Style class name or null.
  RETV:
	  : String  : Something wicked.
——————————————————————————————————————————————————————————————————————————*/
function calcClassNameSub(t, n){
	var c = t.class.name+ ((t._styleRoot !== null) ? t._styleRoot : ''),
		s = TCtl.SUFFIX[t._ctlState];

	if (typeof n === "string")
		return ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s;
	return '';
}

/*——————————————————————————————————————————————————————————————————————————
  SUBSYS: Dimension. Private functions.

	*	Operate on shadow coordinates only.
	*	Do not set element style values	where possible. 
	*	No relocation dispatching and invalidation is done.
	*	They return true if shadow coordinates change.
	*	Called only when this (t - the control) has an owner.
——————————————————————————————————————————————————————————————————————————*/

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoX [private].
  TASK: 
	Calculates and sets the x coordinate of control according to autoX.
  ARGS: 
  	t 			: TControl : (this).
	ownerWidth	: number  : Inner width of owner.
  RETV: 		: boolean : true if x changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoX(t, ownerWidth){
	var val = t._autoX;

	if (val.constructor === Object)
		val = TCtl.viewportValue(t, val, "autoX");
	if (val === null)
		return false;
	switch(typeof val){
	case "number":
		return t._setX((val <= 0 || val >= 1) ? val : ownerWidth * val);
	case "string": 
		switch(val) {
		case "right":
			return t._setX(ownerWidth - t._width);
		case "center":
			return t._setX((ownerWidth - t._width) / 2);
		default:
			t._element.style.left = val;					// reflow.
			val = parseFloat(t._computed.left || 0);
			if (t._x === val){
				t._element.style.left = '' + t._x + 'px';	// reflow.
				return false; 
			}
			return t._setX(val);
		}
	}
	return false;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoY [private].
  TASK:
	Calculates and sets the y coordinate of control according to autoY.
  ARGS: 
	t			: TControl : (this).
	ownerHeight	: number  : Inner height of owner.
  RETV: 		: boolean : true if y changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoY(t, ownerHeight){
	var val = t._autoY;

	if (val.constructor === Object)
		val = TCtl.viewportValue(t, val, "autoY");
	if (val === null)
		return;
	switch(typeof val) {
	case "number":
		return t._setY((val <= 0 || val >= 1) ? val : ownerHeight * val);
	case "string":
		switch(val) {
		case "bottom":
			return t._setY(ownerHeight - t._height);
		case "center":
			return t._setY((ownerHeight - t._height) / 2);
		default:
			t._element.style.top = val;						// reflow.
			val = parseFloat(t._computed.top || 0);
			if (t._y === val){
				t._element.style.top = '' + t._y + 'px';	// reflow.
				return false; 
			}
			return t._setY(val);
		}
	}
	return false;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoWidth [private].
  TASK: 
	Calculates and sets the width of control according to autoWidth.
  ARGS: 
  	t 			: TControl : (this).
	ownerWidth	: number  : inner width of owner.
  RETV: 		: boolean : true if width changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoWidth(t, ownerWidth) {
	var val = t._autoWidth; 

	if (val.constructor === Object) 
		val = TCtl.viewportValue(t, val, "autoWidth");
	if (val === null)
		return false;
	switch(typeof val){
	case "number": 
		return t._setW((val > 1) ? val : val * ownerWidth);
	case "string":
		return (val === "fit") ? t.widthToFit() : t._widthByStyle(val);
	}
	return false;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoHeight [private].
  TASK: Calculates control height.
  ARGS: 
	t			: TControl : (this).
	ownerHeight	: number  : Inner height of owner.
  RETV: 		: boolean : true if height changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoHeight(t, ownerHeight){
	var val = t._autoHeight;

	if (val.constructor === Object) 
		val = TCtl.viewportValue(t, val, "autoHeight");
	if (val === null)
		return false;
	switch(typeof val) {
	case "number": 
		return t._setH((val > 1) ? val : val * ownerHeight);
	case "string":
		return (val === "fit") ? t.heightToFit(): t._heightByStyle(val);
	}
	return false;
}



sys.registerClass(TControl);