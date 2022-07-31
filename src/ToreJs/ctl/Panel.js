/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Panel.js: Tore Js Panel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is } from "../lib";
import { Container } from "./Container.js";
import { Control } from "./Control";


/*——————————————————————————————————————————————————————————————————————————
  CLASS: Panel
  TASKS: Panel is a container supporting automatic layout of sub controls.
——————————————————————————————————————————————————————————————————————————*/
export class Panel extends Container {

	// Property publishing map.
	static cdta = {
		splitX		: {value: 0},
		splitY		: {value: 0},
		sequence	: {value: null},
		rightToLeft	: {value: false},
		layout		: {value: 'none'}	
	};

	_splitX = 0;
	_splitY = 0;
	_sequence = null;
	_rightToLeft = false;
	_layout = "none";
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
	constructor(name = null, owner = null, data = null) {
		super(name, owner, data);
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
		is a control, adds it to sequence.
	  ARGS:
		component		: Component :	new member component :DEF: null.
	  RETV: Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component))
			return false;
		if (!is.control(component))
			return true;
		if (this._sequence.indexOf(component.name) == -1)
			t._sequence.push(component.name);
		t.calculateLayout();
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
		i = this._sequence.indexOf(component.name);
		if (i != -1)
			this._sequence.splice(i, 1);	
		this.calculateLayout();	
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doMemberResize [override].
	  TASK: Flags the panel that one of its members is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doMemberResize(member = null) {
		this.calculateLayout();
		super.doMemberResize(member);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: adjustSize [override]
	  TASK: Changes the size of panel according to content.
	——————————————————————————————————————————————————————————————————————————*/
	adjustSize() {
		if (!this._autosize)
			return;
		super.adjustSize();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calculateLayout
	  TASK: Sets the dimensions of the panel and coordinates of sub control(s).
	  INFO: 
	  	Sub control layout is interdependant on	layout, sequence, rtl, 
		autosize and alignments.
		1) Only members in sequence array are effected.
		2) When layout is "none":
			a)	splitX, splitY and rightToLeft are ineffective.
			b)	if autosize is true, the sub control bounds will be 
				calculated and size will be set.
			c) if autosize is false nothing will be done.
		3) When there is layout:
			a)	splitX, splitY and rightToLeft are effective.
			b)	if autosize is false, panel width and height is effective.
			c)	if autosize is true, the area given by the owner to the
				panel is effective.
			d)	Sub controls will be fitted into panel via wrapping if 
				their coordinates overflow.
	——————————————————————————————————————————————————————————————————————————*/
	calculateLayout() {
		var t = this,
			s,
			r;

		if (t._calculating || !t._ctlState || t._sequence == null)
			return;
		if (t._layout == "none" && !t._autosize)
			return;
		t._calculating = true;			// block recursions.
		s = fetchSequenced(t);
		if (s == null)
			return;
		r = (t._layout == 'horizontal') ?
				calcHorizontal(t, seq) :
				calcVertical(t, seq);
		executeLayout(r);
		t._calculating = false;			// release recursion block.
	}

	executeLayout(delta = null) {
		var nam,
			tar,
			upd,
			key;

		if (delta == null)
			return;
		for(nam in delta){
			upd = delta[nam];
			tar = (nam == '_t_') ? this : this.mem[nam];
			for(key in upd)
				tar[key] = upd[key];
		}
	}
}

function calcHorizontal(t, seq) {
	var wid = t._width - t.dimensionsX().total,
		top = 0,
		lft = 0,
		hei = 0,
		rtl = t._rightToLeft,
		c,
		u,
		r = {};

	for(c of seq) {
		if (lft + c._width > wid){
			if (lft !== 0){
				top += hei + t._splitY;
				hei = 0;
			}
			lft = 0; 
		}
		u = {x: (rtl) ? (wid - (lft + c._width)) : lft, y: top};
		disableAligns(c, u);
		r[c.name] = u;
		if (hei < c._height)
			hei = c._height;
		lft += c._width + t._splitX;
	}
	return r;
}

