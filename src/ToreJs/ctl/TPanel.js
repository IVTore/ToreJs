/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TPanel.js: Tore Js TPanel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib/index.js";
import { ctl, TControl, TContainer } from "./index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TPanel
  TASKS: 
	TPanel is a container supporting automatic layout of sub controls.
  	
	Sub control layout is interdependant on:
		
	layout	: null or string.
			if null there is no layout.
			if 'horizontal' controls are laid horizontally.
			if 'vertical' controls are laid vertically. 
	
	wrap : boolean.
			if true controls are wrapped while laid.
			if false controls are laid linearly.

	sequence: array.
			Contains the names of controls effected from layout and 
			their laying order.

	rightToLeft : boolean.
			if true controls are laid from right to left.

	contentAlign : null or string.
			Valid when wrap is false so controls are laid linearly.
			If layout is 'horizontal' :
					if 'center', controls are vertically centered. 
					if 'bottom', controls are aligned bottom.
					else , controls are aligned top.
			If layout is 'vertical' :
					if 'center', controls are horizontally centered. 
					if 'right', controls are aligned right.
					else , controls are aligned left.

	splitX : number.
			Horizontal split distance between controls in pixels.

	splitY : number.
			Vertical split distance between controls in pixels.

	width / autoWidth and height / autoHeight:
			These are limiting factors for layout.

		1) Only members in sequence array are effected.
		2) When layout is null nothing is done.
		3) When there is layout:
			a)	If wrap is true sequenced controls will be fitted into
				panel via wrapping if their coordinates overflow.
			b)	Sequenced control autoX and autoY will be set to null.
				anchorRight and anchorBottom will be set to false.
			d)	When autoHeight or autoWidth is "fit", respective width or
				height of panel becomes dependant to both content and 
				its containers
——————————————————————————————————————————————————————————————————————————*/
export class TPanel extends TContainer {

	static canFocusWhenEmpty = false;
	static canFocusDefault = true;
	
	// Property publishing map.
	static cdta = {
		splitX		: {value: 0},
		splitY		: {value: 0},
		sequence	: {value: null},
		rightToLeft	: {value: false},
		layout		: {value: null},
		wrap		: {value: false},
		contentAlign : {value: null}
	};

