/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230309
  Author	: 	IVT : İhsan V. Töre
  About		: 	TControl.js: Tore Js base visual component (control) class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { core, sys, exc, TComponent } from "../lib/index.js";
import { TCtl, TContainer, styler }   from "../ctl/index.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TControl
  TASKS: Defines basic behaviours of Tore JS controls.
  NOTES:
	*	Parent - Child hierarchy is mapped to standard owner-member system.
	*	TControl defines an interactivity scheme. 
————————————————————————————————————————————————————————————————————————————*/

export class TControl extends TComponent {

    /*————————————————————————————————————————————————————————————————————————————
        TControl default focusability . 
        If true, control class instances can get focus by default.
        Overridable via focus property.
    ————————————————————————————————————————————————————————————————————————————*/
    static defaultCanFocus = true;

    // TControl dom tags.
    static elementTag = 'div';
    static wrapperTag = null;

		

    // TControl initial style.
    static initialStyle = {left: "0px", top: "0px", width:"32px", height:"32px"};
    
    /*————————————————————————————————————————————————————————————————————————————
        TControl Class Data Publishing Map. 
    ————————————————————————————————————————————————————————————————————————————*/
    static cdta = {				                // property publishing map
        x               : {value: 0},
        y               : {value: 0},
        w               : {value: 32},
        h               : {value: 32},
        autoX			: {value: null},
		autoY			: {value: null},
		autoW	    	: {value: null},
		autoH   		: {value: null},
        anchorLeft		: {value: true, store: true},
		anchorTop		: {value: true, store: true},
		anchorRight		: {value: false, store: true},
		anchorBottom	: {value: false, store: true},
        zIndex          : {value: 0},
        
        visible         : {value: true},
        opacity         : {value: 1},
        
        canFocus        : {value: false},
        yieldFocus      : {value: false},       
        hitOpaqueOnly   : {value: false},
        dragEnabled		: {value: false},
		dropEnabled		: {value: false},        
        controlState    : {value: TCtl.ALIVE},     
        
        styleRoot       : {value: null},
        styleSize       : {value: "Medium"},
        styleColor      : {value: "First"},
        styleExtra      : {value: null},

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
		onKeyDown		: {event: true},
		onKeyUp			: {event: true}
	}

    // Position and dimension variables.
    _x = 0;						// X coordinate.
	_y = 0;						// Y coordinate.
	_w = 32;				    // Width.
	_h = 32;				    // Height.
	_autoX = null;				// Automatic X.
	_autoY = null;				// Automatic Y.
	_autoW = null;			    // Automatic Width.
	_autoH = null;			    // Automatic Height.
    _zIndex = 0;				// Z (layer) index.
    anchorLeft = true;			// Anchors.
	anchorTop = true;
	anchorRight = false;
	anchorBottom = false;
    _shellW = 0;                // border + padding widths.
    _shellH = 0;                // border + padding heights.
    _oW = 0;				    // Previous width of control.
	_oH = 0;			        // Previous height of control.
    _caW = null;                // computed autoW.
    _caH = null;                // computed autoH.
    

    // Visibility.
    _visible = true;       
    _opacity = 1;               // Opacity (alpha) value.

    // Behavioral.
    _canFocus = false;      
    _yieldFocus = false;   
    _hitOpaque = false;
    _ctlState = TCtl.ALIVE;
    _dragEnabled = false;	
    _dropEnabled = false;
    _subCtls = [];              // Subcontrols list.
    _invalid = false;           // If true, control will be rendered.
    _noValidate = false;        // If true, invalidation requests are blocked.
    _interact = false;          // True if control is interactive.
    _cContent = false;          // Content has changed flag.
    _cClasses = false;          // Css Classes has changed flag.
    _cLocated = false;          // Coordinates changed flag.


    // Dom
    _element = null;            // Dom element (outer).
    _wrapper = null;            // Dom wrapper element (inner) if exists.
    