function calcVertical(t, seq) {
	var hei = t._height - t.dimensionsY().total,
		top = 0,
		lft = 0,
		wid = 0,
		rtl = t._rightToLeft,
		c,
		u,
		r = {};
	
	for(c of seq) {
		if (top + c._height > hei) {
			if (top !== 0) {
				lft += wid + t._splitX;
				wid = 0;
			}
			top = 0;
		}
		u = {x: (rtl) ? (wid - (lft + c._width)) : lft, y: top};
		disableAligns(c, u);
		r[c.name] = u;
		if (wid < c._width)
			wid = c._width;
		top += c._height + t._splitY;
	}
	

}


// Builds an array of sequenced controls.
function fetchSequenced(t) {
	var i,
		s = t._sequence,
		c,
		r = [];

	if (s == null)
		return null;
	for(i in s) {
		c = t._mem[s[i]];
		if (!c._visible)
			continue;
		r.push(c);
	}
	return (r.length) ? r : null;
}

// Adds a _t_ entry to result set if panel width or height changes.
function finalizeSize(t, seq, r, w, h){
	var b = calcOffSeqBounds(t, seq),
		u = {};
	
	if (w < b.w)
		w = b.w;
	if (h < b.h)
		h = b.h;
	w += t.dimensionsX().total;
	h += t.dimensionsY().total;
	if (t._width != w)
		u.width = w;
	if (t._height != h) 
		u.height = h;
	if (t._width != w || t._height != h)
		r._t_ = u;
	return r;
}

// Calculates boundaries of controls that are not in sequence.
function calcOffSeqBounds(t, seq){
	var m,
		c,
		d,
		w = 0,
		h = 0;

	if (!seq)
		seq = [];
	for(m in t._mem){
		c = t._mem[m];
		if (!c._visible || seq.includes(c))
			continue;
		d = c._x + c._width;
		if (w < d)
			w = d;
		d = c._y + c._height;
		if (h < d)
			h = d;
	}
	return {w: w, h: h};
}

// Disables alignments in a controls update set.
function disableAligns(c, u){
	if (c._alignX != "none")
		u.alignX = "none";
	if (c._alignY != "none")
		u.alignY = "none";
}

/*
// Calculates maximum width of sequenced controls.
function calcMaxSeqWidth(t, seq) {
	var c,
		w = 0;
		
	for(c of seq){
		if (w < c._width)
			w = c._width;
	}
	return w;
}

// Calculates maximum height of sequenced controls.
function calcMaxSeqHeight(t, seq) {
	var c,
		h = 0;
		
	for(c of seq){
		if (h < c._height)
			h = c._height;
	}
	return h;
}

// Autosize: Calculate Panel size according to subcontrols.
function calculateSize(t, ignoreSequence = true) {
	var i,
		c,
		w = 0,
		h = 0;

	for(i in t._mem) {
		c = t._mem[i];
		if (!c._visible)
			continue;
		if (ignoreSequence && (t._sequence != null && t._sequence.indexOf(c.name) > -1))
			continue;
		if (w < c._x + c._width)
			w = c._x + c._width;
		if (h < c._y + c._height)
			w = c._y + c._height;
	}
	
	w += t.dimensionsX().total;
	h += t.dimensionsY().total;
	return  {width: w, height: h};
}

// Autosize, set dimensions of the Panel according to layout.
function calcLinear(t, seq) {
	if (seq == null)
		return {_t_: calculateSize(t, true)};
	if (t._rightToLeft)
		seq.reverse();
	return (t._layout == 'horizontal') ?
			calcLinearHorizontal(t, seq) :
			calcLinearVertical(t, seq);
}

// Autosize, horizontal linear.
function calcLinearHorizontal(t, seq) {
	var c,
		s = t._splitX,
		w = 0,
		r = {},
		u,
		h = calcMaxSeqHeight(t, seq);

	for(c of seq){
		if (w > 0)
			w += s;
		u = {x: w, y: (h - c._height) / 2}; 
		disableAligns(c, u);
		w += c._width;
		r[c._nam] = u;
	}
	return finalizeSize(t, seq, r, w, h);
}

// Autosize, vertical linear.
function calcLinearVertical(t, seq) {
	var c,
		s = t._splitY,
		h = 0,
		r = {},
		u,
		w = calcMaxSeqWidth(t, seq);

	for(c of seq){
		if (h > 0)
			h += s;
		u = {x: (w - c._width) / 2, y: h};
		disableAligns(c, u);
		h += c._height;
		r[c._nam] = u;
	}
	return finalizeSize(t, seq, r, w, h);
}


*/