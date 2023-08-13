



export class TControl extends TComponent {

	

	


	

	

	
	

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



