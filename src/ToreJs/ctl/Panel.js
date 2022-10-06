/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Panel.js: Tore Js Panel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib/index.js";
import { ctl, Control, Container } from "../ctl/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Panel
  TASKS: Panel is a container supporting automatic layout of sub controls.
——————————————————————————————————————————————————————————————————————————*/
export class Panel extends Container {

	static canFocusWhenEmpty = false;

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

	_splitX = 0;
	_splitY = 0;
	_sequence = null;
	_rightToLeft = false;
	_layout = null;
	_wrap = false;
	_contentAlign = null;
	_calculating = false;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a Panel component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new panel :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: Component	: Owner of the new panel if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null, init = true) {
		super(name, null, null, false);
		if (name == sys.LOAD)
			return;
		if (init || owner || data)	
			this._initControl(owner, data);
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
		component	: Component : New member component :DEF: null.
		sequence	: boolean	: Add to layout sequence if true. :DEF: false.
	  RETV: Boolean	: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null, sequence = false) {
		if (!super.attach(component))
			return false;
		if (!(component instanceof Control))
			return true;
		if (sequence) {
			this._sequence = this._sequence || [];
			if (this.sequenceIdx(component) === -1)
				this._sequence.push(component.name);
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
		component : Component	: member component to detach :DEF: null.
	  RETV:			Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null){
		var i;

		if (!super.detach(component))
			return false;
		if (!is.control(component))
			return true;
		i = this.sequenceIdx(component);
		if (i !== -1)
			this._sequence.splice(i, 1);
		this.calcLayout();
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberRelocate[override].
	  TASK: Flags the  Panel that its member is resized or repositioned.
	  ARGS: 
		member	: Control :	Member control that is relocated.
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
	  TASK: Changes the size and position of Panel according to properties.
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
	  FUNC: widthToContent
	  TASK: Sets width to fit the content.
	  RETV: 	: Boolean : True if width changed.
	  INFO: This is called when autoWidth = "content".
	——————————————————————————————————————————————————————————————————————————*/
	widthToContent() {
		return this._widthByMembers();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: heightToContent
	  TASK: Sets height to fit the content.
	  RETV: 	: Boolean : True if height changed.
	  INFO: This is called when autoHeight = "content".
	——————————————————————————————————————————————————————————————————————————*/
	heightToContent() {
		return this._heightByMembers();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calcLayout
	  TASK: Sets the coordinates of sub control(s) in panel.
	  INFO: 
	  	Sub control layout is interdependant on	layout, sequence, rightToLeft, 
		and autosize.
		1) Only members in sequence array are effected.
		2) When layout is "none" nothing is done.
		3) When there is layout:
			a)	splitX, splitY and rightToLeft are effective.
			b)	Sub controls will be fitted into panel via wrapping if 
				their coordinates overflow.
			c)	Sub control autoX and autoY will be set to null.
	——————————————————————————————————————————————————————————————————————————*/
	calcLayout() {
		var t = this,
			c,
			s;

		if (t._layout === null || t._calculating || !t._ctlState || t._sequence === null)
			return;	
		t._calculating = true;			// Block recursions.
		s = fetchSequenced(t);
		if (s === null) {
			t._calculating = false;		// Release.
			return;
		}
		if (t._layout === "horizontal") {
			if (t._wrap || t._contentAlign === null || t._contentAlign === 'right')
				c = calcHorWrapOrTop(t, s);
			else
				c = calcHorCenterOrBottom(t, s);
		} else {						// Vertical.
			if (t._wrap || t._contentAlign === null || t._contentAlign === 'bottom')
				c = calcVerWrapOrLeft(t, s);
			else
				c = calcVerCenterOrRight(t, s);
		}
		t.autoAdjust();			
		t._calculating = false;			// Release.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: sequenceIdx [override].
	  TASK: Finds the index of control in panel layout sequence.
	  ARGS: member	: Control : The member control to search.
	  RETV: 		: number  : The member index in sequence or -1 if 
	  							there is no sequence or
	  							member is not a control or
								member is not a member or
								member is not sequenced.
	——————————————————————————————————————————————————————————————————————————*/
	sequenceIdx(member = null){
		if (this._sequence === null || !(member instanceof Control))
			return -1;
		return this._sequence.indexOf(member.name);
	}

	/*——————————————————————————————————————————————————————————————————————————
		Panel get sets
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

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	sequence : Array;
	  GET : Gets layout sequence of panel.
	  SET : Sets layout sequence of panel.
	——————————————————————————————————————————————————————————————————————————*/
	get sequence() {
		return (this._sequence) ? this._sequence.concat() : null;
	}

	set sequence(val = null) {
	var n = [],							// new sequence
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
			if (!(this._mem[val[c]] instanceof Control))
				continue;
			n.push(val[c]);
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

function maxInnerWidth(c) {
	var o = c,
		s = 0,
		w;

	while(o instanceof Control){
		w = o._width;
		s += o.shellWidth;
		if(o.autoWidth !== 'content')
			break;
		o = o._own;
	}
	return w - s;
}

function maxInnerHeight(c) {
	var o = c,
		s = 0,
		h;

	while(o instanceof Control){
		h = o._height;
		s += o.shellHeight;
		if(o._autoHeight !== 'content')
			break;
		o = o._own;
	}
	return h - s;
}

function calcSizes(pnl, seq, wid, hei) {
	var c,
		ps = pnl._element.style,
		ws = pnl._wrapper.style,
		ch,
		ca = [];
	
	ps.width = '' + wid + 'px';
	ws.width = ps.width;
	ps.height = '' + hei + 'px';
	ws.height = ps.height; 	
	for(c of seq){
		if (!c.visible || (c._autoWidth !== 'content' && c._autoHeight !== 'content')){
			ca.push(false);
			continue;
		}
		ch = false;
		if (c instanceof Panel) {
			// TODO: left, top = 0;
			// TODO: sqc.push(c.calcLayout());
			// TODO: continue;
		}
		if (c._autoWidth === "content")
			ch = c.widthToContent();
		if (c._autoHeight === "content")
			ch ||= c.heightToContent();
		ca.push(ch);
	}
	ps.width = '' + pnl._width + 'px';
	ws.width = ps.width;
	ps.height = '' + pnl._height + 'px';
	ws.height = ps.height; 	
	return ca;
}

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

function calcHorWidth(pnl, seq){
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

function calcHorWrapOrTop(pnl, seq) {
	var wid,
		rtl = pnl._rightToLeft,
		top = 0,
		lft = 0,
		hei = 0,
		ctl,
		sqc,
		chg,
		pch = false;
	
	wid = maxInnerWidth(pnl);
	sqc = calcSizes(pnl, seq, wid, maxInnerHeight(pnl));
	for(ctl of seq){
		if (pnl._wrap && (lft + ctl._width > wid)){
			if (lft !== 0){
				top += hei + pnl._splitY;
				hei = 0;
			}
			lft = 0; 
		}
		chg ||= ctl._setX((rtl) ? (wid - (lft + ctl._width)) : lft);
		chg ||= ctl._setY(top);
		if (chg) {						// control needs rendering.
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
			pch = true;
		}
		if (hei < ctl._height)
			hei = ctl._height;
		lft += ctl._width + pnl._splitX;
	}
	return pch;
}

function calcHorCenterOrBottom(pnl, seq) {
	var wid,
		hei,
		rtl = pnl._rightToLeft,
		cen = (pnl._contentAlign === "center"),
		lft = 0,
		ctl,
		chg;
	
	hei = (pnl._autoHeight === 'content') ? calcMinHeight(pnl, seq) : pnl.innerHeight;
	wid = (pnl._autoWidth === 'content') ? calcHorWidth(pnl, seq) : pnl.innerWidth;
	for(ctl of seq){
		chg = ctl._setX((rtl) ? (wid - (lft + ctl._width)) : lft);
		chg ||= ctl._setY((cen) ? (hei - ctl._height) / 2 : (hei - ctl._height))
		if (chg) {
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
		}
		lft += ctl._width + pnl._splitX;
	}
}

function calcVerCenterOrRight(pnl, seq) {
	var wid,
		cen = (pnl._contentAlign === "center"),
		top = 0,
		ctl,
		chg;

	wid = (pnl._autoWidth === 'content') ? calcMinWidth(pnl._ctl, seq) : pnl.innerWidth;
	for(ctl of seq) {
		chg = ctl._setX((cen) ? (wid - ctl._width) / 2 : (wid - ctl._width));
		chg ||= ctl._setY(top);
		if (chg) {
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
		}
		top += ctl._height + pnl._splitY;
	}
}









/*
function calcHorWrapOrTop(pnl, seq) {
	var wid,
		rtl = pnl._rightToLeft,
		top = 0,
		lft = 0,
		hei = 0,
		ctl,
		sqc,
		idx,
		len,
		chg,
		pch = false;
	
	wid = maxInnerWidth(pnl);
	sqc = calcSizes(pnl, seq, wid, maxInnerHeight(pnl));
	len = seq.length;
	for(idx = 0; idx < len; idx++){
		ctl = seq[idx];
		chg = sqc[idx];
		if (pnl._wrap && (lft + ctl._width > wid)){
			if (lft !== 0){
				top += hei + pnl._splitY;
				hei = 0;
			}
			lft = 0; 
		}
		chg ||= ctl._setX((rtl) ? (wid - (lft + ctl._width)) : lft);
		chg ||= ctl._setY(top);
		if (chg) {						// control needs rendering.
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
			pch = true;
		}
		if (hei < ctl._height)
			hei = ctl._height;
		lft += ctl._width + pnl._splitX;
	}
	return pch;
}

function calcHorCenterOrBottom(pnl, seq) {
	var wid,
		hei,
		rtl = pnl._rightToLeft,
		cen = (pnl._contentAlign === "center"),
		lft = 0,
		ctl,
		sqc,
		idx,
		len,
		chg,
		pch = false;
	
	sqc = calcSizes(pnl, seq, maxInnerWidth(pnl), pnl.innerHeight);
	hei = calcMinHeight(pnl._ctl, seq);
	len = seq.length;
	for(idx = 0; idx < len; idx++){
		ctl = seq[idx];
		chg = sqc[idx];
		chg ||= ctl._setX((rtl) ? (wid - (lft + ctl._width)) : lft);
		chg ||= ctl._setY((cen) ? (hei - ctl._height) / 2 : (hei - ctl._height));
		if (chg) {
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
			pch = true;
		}
		lft += ctl._width + pnl._splitX;
	}
	return pch;
}


function calcVerWrapOrLeft(pnl, seq) {
	var hei,
		rtl = pnl._rightToLeft,
		top = 0,
		lft = 0,
		wid = 0,
		ctl,

		cx,
		cy,
		pch = false;

	for(ctl of seq) {
		if (pnl._wrap && (top + ctl._height > hei)) {
			if (top !== 0) {
				lft += wid + pnl._splitX;
				wid = 0;
			}
			top = 0;
		}
		cx = ctl._setX((rtl) ? (wid - (lft + ctl._width)) : lft);
		cy = ctl._setY(top);
		if (cx || cy){
			ctl.invalidate();
			pch = true;
		}
		if (wid < ctl._width)
			wid = ctl._width;
		top += ctl._height + pnl._splitY;
	}
	return pch;
}

function calcVerCenterOrRight(pnl, seq) {
	var wid = pnl.innerWidth,
		cen = (pnl._contentAlign === "center"),
		top = 0,
		ctl,
		sqc,
		chg,
		idx,
		len,
		pch;

	if (pnl._autoWidth === 'content') {
		calcSizes(pnl, seq, maxInnerWidth(pnl), pnl.innerHeight);
		wid = calcMinWidth(pnl._ctl, seq);
	}
	len = seq.length;
	for(idx = 0; idx < len; idx++) {
		ctl = seq[idx];
		chg = false; //sqc[idx];
		chg ||= ctl._setX((cen) ? (wid - ctl._width) / 2 : (wid - ctl._width));
		chg ||= ctl._setY(top);
		if (chg) {
			pch = true;
			ctl.invalidate();
			pnl.doMemberRelocate(ctl);
		}
		top += ctl._height + pnl._splitY;
	}
	return pch;
}
*/

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

/*——————————————————————————————————————————————————————————————————————————
  FUNC: checkDimension [private].
  TASK: Calculates total width and height of members	
  ARGS:
	pnl	: Panel		: Control (for exception data).
  RETV: 
  		: Object 	: Object containing totalWidth and totalHeight 
					  of members.
——————————————————————————————————————————————————————————————————————————*/
function adjustDimension(pnl) {
	var c,
		cx,
		cy,
		w = 0,
		h = 0;

	if (pnl.autoWidth !== 'content' && pnl.autoHeight !== 'content') 
		return;
	for(c of pnl._ctl){
		if (!c.visible)
			continue;
		cx = c._x + c._width	
		cy = c._y + c._height;
		if (cx > w)
			w = cx;
		if (cy > h)
			h = cy;
	}
	c = false;
	if (pnl.autoWidth === 'content' && pnl._width !== w) 
		c = pnl._setW(w + pnl.shellWidth);
	if (pnl.autoHeight === 'content' && pnl._height !== h) 
		c ||= pnl._setH(h + pnl.shellHeight);
	if (c)
		pnl.coordsChanged();
}

sys.registerClass(Panel);