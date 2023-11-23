/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230309
  Author	: 	IVT : İhsan V. Töre
  About		: 	TControl.js: Tore Js base visual component (control) class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { core, sys, exc, TComponent } from "../lib/index.js";
import { TCtl, TContainer, TPanel, styler }   from "../ctl/index.js";

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
    _oX = 0;                    // Previous x.
    _oY = 0;                    // Previous y.
    _oW = 0;				    // Previous width.
	_oH = 0;			        // Previous height.
    _caW = null;                // computed autoW.
    _caH = null;                // computed autoH.

    // These are for direct CSS values, used during render.
    // if one of these are set _cCssWait flag must be set too.
    // Look _calcAuto, _calcCss and render.    
    _cvW = null; 
    _cvH = null;                // css render value for height.
    _cvX = null;                // css render value for x (left).
    _cvY = null;                // css render value for y (top).
    _cpW = false;               // css parse flag for width.
    _cpH = false;               // css parse flag for height.
    _cpX = false;               // css parse flag for x (left).
    _cpY = false;               // css parse flag for y (top).
    

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
    _cCssWait = false;          // css direct change pending flag.     

    // Dom
    _element = null;            // Dom element (outer).
    _wrapper = null;            // Dom wrapper element (inner) if exists.
   
    // Css
    _computed = null;           // Current element computed style.
    _shadowed = {};             // Future shadowed style.
    _sRoot = null;              // Style Root prefix
    _sSize = "Medium";		    // Size style name.
    _sColor = "First";		    // Color style name.
    _sExtra = null;			    // Style Extra name. 
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
        this._makeElements();
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
		this._killElements();
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
	  FUNC: render
	  TASK: This draws the control. Called by display before new frame.
	——————————————————————————————————————————————————————————————————————————*/
	render() {
		var t = this,
            idx,
            cmp = t._computed,
			sha = t._shadowed,
            wrp = t._wrapper.style,
			sty = t._element.style,
			cla = t._cClasses,
			con = t._cContent;

        if (!t._sta)
			return;

        t._shadowed = {};
        t._cClasses = false;
        t._cContent = false;
        t._invalid = false;

        if (t._cCssWait) {
            t._cCssWait = false;
            if (t._cvW)
                sty.width = t._cvW;
            if (t._cvH) 
                sty.height = t._cvH;
            if (t._cvX) 
                sty.left = t._cvX;
            if (t._cvY) 
                sty.top = t._cvY;
            if (t._cpW)
                t._w = parseFloat(cmp.width || '0');
            if (t._cpH)
                t._h = parseFloat(cmp.height || '0');
            if (t._cpX)
                t._x = parseFloat(cmp.left || '0');
            if (t._cpY)
                t._y = parseFloat(cmp.top || '0');
            t._cvW = t._cwH = t._cwX = t._cvY = null;
            t._cpW = t._cpH = t._cpX = t._cpY = false; 
        }
		
        if (wrp !== sty) {
            wrp.width  = '' + (t._w - t._shellW) + 'px'; 
            wrp.height = '' + (t._h - t._shellH) + 'px';
            if (sha.visibility)
                wrp.visibility = sha.visibility;
        }
		for(idx in sha)
			sty[idx] = sha[idx];
		if (cla)
			t._element.className = t._sClass;
        if (con)
			t.renderContent();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the control content. Called by render before new frame.
      INFO: To be overridden by controls manipulating the DOM. 
      WARN: After content rendering, autoAdjust() is required. 
            Call super.renderContent() or if it is so different from ascendant
            control, call autoAdjust() directly.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() {  
        this.autoAdjust();
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: recalculate.
	  TASK: Called by display, this calculates the necessary values for
			the control after rendering.
            Notifies owner if control is relocated.
		    Notifies members if control is resized.
      WARN: Do not meddle.		
	——————————————————————————————————————————————————————————————————————————*/
	recalculate() {
		var t = this,
            c = t._computed,
            p,
            s;

		if (!t._sta)
			return;
            
        t._shellW = 
			parseFloat(c.paddingLeft || '0') +
			parseFloat(c.paddingRight || '0') +
			parseFloat(c.borderLeftWidth || '0') +
			parseFloat(c.borderRightWidth || '0');

		t._shellH = 
			parseFloat(c.paddingTop || '0') +
			parseFloat(c.paddingBottom || '0') +
			parseFloat(c.borderTopWidth || '0') + 
			parseFloat(c.borderBottomWidth || '0'); 

        p = (t._oX !== t._x || t._oY !== t._y);
        s = (t._oW !== t._w || t._oH !== t._h); 
        
        if ((p || s) && t._own instanceof TControl)
			t._own.doMemberRelocate(t);

		if (s) {
			for(c of t._subCtls)
			    c.doOwnerResize(t);
        }
      
        t._oX = t._x;
        t._oY = t._y;
        t._oW = t._w;
        t._oH = t._h;
	
	}

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: calcClassNames [private].
      TASK: Calculates control element class names.
      INFO: Invalidates the control.
    ——————————————————————————————————————————————————————————————————————————*/
    calcClassNames() {
        var t = this,
            c = t.class.name + ((t._sRoot !== null) ? t._sRoot : ''),
            s = t.stateName;

        function calcSub(n){
            if (typeof n === 'string') 
                return ' ' + n + ' ' + n + s + ' ' + c + n + ' ' + c + n + s;
            return '';
        }
        
        t._sClass = ' '+ c + ' ' + c + s +
                    calcSub(t._sSize) +
                    calcSub(t._sColor) +
                    calcSub(t._sExtra);
        t.classesChanged();
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
            mw,             // max width.
            aw,             // autoW.
            ax,             // autoX.
            op,             // owner panel if any.
            co = 0;         // carve out from max.

    	while(t instanceof TControl) {
            aw = TCtl.autoValue(t._autoW); 
            if (aw === 'max')
                return 40960;   // big enough.
    		mw = t.innerW;
            ax = TCtl.autoValue(t._autoX);
            ax = (ax) && (ax === 'left' || ax === 'center' || ax === 'right');
            if (!ax) {
                op = (t._own instanceof TPanel) ? t._own : null;
                ax = (
                    op && !op._wrap && 
                    op._layout !== 'none' && 
                    op._sequence && 
                    op._sequence.indexOf(t._nam) > -1
                )                    
            }     
            if (!ax)
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
            op,     // owner panel if any.
            co = 0; // carve out from max.

    	while(t instanceof TControl) {
            ah = TCtl.autoValue(t._autoH);
            if (ah === 'max')
                return 40960;   // big enough.
    		mh = t.innerH;
    		ay = TCtl.autoValue(t._autoY);
            ay = (ay) && (ay === 'top' || ay === 'center' || ay === 'left');
            if (!ay) {
                op = (t._own instanceof TPanel) ? t._own : null;
                ay = (
                    op && !op._wrap && 
                    op._layout !== 'none' && 
                    op._sequence && 
                    op._sequence.indexOf(t._nam) > -1
                )                    
            }     
            if (!ay)
                co += t._y;
    		if (ah !== 'fit')
    			break;
            co += t._shellH;
    		t = t._own;
    	}
    	return mh - co;
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
		aw = (t._autoW) ? t._calcAutoW() : false;   // this should be first.
		ah = (t._autoH) ? t._calcAutoH() : false;   // this should be second.
		ax = (t._autoX) ? t._calcAutoX() : false;
		ay = (t._autoY) ? t._calcAutoY() : false;
		ar = (dx && t.anchorRight)  ? (t.anchorLeft) ? t._setW(t, t._w + dx) : t._setX(t, t._x + dx) : false;
		ab = (dy && t.anchorBottom) ? (t.anchorTop)  ? t._setH(t, t._h + dy) : t._setY(t, t._y + dy) : false;
		aw = (aw || ah || ax || ay || ar || ab);
		if (aw)
			t.invalidate();
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
		r =(t._visible && t._ctlState && t._ctlState !== TCtl.SLEEP && t._canFocus);
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
		var c;

		this._viewResize = true;
		this.autoAdjust();
		for(c of this._subCtls){
			if (c instanceof TControl)
				c.doViewportResize();
		}
		this._viewResize = false;
		return this.dispatch(this._eve.onViewportResize);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberRelocate
	  TASK: Flags the control that its member is resized or repositioned.
	  ARGS: 
		member	: TControl  : Member control that is relocated.
        suppress: boolean   : Suppresses invalidation by content change.
	  INFO: 
		Dimensions recalculated.
		Called from relocate() method of member.
		During viewport resize, autoAdjust is supressed.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberRelocate(member = null, suppress = false) {
		if (member === null)
            return null;
        if (!this._viewResize || suppress)
			this.contentChanged();
		return this.dispatch(this._eve.onMemberRelocate, member);	
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doOwnerResize
	  TASK: Flags the control that its owner is resized.
	  INFO: Dimensions recalculated.
			Called from relocate() method of owner.
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		if (!this._viewResize)
			this.autoAdjust();
		return this.dispatch(this._eve.onOwnerResize);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doHit
	  TASK: Flags the control that mouse is clicking or touch tapping on it.
	——————————————————————————————————————————————————————————————————————————*/
	doHit(x, y, e) {
		if (this._ctlState != TCtl.FOCUS)
			return null;
		return this.dispatch(this._eve.onHit, x, y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doDoubleClick
	  TASK: Flags the control that mouse is double clicked on it.
	——————————————————————————————————————————————————————————————————————————*/
	doDoubleHit(x, y, e) {
		if (this._ctlState !== TCtl.FOCUS)
			return null;
		return this.dispatch(this._eve.onDoubleHit, x, y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerDown
	  TASK:	Flags the control that it has mouse pressed over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerDown(x, y, e) {
		this.setFocus();
		return this.dispatch(this._eve.onPointerDown, x, y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerUp
	  TASK: Flags the control that it has mouse released over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerUp(x, y, e) {
		this.invalidate();
		return this.dispatch(this._eve.onPointerUp, x, y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerMove
	  TASK: Flags the control that it has mouse moving over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerMove(x, y, e) {
		return this.dispatch(this._eve.onPointerMove, x, y, e);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOver
	  TASK: Flags the control that it has mouse over.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOver(x, y, e) {
		this._ptrOver = true;							// flag pointer over
		if (this._ctlState === TCtl.ALIVE)				// if state is ALIVE 
			this.controlState = TCtl.HOVER;				// set it to HOVER
        return this.dispatch(this._eve.onPointerOver, x, y, e);	
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doPointerOut
	  TASK: Flags the control that mouse leaves.
	——————————————————————————————————————————————————————————————————————————*/
	doPointerOut() {
		this._ptrOver = false;						    // not any more.
		if (this._ctlState === TCtl.HOVER)
			this.controlState = TCtl.ALIVE;
            return this.dispatch(this._eve.onPointerOut);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusIn
	  TASK: Flags the control that it enters focus.  
	——————————————————————————————————————————————————————————————————————————*/
	doFocusIn() {
		this.controlState = TCtl.FOCUS;
		return this.dispatch(this._eve.onFocusIn);	    
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doFocusOut
	  TASK: Flags the control that it leaves focus.
	——————————————————————————————————————————————————————————————————————————*/
	doFocusOut() {
		if (this._ctlState == TCtl.SLEEP)
			return null;
		if (this._ctlState == TCtl.FOCUS)
			this.controlState = (this._ptrOver ? TCtl.HOVER : TCtl.ALIVE);
		return this.dispatch(this._eve.onFocusOut);	
	}

    /*——————————————————————————————————————————————————————————————————————————
        Protected and Private methods.
        Not for mortals :D ...
    ——————————————————————————————————————————————————————————————————————————*/

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _makeElements [private].
      TASK: Builds and binds a document object model elements to control.
      INFO: Containers have inner wrappers.
    ——————————————————————————————————————————————————————————————————————————*/
    _makeElements() {
        var t = this,
            e = t.class.elementTag,
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
      FUNC: _killElements [private].
      TASK: Frees control from its document object model elements.
    ——————————————————————————————————————————————————————————————————————————*/
    _killElements(t) {
        var t = this;

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

    /*——————————————————————————————————————————————————————————————————————————
		_setW, _setH, _setX, _setY:
		*	Are raw calls which do not make alignment or auto checkings.
		*	Operate on shadowed style values only.
		*	No relocation dispatching and invalidation is done.
		*	They return true only if coordinates change.
	——————————————————————————————————————————————————————————————————————————*/
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setW [protected].
	  TASK: 
		Sets the width of control without auto Width checking.
	  ARGS:
		val	: number	: Width value in pixels.
	  RETV: : boolean	: true if width changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setW(val = 0) {
		if (typeof val !== "number" || this._w === val || val < 0)
			return false;
		this._w = val;
		this._shadowed.width = '' + val +'px';
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setH [protected].
	  TASK: 
		Sets the height of control without auto Height checking.
	  ARGS:
		val	: number	: Height value in pixels.
	  RETV: : boolean	: true if height changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setH(val = 0) {
		if (typeof val !== "number" || this._h === val || val < 0)
			return false;
		this._h = val;
		this._shadowed.height = '' + val +'px';
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setX [protected].
	  TASK: Sets the x coordinate of control without checking.
	  ARGS:	val	: number	: X coordinate value in pixels.
	  RETV:     : boolean	: true if x changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setX(val = 0) {
		if (typeof val !== "number" || this._x === val)
			return false;
		this._x = val;
		this._shadowed.left = '' + val +'px';
		return true;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: _setY [protected].
	  TASK:	Sets the y coordinate of control without checking.
	  ARGS:	val	: number	: Y coordinate value in pixels.
	  RETV:     : boolean	: true if y changes.
	——————————————————————————————————————————————————————————————————————————*/
	_setY(val = 0) {
		if (typeof val !== "number" || this._y === val)
			return false;
		this._y = val;
		this._shadowed.top = '' + val +'px';
		return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcAutoW [private].
      TASK: Calculates and sets the width of control according to autoW.
      RETV:     : boolean : true if width changes.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcAutoW() {
    	var t = this,
            val = TCtl.autoValue(t._autoW); 

    	t._caW = val;
    	if (val === null)
    		return false;
    	switch(typeof val){
    	case "number": 
    		return t._setW((val > 1) ? val : val * t._own.innerW);
    	case "string":
            switch(val) {
            case "fit":
                return t._autoFitW();
            case "max":
                return t._autoMaxW();    
            default:
    		    return t._calcAutoCss('width', '_w', '_cvW', '_cpW', val);
            }
        default:
    	}
    	return false;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcAutoH [private].
      TASK: Calculates and sets the height of control according to autoH.
      RETV:     : boolean : true if height changes.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcAutoH(){
    	var t = this,
            val = TCtl.autoValue(t._autoH);

    	t._caH = val;
    	if (val === null)
    		return false;
    	switch(typeof val) {
    	case "number": 
    		return t._setH((val > 1) ? val : val * t._own.innerH);
    	case "string":
            switch(val) {            
            case "fit":
                return t._autoFitH();
            case "max":
                return t._autoMaxH();    
            default:
    		    return t._calcAutoCss('height', '_h', '_cvH', '_cpH', val);
            }
    	default:
        }
    	return false;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcAutoX [private].
      TASK: Calculates and sets the x coordinate of control according to autoX. 
      RETV: 	: boolean  : true if x changes.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcAutoX(){
    	var t = this,
            oiw = t._own.innerW,
            val = TCtl.autoValue(t._autoX);

        if (val === null)
    		return false;
    	switch(typeof val){
    	case "number":
    		return t._setX((val <= 0 || val >= 1) ? val : oiw * val);
    	case "string": 
    		switch(val) {
            case "left":
                return t._setX(0);
    		case "right":
    			return t._setX(oiw - t._w);
    		case "center":
    			return t._setX((oiw - t._w) / 2);
    		default:
                return t._calcAutoCss('left', '_x', '_cvX', '_cpX', val);
    		}
        default:
    	}
    	return false;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcAutoY [private].
      TASK:	Calculates and sets the y coordinate of control according to autoY.
      RETV: 	: boolean  : true if y changes.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcAutoY(t, oih){
    	var t = this,
            oih = t._own.innerH,
            val = TCtl.autoValue(t._autoY);

        if (val === null)
    		return false;
    	switch(typeof val) {
    	case "number":
    		return t._setY((val <= 0 || val >= 1) ? val : oih * val);
    	case "string":
    		switch(val) {
            case "top":
                return t._setY(0);
    		case "bottom":
    			return t._setY(oih - t._h);
    		case "center":
    			return t._setY((oih - t._h) / 2);
    		default:
    			return t._calcAutoCss(t, 'top', '_y', '_cvY', '_cpY', val);
    		}
        default:
    	}
    	return false;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcAutoCss [private].
      TASK: 
    	Sets the w, h, x or y of control to CSS value given during rendering.
        Called by _calcAuto methods. 
      ARGS: 
      	attr        : string   : CSS attribute name.
        ctv         : string   : Control variable name.
        cvn         : string   : Css render variable name.
        cpn         : string   : Css render parse flag variable name.
        value       : string   : CSS value.
      RETV: 	    : boolean  : true if property changes.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcAutoCss(attr, ctv, cvn, cpn, value) {
        var t = this,
            s = t._element.style, 
            r;        

        if (s[attr] !== value) {    // If value is not set,
            t[cvn] = value;         // Set value at render.
            t[cpn] = true;          // Parse value after setting.
            t._cCssWait = true;
            return true;            // Things changed...
        }                           
        // If value is set, then get current value in *pixels*.
        r = parseFloat(t._computed[attr] || '0'); 
        if (t[ctv] === r)           // If every thing is same,
            return false;           // say no change.
        t[ctv] = r;                 // otherwise things changed
        return true;                // say it so.
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
      WARN: May not be implemented in some control classes, hence protected.
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
      WARN: May not be implemented in some control classes, hence protected.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxH() {
    	return this._h;         
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitW [protected].
	  TASK:	Adjusts the width of control regarding its owner and its content.
	  RETV:     : boolean	: true if width changes.
      INFO: 
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "fit".
        *   Controls override this according to their way of calculating
            and fitting their content into available or possible width.
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoFitW() {   // this is a general case algorithm for most controls.
        var t = this,
            n,      // max needed width . 
            p;      // max possible width.

		if (t._caW !== "fit")
			return false;
        n = t._maxW();
        p = t.maxContainableInnerW() + t._shellW;   
        return t._setW((n > p) ? p : n);    
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
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoFitH() {
		var t = this,
            n,      // max needed height. 
            p;      // max possible height.

		if (t._caH !== "fit")
			return false;
        n = t._maxH();
        p = t.maxContainableInnerH() + t._shellH;   
        return t._setH((n > p) ? p : n);    
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxW [protected].
	  TASK:	Adjusts the width of control regarding its content only.
	  RETV:     : boolean	: true if width changes.
      INFO: 
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "max".
        *   Controls override this according to their way of calculating
            their maximum width.
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxW() {
        return (this._caW === "max") ? this._setW(this._maxW()) : false;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxH [protected].
	  TASK:	Adjusts the width of control regarding its content only.
	  RETV:     : boolean	: true if height changes.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust().
        *   Controls override this according to their way of calculating
            their maximum height.
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxH() {
        return (this._caH === "max") ? this._setH(this._maxH()) : false;
	}

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _setAutoValue [private].
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
    _setAutoValue(val = null, pvar, prop, numOk = true, strOk = true) {
        var	t = this,
            typ = typeof val;
        
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
            if (t[pvar]._vp_) {
                delete t[pvar]._vp_;
                return false;
            }
    		return true;		// autoAdjust required.
    	}
        exc('E_INV_VAL',  t.namePath + '.' + prop);
        return false;           // never executes.        
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _cascadeVisible [private].
      TASK: Sets control and sub control style visibilities.
      ARGS:
    	t 			: TControl	: TControl to set visibility.
    	showing		: bool		: Visibility state.
    ——————————————————————————————————————————————————————————————————————————*/
    _cascadeVisible(showing = false) {
    	var t = this,
            c,
    		v = (showing) ? 'visible': 'hidden';
    
    	if (t._element.style.visibility !== v) {
    		t._shadowed.visibility = v;
    		t.invalidate();
    	}
    	for(c of t._subCtls) 
    		c._cascadeVisible((showing) ? c._visible : false);
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
			this.invalidate();
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
			this.invalidate();
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
			if (this._autoX)
                this.autoAdjust();
			this.invalidate();
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
		if (this._setH(val)) {
            if (this._own instanceof TControl) {
                if (this._autoY)
			        calcAutoY(this, this._own.innerW);
            }
			this.invalidate();
		}
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
		if (this._setAutoValue(val, '_autoW', 'autoW'))
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
		if (this._setAutoValue(val, '_autoH', 'autoH'))
			this.autoAdjust();
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
		if (this._setAutoValue(val, '_autoX', 'autoX'))
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
		if (this._setAutoValue(val, '_autoY', 'autoY'))
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
		var t = this,
            v = !!value;

		if (t._visible === v)
			return;
		t._visible = v;
		t.checkEvents();
		t._cascadeVisible(t.showing);
		t.invalidate();
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
		return this._sRoot;
	}

	set styleRoot(val = null) {
		if (this._sRoot === val)
			return;
		this._sRoot = sys.str(val) ? val : null;
		this.calcClassNames();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleExtra : String;
	  GET : Returns  control extra style name if exists.
	  SET : Sets the control extra style name.
      INFO: Defaults to null when value is not a string or string is empty.
	——————————————————————————————————————————————————————————————————————————*/
	get styleExtra() {
		return this._sExtra;
	}

	set styleExtra(val = null) {
		if (this._sExtra === val)
			return;
        this._sExtra = sys.str(val) ? val : null;
		this.calcClassNames();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleColor : String;
	  GET : Returns  control color style name if exists.
	  SET : Sets the control color style name.
      INFO: If value is not a color style name, set does not work.
	——————————————————————————————————————————————————————————————————————————*/
	get styleColor() {
		return this._sColor;
	}

	set styleColor(val = null) {
		if (this._sColor === val || !styler.isColorStyleName(val))
			return;
		this._sColor = val;
		this.calcClassNames();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	styleSize : String;
	  GET : Returns  control size style name if exists.
	  SET : Sets the control size style name.
      INFO: If value is not a size style name, set does not work.
	——————————————————————————————————————————————————————————————————————————*/
	get styleSize() {
		return this._sSize;
	}

	set styleSize(val = null) {
		if (this._sSize === val || !styler.isSizeStyleName(val))
			return;
		this._sSize = val;		// set style size name
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
		var t = this,
            d = core.display;

		while(t instanceof TControl){
			if (!t._visible)				// if invisible
				return(false);
			if (t === d)	                // if display
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

sys.registerClass(TControl);