	_layout = null;
	_wrap = false;
	_splitX = 0;
	_splitY = 0;
	_sequence = null;
	_rightToLeft = false;
	_contentAlign = null;
	_calculating = false;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TPanel component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new panel :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: TComponent	: Owner of the new panel if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null, init = true) {
		super(name, null, null, false);
		this._initControl(name, owner, data, init);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the control.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		if (this._sequence) {
			this._sequence.length = 0;
			this._sequence = null;
		}
		super.destroy();		// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	
		Attaches a member component to the panel, if new component 
		is a control and sequence is true it added to layout sequence.
	  ARGS:
		component	: TComponent : New member component :DEF: null.
		sequence	: boolean	: Add to layout sequence if true. :DEF: false.
	  RETV: Boolean	: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null, sequence = false) {
		if (!super.attach(component))
			return false;
		if (!(component instanceof TControl))
			return true;
		if (sequence) {
			this._sequence = this._sequence || [];
			sys.addUnique(this._sequence, component.name);
		}
		this.autoAdjust();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	
		Detaches a member component from the panel, if removed 
		component is a control, it is removed from sequence also.
	  ARGS:
		component : TComponent	: member component to detach :DEF: null.
	  RETV:			Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null){
		var i;

		if (!super.detach(component))
			return false;
		if (!(component instanceof TControl))
			return true;
		i = this.sequenceIdx(component);
		if (i !== -1)
			this._sequence.splice(i, 1);
		this.calcLayout();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberRelocate[override].
	  TASK: Flags the  TPanel that its member is resized or repositioned.
	  ARGS: 
		member	: TControl :	Member control that is relocated.
	  INFO: 
		Dimensions recalculated.
		Called from relocate() method of member.
		During viewport and layout calculation content change is supressed.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberRelocate(member = null) {
		var e = this._eve.onMemberRelocate;
	
		if (!this._vpResize && !this._calculating)
			this.contentChanged();
		return ((e) ? e.dispatch([this, member]) : null);	// dispatch it
	}
		
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: autoAdjust [override].
	  TASK: Changes the size and position of TPanel according to properties.
	  RETV: 	: Boolean : true if adjust done, false if not required.
	  INFO: Tricky.
	——————————————————————————————————————————————————————————————————————————*/
	autoAdjust() {
		var ret = super.autoAdjust();
		if (!this._calculating)
			this.calcLayout();
		return ret;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: widthToFit
	  TASK: Sets width to fit the content.
	  RETV: 	: Boolean : True if width changed.
	  INFO: This is called when autoWidth = "fit".
	——————————————————————————————————————————————————————————————————————————*/
	widthToFit() {
		return this._widthByMembers();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: heightToFit
	  TASK: Sets height to fit the content.
	  RETV: 	: Boolean : True if height changed.
	  INFO: This is called when autoHeight = "fit".
	——————————————————————————————————————————————————————————————————————————*/
	heightToFit() {
		return this._heightByMembers();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcLayout
	  TASK: Sets the coordinates of sub control(s) in panel.
	——————————————————————————————————————————————————————————————————————————*/
	calcLayout() {
		var t = this,
			s;

		if (t._layout === null || t._calculating || !t._ctlState || t._sequence === null)
			return;	
		t._calculating = true;			// Block recursions.
		s = fetchSequenced(t);
		if (s === null) {				// If nothing in sequence,
			t._calculating = false;		// Release.
			return;
		}
		if (t._layout === "horizontal") {
			if (t._wrap)
				calcHorWrapped(t, s);
			else
				calcHorLinear(t, s);
		} else {						// Vertical.
			if (t._wrap)
				calcVerWrapped(t, s);
			else
				calcVerLinear(t, s);
		}
		t.autoAdjust();			
		t._calculating = false;			// Release.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: sequenceIdx [override].
	  TASK: Finds the index of control in panel layout sequence.
	  ARGS: member	: TControl : The member control to search.
	  RETV: 		: number  : The member index in sequence or -1 if 
	  							there is no sequence or
	  							member is not a control or
								member is not a member of panel or
								member is not sequenced.
	——————————————————————————————————————————————————————————————————————————*/
	sequenceIdx(member = null){
		if (this._sequence === null || !(member instanceof TControl))
			return -1;
		return this._sequence.indexOf(member.name);
	}

	/*——————————————————————————————————————————————————————————————————————————
		TPanel get sets
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	layout : String.
	  GET : Gets layout of sequenced members.
	  SET : Sets layout of sequenced members.
	——————————————————————————————————————————————————————————————————————————*/
	get layout() {
		return this._layout;
	}

	set layout(val = null) {
		var cal;

		if (val !== null && val !== 'vertical' && val !== 'horizontal')
			return;
		if (val === this._layout)
			return;
		this._layout = val;
		if (val) 
			this.contentChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	contentAlign : String.
	  GET : Gets content alignment for layout when no wrapping.
	  SET : Sets content alignment for layout when no wrapping.
	  INFO: contentAlign is ineffective when :
	  		there is no layout or,
			wrap is true or,
			set to 'bottom' when layout is 'vertical',
			set to 'right' when layout is 'horizontal'
	——————————————————————————————————————————————————————————————————————————*/
	get contentAlign() {
		return this._contentAlign;
	}

	set contentAlign(val = null) {
		if (val !== null &&
			val !== 'center' &&
			val !== 'bottom' &&
			val !== 'right')
			return;
		
		if (val === this._contentAlign)
			return;
		this._contentAlign = val;
		if (this._layout)
			this.contentChanged();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	rightToLeft : Boolean;
	  GET : Returns the layout right to left state.
	  SET : Sets    the layout right to left state.
	————————————————————————————————————————————————————————————————————————————*/
	get rightToLeft() {
		return this._rightToLeft;
	}

	set rightToLeft(value = false) {
		value = !!value;

		if (value == this._rightToLeft)
			return;
		this._rightToLeft = value;
		this.contentChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: wrap : Boolean;
	  GET : Gets if sequenced controls are wrapped in layout when out of bounds.
	  SET : Sets if sequenced controls are wrapped in layout when out of bounds.
	——————————————————————————————————————————————————————————————————————————*/
	get wrap() {
		return this._splitY;
	}

	set wrap(value = false) {
		value = !!value;
		if (this._wrap == value) 
			return;
		this._wrap = value;
		this.contentChanged();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	sequence : Array;
	  GET : Gets layout sequence of panel.
	  SET : Sets layout sequence of panel.
	——————————————————————————————————————————————————————————————————————————*/
	get sequence() {
		return (this._sequence) ? this._sequence.concat() : null;
	}

	set sequence(val = null) {
	var n = [],								// new sequence
		c;

		if (this._sta === sys.LOAD){		// Sequence at load
			if (val)
				this._sequence = val.concat(); 
			return;
		}
		if (val === null) {
			if (this._sequence !== null) {
				this._sequence = null;
				this.invalidate();
			}
			return;
		}
		for(c in val){
			if (!(this._mem[val[c]] instanceof TControl))
				continue;
			sys.addUnique(n, val[c]);
		}
		if (n.length == 0)
			n = null;
		this._sequence = n;
		this.contentChanged();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  PROP:	splitX : uint;
	  GET : Gets horizontal splitting distance for subcontrols.
	  SET : Sets horizontal splitting distance for subcontrols.
	  INFO: Ineffective if layout is 'none'		
	——————————————————————————————————————————————————————————————————————————*/
	get splitX() {
		return this._splitX;
	}

	set splitX(value = 0) {
		if (!is.num(value) || value < 0)
			value = 0;
		if (this._splitX == value) 
			return;
		this._splitX = value;
		this.contentChanged();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  PROP:	splitY : uint;
	  GET : Gets vertical splitting distance for subcontrols.
	  SET : Sets vertical splitting distance for subcontrols.
	  INFO: Ineffective if layout is 'none'		
	——————————————————————————————————————————————————————————————————————————*/
	get splitY() {
		return this._splitY;
	}

	set splitY(value = 0) {
		if (!is.num(value) || value < 0)
			value = 0;
		if (this._splitY == value) 
			return;
		this._splitY = value;
		this.contentChanged();
	}

}

// Private methods.

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorLinearWidth
  TASK: Calculates inner width for horizontal linear layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : inner width.
  INFO: This is required when rtl = true and autoWidth = "fit".
——————————————————————————————————————————————————————————————————————————*/
function calcHorLinearWidth(pnl, seq){
	var arr = pnl._ctl,
		ctl,
		wid,
		cto = 0,
		tot = 0;
	
	for(ctl of arr) {
		if (!ctl.visible)
			continue;
		if (seq.indexOf(ctl) > -1) {
			tot += ctl._width;
		} else {
			wid = ctl._x + ctl._width;
			if (wid > cto)
				cto = wid;
		}
	}
	tot += (ctl.length - 1) * pnl._splitX;
	if (tot < cto)
		tot = cto;
	return tot;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcMinWidth
  TASK: Calculates minimum inner width for vertical linear layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner width.
——————————————————————————————————————————————————————————————————————————*/
function calcMinWidth(pnl, seq){
	var arr = pnl._ctl,
		ctl,
		wid,
		min = 0;
	
	for(ctl of arr) {
		if (!ctl.visible)
			continue;
		wid = (seq.indexOf(ctl) > -1) ? ctl._width: ctl._x + ctl._width;
		if (min < wid)
			min = wid;
	}
	return min;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcMinHeight
  TASK: Calculates minimum inner height for horizontal linear layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner height.
——————————————————————————————————————————————————————————————————————————*/
function calcMinHeight(pnl, seq){
	var arr = pnl._ctl,
		ctl,
		hei,
		min = 0;
	
	for(ctl of arr) {
		if (!ctl.visible)
			continue;
		hei = (seq.indexOf(ctl) > -1) ? ctl._height : ctl._y + ctl._height;
		if (min < hei)
			min = hei;
	}
	return min;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: commonWrapped
  TASK: Executes final common code for wrapped layouts. 
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner width.
——————————————————————————————————————————————————————————————————————————*/
function commonWrapped(pnl, seq, nsx, nsy, wid){
	var rtl = pnl._rightToLeft,
		sub,
		idx,
		len,
		chx,
		chy,
		tmp;

	len = seq.length;
	if (rtl && pnl._autoWidth === "fit") {
		wid = 0;
		for (idx = 0; idx < len; idx++) {
			tmp = nsx[idx] + seq[idx]._width;
			if (wid < tmp)
				wid = tmp;
		}
		for(sub of pnl._ctl) {
			if (seq.indexOf(sub) > -1)
				continue;
			tmp = sub._x + sub._width;
			if (wid < tmp)
				wid = tmp;
		}
	}

	for(idx = 0; idx < len; idx++){
		sub = seq[idx];
		chx = sub._setX((rtl) ? (wid - (nsx[idx] + sub._width)) : nsx[idx]);
		chy = sub._setY(nsy[idx]);
		if (chx || chy) {						// control needs rendering.
			sub.invalidate();
			pnl.doMemberRelocate(sub);
		}
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorWrapped
  TASK: Calculates subcontrol positions for wrapped horizontal layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcHorWrapped(pnl, seq) {
	var wid = pnl.maxAllowedInnerWidth(),
		top = 0,
		lft = 0,
		hei = 0,
		sub,
		nsx = [],
		nsy = [],
		idx,
		len,
	
	len = seq.length;
	for(idx = 0; idx < len; idx++){
		sub = seq[idx];
		if (lft + sub._width > wid){
			if (lft !== 0){
				top += hei + pnl._splitY;
				hei = 0;
				lft = 0;
			}
		}
		nsx.push(lft);
		nsy.push(top);
		if (hei < sub._height)
			hei = sub._height;
		lft += sub._width + pnl._splitX;
	}
	commonWrapped(pnl, seq, nsx, nsy, wid);

}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerWrapped
  TASK: This utterly unnecessary function calculates subcontrol positions 
		for wrapped vertical layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcVerWrapped(pnl, seq) {
	var hei,
		top = 0,
		lft = 0,
		wid = 0,
		sub,
		nsx = [],
		nsy = [],
		idx,
		len;

	len = seq.length;
	for(idx = 0; idx < len; idx++) {
		sub = seq[idx];
		if (top + sub._height > hei) {
			if (top !== 0) {
				lft += wid + pnl._splitX;
				wid = 0;
			}
			top = 0;
		}
		nsx.push(lft);
		nsy.push(top);
		if (wid < sub._width)
			wid = sub._width;
		top += sub._height + pnl._splitY;
	}
	commonWrapped(pnl, seq, nsx, nsy, pnl.maxAllowedInnerWidth());	
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorLinear [private].
  TASK: Calculates subcontrol positions for linear horizontal layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: contentAlign property defines vertical alignment for subcontrols.
		"center", centers, "bottom" aligns bottom, any other value is top.
——————————————————————————————————————————————————————————————————————————*/
function calcHorLinear(pnl, seq) {
	var wid,
		hei,
		rtl = pnl._rightToLeft,
		top = (pnl._contentAlign === null || pnl._contentAlign === 'right'),
		cen = (pnl._contentAlign === "center"),
		lft = 0,
		cty,
		sub,
		chx,
		chy;
	
	hei = (pnl._autoHeight === 'fit') ? calcMinHeight(pnl, seq) : pnl.innerHeight;
	wid = (pnl._autoWidth === 'fit') ? calcHorLinearWidth(pnl, seq) : pnl.innerWidth;
	for(sub of seq){
		if (top) {
			cty = 0;
		} else {
			cty = hei - sub._height;
			if (cen)
				cty /= 2;
		}
		chx = sub._setX((rtl) ? (wid - (lft + sub._width)) : lft);
		chy = sub._setY(cty);
		if (chx || chy) {
			sub.invalidate();
			pnl.doMemberRelocate(sub);
		}
		lft += sub._width + pnl._splitX;
	}
}



/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerLinear
  TASK: Calculates subcontrol positions for linear vertical layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: 
  	*	contentAlign property defines horizontal alignment for subcontrols.
		"center", centers, "right" aligns right, any other value is left.
	*	rightToLeft has no meaning in vertical linear layout.
——————————————————————————————————————————————————————————————————————————*/
function calcVerLinear(pnl, seq) {
	var wid,
		lft = (pnl._contentAlign === null || pnl._contentAlign === "bottom"),
		cen = (pnl._contentAlign === "center"),
		top = 0,
		sub,
		ctx,
		chx,
		chy;

	wid = (pnl._autoWidth === 'fit') ? calcMinWidth(pnl, seq) : pnl.innerWidth;
	for(sub of seq) {
		if (lft) {
			ctx = 0;
		} else {
			ctx = wid - sub._width;
			if (cen)
				ctx /= 2;
		}
		chx = sub._setX(ctx);
		chy = sub._setY(top);
		if (chx || chy) {
			sub.invalidate();
			pnl.doMemberRelocate(sub);
		}
		top += sub._height + pnl._splitY;
	}
}

// Builds an array of sequenced controls.
function fetchSequenced(t) {
	var s = t._sequence,
		r = [],
		n,
		c;

	if (s === undefined || s === null)
		return null;
	for(n of s) {
		c = t._mem[n];
		if (!c._visible)
			continue;
		c._autoX = null;
		c._autoY = null;
		c.anchorRight = false;
		c.anchorBottom = false;
		r.push(c);
	}
	return (r.length) ? r : null;
}

sys.registerClass(TPanel);