    // Css
    _computed = null;           // Current element computed style.
    _shadowed = {};             // Future shadowed style.
    _styleRoot = null;          // Style Root prefix
    _styleExtra = null;			// Style Extra name. 
	_styleColor = "First";		// Color style name.
	_styleSize = "Medium";		// Size style name.
    _sClass = null;             // Calculated element class name.
	
    

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
        makeElements(this);
        this._canFocus = this.class.defaultCanFocus;
        sys.propSet(this._shadowed, this.class.initialStyle);
        this.initControl(name, owner, data);        
	}

    /*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the control.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.controlState = TCtl.DYING;
		super.destroy();		        // inherited destroy
		this._subCtls = null;
		killElements(this);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: initControl.
	  TASK: Initializes control.
	  INFO:
		* This is for fast setting of the initial values of control.

        * It also becomes handy when there is need of complete declaration of
        class fields, initialization can be delayed by not passing owner and
        data to the super constructors in the descendant control class 
        therefore avoiding attach and propSet, then descendant calls the
        initControl itself.
         
        * Note that initControl does not assign the name.
	——————————————————————————————————————————————————————————————————————————*/
    initControl(name = null, owner = null, data = null) {
        var onn = owner !== null,
            oic = owner instanceof TControl;

        if (name === sys.LOAD)
            return;
       
        this._noValidate = true;
        if (oic) 
            owner._noValidate = true; 
        if (onn)
            owner.attach(this);
        if (data)
            sys.propSet(this, data, owner);
        this.calcClassNames();
        this._noValidate = false;
        if (oic) {
            owner._noValidate = false;
            this.invalidate();
            owner.invalidate();
        }		
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
			this._subCtls.push(component);
			this._wrapper.appendChild(component._element);
			component.checkEvents();
			this.contentChanged();
		}
		return true;
	}

    /*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	Detaches a member component from the TControl.
	  ARGS:	
		component	: TComponent    : member component to detach. :DEF: null.
	  RETV:         : Boolean       : True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null) {
		var i;

		if (!super.detach(component))
			return false;
		if (component instanceof TControl) {
            i = this._subCtls.indexOf(component);
            if (i !== -1)
                this._subCtls.splice(i, 1);
            if (component._element.parentNode === this._wrapper)
                this._wrapper.removeChild(component._element);
            component.checkEvents();
            this.contentChanged();
        }
		return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: invalidate
	  TASK: Invalidates current render status of control. 
	——————————————————————————————————————————————————————————————————————————*/
	invalidate() {
		if (this._invalid || this._noValidate)
			return;
		this._invalid = true;
		core.display.addRenderQueue(this);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: contentChanged.
	  TASK: Invalidates control flagging with content change. 
	——————————————————————————————————————————————————————————————————————————*/
	contentChanged() {
		if (this._cContent)
			return;
		this._cContent = true;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: classesChanged.
	  TASK: Invalidates control flagging with element classes change. 
	——————————————————————————————————————————————————————————————————————————*/
	classesChanged() {
		if (this._cClasses)
			return;
		this._cClasses = true;
		this.invalidate();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: coordsChanged.
	  TASK: Coordinate change dispatcher.
	——————————————————————————————————————————————————————————————————————————*/
	coordsChanged() {
        if (this._cLocated)
			return;
		this._cLocated = true;
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
			cClas,
			cCont,
            cRelo;

		if (!this._sta)
			return;
		shade = this._shadowed;
		cClas = this._cClasses;
		cCont = this._cContent;
        cRelo = this._cLocated;
        this._invalid = false;
        this._shadowed = {};
		this._cClasses = false;
		this._cContent = false;
        this._cLocated = false;
        if (this._wrapper !== this._element) {
            style = this._wrapper.style;
            style.height = '' + this.innerH + 'px';
            style.width = '' + this.innerW + 'px'; 
            if (shade.visibility)
                style.visibility = shade.visibility;
        }
        style = this._element.style;
		for(index in shade)
			style[index] = shade[index];
		if (!this._ctlState)
			return;
		if (cClas)
			this._element.className = this._sClass;
        if (cRelo)
            this.relocate();
		if (cCont)
			this.renderContent();
        this.recalculate();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the control content. Called by render before new frame.
	  INFO: This is used when a special HTML content is needed to be rendered.
            This is a placeholder method to override.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() { }

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
    FUNC: calcClassNames [private].
    TASK: Calculates control element class names.
    INFO: Invalidates the control.
    ——————————————————————————————————————————————————————————————————————————*/
    calcClassNames() {
        var t = this,
            c = t.class.name + ((t._styleRoot !== null) ? t._styleRoot : ''),
            s = t.stateName;

        function calcSub(n){
            if (typeof n === 'string') 
                return ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s;
            return '';
        }
        
        t._sClass  = t._nam + ' '+ c + ' ' + c + s;
        t._sClass += calcSub(t._styleSize);
        t._sClass += calcSub(t._styleColor);
        t._sClass += calcSub(t._styleExtra);
        t.classesChanged();
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: relocate
	  TASK: 
		Notifies owner if it is relocated.
		Notifies members if it is resized.		
      INFO: Called from render.
	—————————————————————————————————————————————————————————————————————————*/
	relocate() {
		var	c;

		if (this._own instanceof TControl)
			this._own.doMemberRelocate(this);
		if (this._oW === this._w && this._oH === this._h)
			return;
		for(c of this._subCtls)
			c.doOwnerResize();
		this._oW = this._w;
		this._oH = this._h;
	}

    /*——————————————————————————————————————————————————————————————————————————
		_setX, _setY, _setW, _setH:
		*	Are raw calls which do not make alignment or auto checkings.
		*	Operate on shadowed style values only.
		*	No relocation dispatching and invalidation is done.
		*	They return true only if coordinates change.
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
		this._shadowed.left = '' + x +'px';
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
		this._shadowed.top = '' + y +'px';
		return true;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setW [protected].
	  TASK: 
		Sets the width of control without auto Width checking.
	  ARGS:
		w	: number	: Width value in pixels.
	  RETV: : boolean	: true if width changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setW(w = 0) {
		if (typeof w !== "number" || this._w === w || w < 0)
			return false;
		this._w = w;
		this._shadowed.width = '' + w +'px';
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setH [protected].
	  TASK: 
		Sets the height of control without auto Height checking.
	  ARGS:
		h	: number	: Height value in pixels.
	  RETV: : boolean	: true if height changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setH(h = 0) {
		if (typeof h !== "number" || this._h === h || h < 0)
			return false;
		this._h = h;
		this._shadowed.height = '' + h +'px';
		return true;
	}

/*——————————————————————————————————————————————————————————————————————————
      FUNC: maxContainableInnerW.
      TASK: This finds the maximum containable inner width for the control.
      RETV:     : number : maximum containable inner width for the control.
      INFO: Tries to find maximum width that can be contained in control.
            This maximum is according to the containers of the control.
    ——————————————————————————————————————————————————————————————————————————*/
    maxContainableInnerW() {
    	var t = this,
            mw,     // max width.
            aw,     // autoW.
            ax,     // autoX.
            co = 0; // carve out from max.

    	while(t instanceof TControl) {
            aw = TCtl.autoValue(t._autoW); 
            if (aw === 'max')
                return 40960;   // big enough.
    		mw = t.innerW;
            ax = TCtl.autoValue(t._autoX);
            if (ax !== 'left' &&
                ax !== 'center' && 
                ax !== 'right')
                co += t._x;
    		if (aw !== 'fit')
    			break;
            co += t._shellW;
    		t = t._own;
    	}
    	return mw - co;
    }
    /*——————————————————————————————————————————————————————————————————————————
      FUNC: maxContainableInnerH.
      TASK: This finds the maximum containable inner height for the control.
      RETV:     : number : maximum containable inner height for the control.
      INFO: Tries to find maximum height that can be contained in control.
            This maximum is according to the containers of the control. 
    ——————————————————————————————————————————————————————————————————————————*/
    maxContainableInnerH() {
    	var t = this,
            mh,     // max.
            ay,     // autoY.
            ah,     // autoH.
            co = 0; // carve out from max.

    	while(t instanceof TControl) {
            ah = TCtl.autoValue(t._autoH);
            if (ah === 'max')
                return 40960;   // big enough.
    		mh = t.innerH;
    		ay = TCtl.autoValue(t._autoY);
            if (ay !== 'top' &&
                ay !== 'center' && 
                ay !== 'left')
                co += t._y;
    		if (ah !== 'fit')
    			break;
            co += t._shellH;
    		t = t._own;
    	}
    	return mh - co;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxW [protected].
      TASK: This finds the maximum control width required for the content.
      RETV:     : number : maximum control width for the content.
      INFO: 
        *   *May* be called by autoFitW or autoMaxW. 
        *   When autoW is "fit" or "max", tries to find maximum control
            width required for contents ignoring any boundaries.
        *   This maximum is according to the contents of the control.
        *   To be overridden by control classes.
      WARN: This method may not be implemented in several control classes.
            Specially when calculation is done via css.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
    	return this._w;         
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxH [protected].
      TASK: This finds the maximum control height required for the content.
      RETV:     : number : maximum control height required for the content.
      INFO: 
        *   *May* be called by autoFitW or autoMaxW.   
        *   When autoH is "fit" or "max", tries to find maximum control 
            height required for contents ignoring any boundaries.
        *   This maximum is according to the contents of the control.
        *   To be overridden by control classes.
      WARN: This method may not be implemented in several control classes.
            Specially when calculation is done via css.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxH() {
    	return this._h;         
    }


    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitW [protected].
	  TASK:	Adjusts the width of control regarding its owner and its content.
	  RETV:     : boolean	: true if width change is in shadowed style.
      INFO: 
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "fit".
        *   Controls override this according to their way of calculating
            and fitting their content into available or possible width.
        *   Calculations may be done directly by setting css.
            In that case width must be obtained via this._computed then
            function must set this._w if it changes and return true.  
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoFitW() {   // this is a general case algorithm for most controls.
        var t = this,
            n,      // max needed width . 
            p;      // max possible width.

		if (t._caW !== "fit")
			return false;
        n = t._maxW();
        if (n === t._w)                     // need nothing.
            return ;
        if (n < t._w)                       // need shrinking ?
            return t._setW(n);
                                            // need growing.
        p = t.maxContainableInnerW() + t._shellW;   
        t._setW((n > p) ? p : n);    
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitH [protected].
	  TASK:	Adjusts the height of control regarding its owner and its content.
	  RETV:     : boolean	: true if height change is in shadow style.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust() when autoH resolves to "fit".
        *   Controls override this according to their way of calculating
            and fitting their content into available or possible height.
        *   Calculations may be done directly by setting css.
            In that case width must be obtained via this._computed then
            function must set this._h if it changes and return true.   
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoFitH() {
		var t = this,
            n,      // max needed height. 
            p;      // max possible height.

		if (t._caH !== "fit")
			return false;
        n = t._maxH();
        if (n === t._h)                     // need nothing.
            return;
        if (n < t._h)                       // need shrinking ?
            return t._setH(n);
                                            // need growing.
        p = t.maxContainableInnerH()+ t._shellH;   
        t._setH((n > p) ? p : n);    
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxW [protected].
	  TASK:	Adjusts the width of control regarding its content only.
	  RETV:     : boolean	: true if width change is in shadowed style.
      INFO: 
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "max".
        *   Controls override this according to their way of calculating
            their maximum width.
        *   Calculations may be done directly by setting css.
            In that case width must be obtained via this._computed then
            function must set this._w if it changes and return true.   
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxW() {
        var t = this;

		if (t._caW !== "max")
			return false;
        return t._setW(t._maxW());
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxH [protected].
	  TASK:	Tries to fit height of control.
	  RETV:     : boolean	: true if height change is in shadow style.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust().
        *   Controls override this according to their way of calculating
            their maximum height.
        *   Calculations may be done directly by setting css.
            In that case width must be obtained via this._computed then
            function must set this._h if it changes and return true.  
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxH() {
		var t = this;

		if (t._caH !== "max")
			return false;
        return false;
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
			aw, ah,
            ax, ay, 
           	ar, ab; 
  
        if (!(o instanceof TControl))
            return false;
		dx = o._w - o._oW;
		dy = o._h - o._oH;
		aw = (t._autoW) ? calcAutoW(t, o.innerW) : false;   // this should be first.
		ah = (t._autoH) ? calcAutoH(t, o.innerH) : false;   // this should be second.
		ax = (t._autoX) ? calcAutoX(t, o.innerW) : false;
		ay = (t._autoY) ? calcAutoY(t, o.innerH) : false;
		ar = (dx && t.anchorRight)  ? (t.anchorLeft) ? t._setW(t, t._w + dx) : t._setX(t, t._x + dx) : false;
		aw = (dy && t.anchorBottom) ? (t.anchorTop)  ? t._setH(t, t._h + dy) : t._setY(t, t._y + dy) : false;
		aw = (aw || ah || ax || ay || ar || ab);
		if (aw)
			t.coordsChanged();
		return aw;
	}

    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: checkEvents.
	  TASK: Checks state of control & then decides to make control interactive.
	——————————————————————————————————————————————————————————————————————————*/
	checkEvents() {
		var t = this,
            r;
	
		if (!t._sta)						// if dead...
			return;
		r = (t._visible && t._ctlState && t._ctlState !== TCtl.SLEEP && t._canFocus);
		t._element.style.pointerEvents = (r) ? 'auto': 'none';
		if (r === t._interact)			    // if no change in interactivity
			return;
		t._interact = r;
		if (t._tabIndex)
			t.invalidateContainerTabs();	// container tab order is invalid
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: setFocus.
	  TASK: Asks display to set the focus to this control.
	——————————————————————————————————————————————————————————————————————————*/
    setFocus(){
        core.display.currentControl = this;
    }
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize
	  TASK: Flags the control that viewport is resized.
	  INFO: This is a global dispatch from display control.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize() {
		var c,
			eve = this._eve.onViewportResize;

		this._viewResize = true;
		this.autoAdjust();
		this.invalidate();
		for(c of this._subCtls){
			if (c instanceof TControl)
				c.doViewportResize();
		}
		this._viewResize = false;
		return ((eve) ? eve.dispatch([this]) : null);
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
		var eve = this._eve.onMemberRelocate;
        if (member === null)
            return null;
		if (!this._viewResize)
			this.contentChanged();
		return ((eve) ? eve.dispatch([this, member]) : null);	// dispatch it
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doOwnerResize
	  TASK: Flags the control that its owner is resized.
	  INFO: Dimensions recalculated.
			Called from relocate() method of owner.
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		var eve = this._eve.onOwnerResize;
		
		if (!this._viewResize)
			this.autoAdjust();
		return ((eve) ? eve.dispatch([this]) : null);
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
		
		if (this._ctlState !== TCtl.FOCUS)
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
	doPointerMove(x, y, e) {
		var eve = this._eve.onPointerMove;	
		
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOver
	  TASK: Flags the control that it has mouse over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOver(x, y, e) {
	var eve = this._eve.onPointerOver;					// fetch event to relay
	
		this._ptrOver = true;							// flag pointer over
		if (this._ctlState === TCtl.ALIVE)				// if state is ALIVE 
			this.controlState = TCtl.HOVER;				// set it to HOVER
		return ((eve) ? eve.dispatch([this, x, y, e]) : null);	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOut() {
	var eve = this._eve.onPointerOut;					// fetch event to relay
	
		this._ptrOver = false;						    // not any more.
		if (this._ctlState === TCtl.HOVER)
			this.controlState = TCtl.ALIVE;
		return ((eve) ? eve.dispatch([this]) : null);	
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusIn
	  TASK: Flags the control that it enters focus.  
	——————————————————————————————————————————————————————————————————————————*/
	doFocusIn() {
		var eve = this._eve.onFocusIn;				    // fetch event
	
		this.controlState = TCtl.FOCUS;
		return ((eve) ? eve.dispatch([this]) : null);	// dispatch it
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusOut
	  TASK: Flags the control that it leaves focus.
	——————————————————————————————————————————————————————————————————————————*/
	doFocusOut() {
		var eve = this._eve.onFocusOut;				// fetch event
	
		if (this._ctlState == TCtl.SLEEP)
			return null;
		if (this._ctlState == TCtl.FOCUS)
			this.controlState = (this._ptrOver ? TCtl.HOVER : TCtl.ALIVE);
		return ((eve) ? eve.dispatch([this]) : null);	// dispatch it
	}

    /*——————————————————————————————————————————————————————————————————————————
		Properties
	——————————————————————————————————————————————————————————————————————————*/

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	x   : int;
	  GET : Returns  control x coordinate.
	  SET : Sets the control x coordinate.
	  INFO: When autoX is non-null, x becomes read only.
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
	  INFO: When autoY is non-null, y becomes read only.
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
	  PROP:	w : int;
	  GET : Returns  control width.
	  SET : Sets the control width.
	  INFO: When autoW is non-null, w becomes read only.
            If autoX is non-null, x may change too.
	——————————————————————————————————————————————————————————————————————————*/
	get w() {
		return this._w;
	}

	set w(val = 32) {
		if (this._autoW !== null)
            return;
		if (this._setW(val)) {
			if (this._autoX && this._own)	
				calcAutoX(this, this._own.innerW)
			this.coordsChanged();
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	h : int;
	  GET : Returns  control height.
	  SET : Sets the control height.
	  INFO: When autoH is non-null, h becomes read only.
            If autoX is non-null, x may change too.
	——————————————————————————————————————————————————————————————————————————*/
	get h() {
		return this._h;
	}

	set h(val = 32) {
		if (this._autoH !== null)
            return;
		if (this._setH(val)){
			if (this._autoY && this._own)	
				calcAutoY(this, this._own.innerH)
			this.coordsChanged();
		}
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoX : *.
	  GET : Returns the autoX value.
	  SET : Sets    the autoX value.
	  INFO: 
		autoX can be:
        * Viewport values object.
			The value will be extracted from object and processed like below.
		* null.
			Will not be automatic (direct assignment).
            Does nothing (coming from viewport values object) .
		* A number between 0 and 1 (exclusive) i.e: 0.5 .
			x will be set to owner inner width * autoX.
		* A number with value <= 0 or value >= 1, x = value.
		* A string:
            "left"      : Aligns the control to left.
			"right" 	: Aligns the control to right.
			"center"	: Aligns the control to center.
			Other values will be treated as a CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoX() {
		return(this._autoX);
	}

	set autoX(val = null) {
		if (setAutoValue(this, val, '_autoX', 'autoX'))
			this.autoAdjust();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoY : *.
	  GET : Returns the autoY value.
	  SET : Sets    the autoY value.
	  INFO: 
		autoY can be:
        * Viewport values object.
			The value will be extracted from object and processed like below.
		* null.
			Will not be automatic (direct assignment).
            Does nothing (coming from viewport values object) .
		* A number between 0 and 1 (exclusive) i.e: 0.2 .
			y will be set to owner inner height * autoY.
		* A number with value <= 0 or value >= 1, y = value.
		* A string: 
            "top"       : Aligns the control to top.
			"bottom" 	: Aligns the control to bottom.
			"center"	: Aligns the control to center.
			Other values will be treated as a CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoY() {
		return(this._autoY);
	}

	set autoY(val = null) {
		if (setAutoValue(this, val, '_autoY', 'autoY'))
			this.autoAdjust();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoW : *.
	  GET : Returns the auto Width value.
	  SET : Sets    the auto Width value.
	  INFO: 
		autoW can be:
        * Viewport values object.
			The value will be extracted from object and processed like below.
		* null.
			Will not be automatic (direct assignment).
            Does nothing (coming from viewport values object) .
	    * A number between (0 and 1] (0 excluded, 1 included) i.e: 0.5 .
			width will be set to owner inner width * autoW.
		* A number with value = 0 or value >= 1, width = value.
		* A string: 
            "fit" : 
                Control width will be limited by maximum possible owner width
                and x position then will try to fit the content.
            "max" : 
                Control width will be adjusted according to the content size 
                directly. 
			Other values will be treated as CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoW() {
		return(this._autoW);
	}

	set autoW(val = null) {
		if (setAutoValue(this, val, '_autoW', 'autoW'))
			this.autoAdjust();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	autoH : *.
	  GET : Returns the auto Height value.
	  SET : Sets    the auto Height value.
	  INFO: 
		autoH can be:
        * Viewport values object.
			The value will be extracted from object and processed like below.
		* null.
			Will not be automatic (direct assignment).
            Does nothing (coming from viewport values object) .
		* A number between (0 and 1] (0 excluded, 1 included) i.e: 1/3 etc.
			height will be set to owner inner height * autoH.
		* A number with value = 0 or value >= 1, height = value.
		* A string:
            "fit" : 
                Control height will be limited by maximum possible owner height
                and y position then will try to fit the content.
            "max" : 
                Control height will be adjusted according to the content size 
                directly. 
			Other values will be treated as CSS property.
	——————————————————————————————————————————————————————————————————————————*/
	get autoH() {
		return(this._autoH);
	}

	set autoH(val = null){
		if (setAutoValue(this, val, '_autoH', 'autoH'))
			this.autoAdjust();
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
		this._shadowed.zIndex = '' + val;
		this.invalidate();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: shellW : number.
	  GET : Gets the computed sum of control padding and border width.
	——————————————————————————————————————————————————————————————————————————*/
	get shellW() {
		return this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: shellH : number.
	  GET : Gets the computed sum of control padding and border height.
	——————————————————————————————————————————————————————————————————————————*/
	get shellH() {
		return this._shellH;	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerW : number.
	  GET : Gets the computed control inner width.
	——————————————————————————————————————————————————————————————————————————*/
	get innerW(){
		return this._w - this._shellW;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: innerH : number.
	  GET : Gets the computed control inner height.
	——————————————————————————————————————————————————————————————————————————*/
	get innerH() {
		return this._h - this._shellH;
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
		this._shadowed.opacity = '' + val;
		this.invalidate();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	controlState : int;
	  GET : Returns control state.
	  SET : Sets the control state and assigns the respective styles
			  to the control element class. 
	——————————————————————————————————————————————————————————————————————————*/
	get controlState() {
		if (this._sta === sys.SAVE)
			return((this._ctlState === TCtl.SLEEP) ? TCtl.SLEEP : TCtl.ALIVE);
		return(this._ctlState);
	}
		
	set controlState(val = 0){
		if (typeof val !== 'number' || 
			val < TCtl.DYING ||
			val > TCtl.SLEEP || 
			val === this._ctlState)
			return;
		this._ctlState = val;
		this.calcClassNames();
		this.checkEvents();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	canFocus : boolean;
	  GET : Returns if control is focusable.
	  SET : Sets if the control is focusable. 
	——————————————————————————————————————————————————————————————————————————*/
	get canFocus() {
		return(this._canFocus);
	}
		
	set canFocus(val = false) {
		val = !!val;
        if (this._canFocus === val)
            return;
        this._canFocus = val;
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

		if (this._visible === v)
			return;
		this._visible = v;
		this.checkEvents();
		cascadeVisible(this, this.showing);
		this.relocate(v);
		this.invalidate();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	enabled : Boolean;
	  GET : Returns  control enabled state.
	  SET : Sets the control enabled state.
	——————————————————————————————————————————————————————————————————————————*/
	get enabled() {
		return this._ctlState != TCtl.SLEEP;
	}

	set enabled(val = true) {
		var c;

		val = !!val;
		if (val === (this._ctlState !== TCtl.SLEEP))
			return;
		this.controlState = (val) ? TCtl.ALIVE : TCtl.SLEEP;
		for(c of this._ctl)
			c.enabled = val;
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
	  PROP:	styleRoot : String;
	  GET : Returns  control root style prefix if exists.
	  SET : Sets the control root style prefix.
      INFO: Defaults to null when value is not a string or string is empty.
	——————————————————————————————————————————————————————————————————————————*/
	get styleRoot() {
		return this._styleRoot;
	}

	set styleRoot(val = null) {
		if (this._styleRoot === val)
			return;
		this._styleRoot = sys.str(val) ? val : null;
		this.calcClassNames();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleExtra : String;
	  GET : Returns  control extra style name if exists.
	  SET : Sets the control extra style name.
      INFO: Defaults to null when value is not a string or string is empty.
	——————————————————————————————————————————————————————————————————————————*/
	get styleExtra() {
		return this._styleExtra;
	}

	set styleExtra(val = null) {
		if (this._styleExtra === val)
			return;
        this._styleExtra = sys.str(val) ? val : null;
		this.calcClassNames();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleColor : String;
	  GET : Returns  control color style name if exists.
	  SET : Sets the control color style name.
      INFO: If value is not a color style name, set does not work.
	——————————————————————————————————————————————————————————————————————————*/
	get styleColor() {
		return this._styleColor;
	}

	set styleColor(val = null) {
		if (this._styleColor === val || !styler.isColorStyleName(val))
			return;
		this._styleColor = val;
		this.calcClassNames();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleSize : String;
	  GET : Returns  control size style name if exists.
	  SET : Sets the control size style name.
      INFO: If value is not a size style name, set does not work.
	——————————————————————————————————————————————————————————————————————————*/
	get styleSize() {
		return this._styleSize;
	}

	set styleSize(val = null) {
		if (this._styleSize === val || !styler.isSizeStyleName(val))
			return;
		this._styleSize = val;		// set style size name
		this.calcClassNames();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: container: TContainer.
	  GET : Returns the container of the control or null.
	——————————————————————————————————————————————————————————————————————————*/
	get container() {
		var o = this._own; 
	
		while(o instanceof TControl) {
			if (o instanceof TContainer)
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

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	showing : Boolean;
	  GET : Returns control logical visibility state.
	  INFO: 
		When visible is set to true: 
		If all controls in owner chain are visible showing will be true.
        Note that a visible control may not be in the visual area of the
        screen.
	——————————————————————————————————————————————————————————————————————————*/
	get showing() {
		var t = this;
		while(t instanceof TControl){
			if (!t._visible)				// if invisible
				return(false);
			if (t === display)			// if display
				return(true);
			t = t._own;
		}
		return false;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: stateName [string]
	  GET : Returns the control state name.
    ——————————————————————————————————————————————————————————————————————————*/
    get stateName() {
        return TCtl.stateNames[this._ctlState];
    }

}

/*——————————————————————————————————————————————————————————————————————————
  Private functions.
——————————————————————————————————————————————————————————————————————————*/

/*——————————————————————————————————————————————————————————————————————————
  FUNC: cascadeShowing [private].
  TASK: Sets control and sub control style visibilities.
  ARGS:
	t 			: TControl	: TControl to set visibility.
	showing		: bool		: Visibility state.
——————————————————————————————————————————————————————————————————————————*/
function cascadeVisible(t, showing = false) {
	var c,
		v = (showing) ? 'visible': 'hidden';

	if (t._element.style.visibility !== v) {
		t._shadowed.visibility = v;
		t.invalidate();
	}
	for(c of t._subCtls) 
		cascadeVisible(c, (showing) ? c._visible : false);
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: setAutoValue [private].
  TASK: 
	Sets automatic values to automatic properties.
  ARGS:
    t       : TControl  : The control to set auto value.
	val		: number	: Value as number.
			: string	: Value as string.
			: object	: Value as viewport value object.
	pvar	: string	: Protected var name associated to property.
	prop	: string	: Property setter name (for exception info).
    numOk   : boolean   : Value can be a number when true :DEF: true.
    strOk   : boolean   : Value can be a string when true :DEF: true.
  RETV: 	: boolean	: true if autoAdjust required.
——————————————————————————————————————————————————————————————————————————*/
function setAutoValue(t, val = null, pvar, prop, numOk = true, strOk = true) {
    var	typ = typeof val;
    
	if (val === t[pvar])    // If no change,
		return false;		// no autoAdjust required.
	if (val === null) {     // If disabling auto value
		t[pvar] = null;     // disable it,
		return false;		// no autoAdjust required.
	}
	if (strOk && typ === "string") {
		sys.str(val, t.namePath + '.' + prop, 'E_INV_VAL');
		t[pvar] = val;
		return true;		// autoAdjust required.
	}
	if (numOk && typ === "number") {
		t[pvar] = val;
		return true;        // autoAdjust required.
	}
	if (val.constructor === Object && TCtl.vpCheck(val)) {
		t[pvar] = Object.assign({}, val);
		return true;		// autoAdjust required.
	}
    exc('E_INV_VAL',  t.namePath + '.' + prop);
    return false;           // never executes.        
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: cssX [private].
  TASK: 
	Sets the x (left) of control according to CSS value given.
  ARGS: 
  	t 	    : TControl : (this).
	val	    : string   : CSS value.
  RETV: 	: boolean  : true if x changes.
——————————————————————————————————————————————————————————————————————————*/
function cssX(t, val){
    var s =  t._element.style,
        c =  t._computed;

    if (s.left !== val) 
        s.left = val;			                // reflow
    val = parseFloat(c.left || '0');
    if (t._x === val) 
        return false;
    t._x = val;
    return true; 	        
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: cssY [private].
  TASK: 
	Sets the y (top) of control according to CSS value given.
  ARGS: 
  	t 	    : TControl : (this).
	val	    : string   : CSS value.
  RETV: 	: boolean  : true if width changes.
——————————————————————————————————————————————————————————————————————————*/
function cssY(t, val){
    var s =  t._element.style,
        c =  t._computed;

        if (s.top !== val) 
            s.top = val;			                // reflow
        val = parseFloat(c.top || '0');
        if (t._y === val) 
            return false;
        t._y = val;
        return true; 	        
}



/*——————————————————————————————————————————————————————————————————————————
  FUNC: cssW [private].
  TASK: 
	Sets the width of control according to CSS value given.
  ARGS: 
  	t 	    : TControl : (this).
	val	    : string   : CSS value.
  RETV: 	: boolean  : true if width changes.
——————————————————————————————————————————————————————————————————————————*/
function cssW(t, val) {
    var s = t._element.style,
        l = s.left;

    if (s.width !== val) {     
        if (t._wrapper !== t._element)
            t._wrapper.style.width = val;	    // reflow
        s.width = val;			                // reflow	
    }
    val = parseFloat(t._computed.width || '0');
    if (t._w === val) 
        return false;
    t._w = val;
    return true;    
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: cssH [private].
  TASK: 
	Sets the height of control according to CSS value given.
  ARGS: 
  	t 	    : TControl : (this).
	val	    : string   : CSS value.
  RETV: 	: boolean  : true if height changes.
——————————————————————————————————————————————————————————————————————————*/
function cssH(t, val) {
    var s = t._element.style;

    if (s.height !== val) {
        s.height = val;			            // reflow
        if (t._wrapper !== t._element)
            t._wrapper.style.height = val;	// reflow	
    }
    val = parseFloat(t._computed.height || '0');
    if (t._h === val)
        return false; 
    t._h = val;
    return true;
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoX [private].
  TASK: 
	Calculates and sets the x coordinate of control according to autoX.
  ARGS: 
  	t			: TControl : Control object.
	ownerWidth	: number   : Inner width of owner.
  RETV: 		: boolean  : true if x changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoX(t, ownerWidth){
	var val = TCtl.autoValue(t._autoX);

    if (val === null)
		return false;
	switch(typeof val){
	case "number":
		return t._setX((val <= 0 || val >= 1) ? val : ownerWidth * val);
	case "string": 
		switch(val) {
        case "left":
            return t._setX(0);
		case "right":
			return t._setX(ownerWidth - t._w);
		case "center":
			return t._setX((ownerWidth - t._w) / 2);
		default:
            return cssX(t, val);
		}
    default:
	}
	return false;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoY [private].
  TASK:
	Calculates and sets the y coordinate of control according to autoY.
  ARGS: 
	t			: TControl : Control object.
	ownerHeight	: number   : Inner height of owner.
  RETV: 		: boolean  : true if y changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoY(t, ownerHeight){
	var val = TCtl.autoValue(t._autoY);

    if (val === null)
		return false;
	switch(typeof val) {
	case "number":
		return t._setY((val <= 0 || val >= 1) ? val : ownerHeight * val);
	case "string":
		switch(val) {
        case "top":
            return t._setY(0);
		case "bottom":
			return t._setY(ownerHeight - t._h);
		case "center":
			return t._setY((ownerHeight - t._h) / 2);
		default:
			return cssY(t, val);
		}
    default:
	}
	return false;
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoW [private].
  TASK: 
	Calculates and sets the width of control according to autoW.
  ARGS: 
  	t 			: TControl : (this).
	ownerWidth	: number  : inner width of owner.
  RETV: 		: boolean : true if width changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoW(t, ownerWidth) {
	var w = TCtl.autoValue(t._autoW); 

	t._caW = w;
	if (w === null)
		return false;
	switch(typeof w){
	case "number": 
		return t._setW((w > 1) ? w : w * ownerWidth);
	case "string":
        switch(w) {
        case "fit":
            return t._autoFitW();
        case "max":
            return t._autoMaxW();    
        default:
		    return cssW(t, w);
        }
    default:
	}
	return false;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcAutoH [private].
  TASK: Calculates control height.
  ARGS: 
	t			: TControl : (this).
	ownerHeight	: number  : Inner height of owner.
  RETV: 		: boolean : true if height changes.
——————————————————————————————————————————————————————————————————————————*/
function calcAutoH(t, ownerHeight){
	var h = TCtl.autoValue(t._autoH);

	t._caH = h;
	if (h === null)
		return false;
	switch(typeof h) {
	case "number": 
		return t._setH((h > 1) ? h : h * ownerHeight);
	case "string":
        switch(h) {            
        case "fit":
            return t._autoFitH();
        case "max":
            return t._autoMaxH();    
        default:
		    return cssH(t, h);
        }
	default:
    }
	return false;
}


/*——————————————————————————————————————————————————————————————————————————
  FUNC: makeElements [private].
  TASK: Builds and binds a document object model elements to control.
  INFO: Containers have inner wrappers.
——————————————————————————————————————————————————————————————————————————*/
function makeElements(t) {
    var e = t.class.elementTag,
        w = t.class.wrapperTag;

    function elementMaker(tag = null) {
        var dom;
       
        if (tag === null)
            return null;
        dom = (tag !== 'body') ? document.createElement(tag) : document.body;
        dom.ToreJS_Control = t;
        return dom;
    }

    sys.str(e, t.class.name + ": static elementTag = ?","E_CTL_NO_DOM");
    t._wrapper = elementMaker(w);
    t._element = elementMaker(e);
    t._computed = window.getComputedStyle(t._element);    
    if (t._wrapper === null) {
        t._wrapper = t._element;
        return;
    }         
    t._element.appendChild(t._wrapper);
    t._wrapper.style.position = 'relative';       
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: killElements [private].
  TASK: Frees control from its document object model elements.
——————————————————————————————————————————————————————————————————————————*/
function killElements(t) {

    function elementKiller(dom = null) {
        if (!dom)
            return;
        if (typeof dom.ToreJS_Control === 'undefined')
            return;
        delete(dom.ToreJS_Control);	
        if (dom !== document.body){ 
            if (dom.parentNode)
                dom.parentNode.removeChild(dom);
            dom = null;
        }
    }
    elementKiller(t._wrapper);
    elementKiller(t._element);
}

sys.registerClass(TControl);
