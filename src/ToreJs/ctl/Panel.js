/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Panel.js: Tore Js Panel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib";
import { Container } from "./Container.js";
import { ctl } from "./ctl.js";


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
	  FUNC: doOwnerResize [override].
	  TASK: Flags the panel that its owner is resized.
	——————————————————————————————————————————————————————————————————————————*/
	doOwnerResize() {
		super.doOwnerResize();
		this.calculateLayout();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: adjustSize [override]
	  TASK: Changes the size of panel according to content.
	——————————————————————————————————————————————————————————————————————————*/
	adjustSize() {
		if (!this._autosize)
			return;
		if (this._width != this._oldWidth || this._height != t._old.height)
			t.calculateLayout();
		super.adjustSize();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calculateLayout
	  TASK: Sets the dimensions of the panel and coordinates of sub control(s).
	  INFO: 
	  	Sub control layout is interdependant on	layout, sequence, rightToLeft, 
		and autosize.
		1) Only members in sequence array are effected.
		2) When layout is "none" nothing is done.
		3) When there is layout:
			a)	splitX, splitY and rightToLeft are effective.
			b)	if autosize is false, panel width and height is effective.
				Sub controls will be fitted into panel via wrapping if 
				their coordinates overflow.
	——————————————————————————————————————————————————————————————————————————*/
	calculateLayout() {
		var t = this,
			s,
			r;

		if (t._layout == "none" || t._calculating || !t._ctlState || t._sequence == null)
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

	set layout(value = null) {
		if (ctl.LAYOUT.indexOf(value) == -1)
			return;
		if (value == this._layout)
			return;
		this._layout = value;
		this.calculateLayout();
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
		this.calculateLayout();
	}
					 
	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	sequence : Array;
	  GET : Gets layout sequence of panel.
	  SET : Sets layoutsequence of panel.
	——————————————————————————————————————————————————————————————————————————*/
	get sequence() {
		return (this._sequence) ? this._sequence.concat() : null;
	}

	set sequence(value = null) {
	var t = this,
		n = [],							// new sequence
		c;
	
		if (t._sta === Sys.LOAD){		// Sequence at load
			if (value)
				t._sequence = value.concat(); 
			return;
		}
		if (!value) {
			this._sequence = null;
			this.invalidate();
			return;
		}
		for(c in value){
			if (!is.control(t._mem[value[c]]))
				continue;
			n.push(value[c]);
		}
		if (n.length == 0)
			n = null;
		t._sequence = n;
		if (this._sequence == null)
			this.invalidate();
		t.calculateLayout();
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
		this.calculateLayout();
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
		this.calculateLayout();
	}

}

// Private methods.

function calcHorizontal(pnl, seq) {
	var wid,
		top = 0,
		lft = 0,
		hei = 0,
		rtl = pnl._rightToLeft,
		ctl,
		upd,
		res = {},
		totWid = 0,
		totHei = 0;
	
	wid = (pnl._autosize) ? 
			Number.MAX_SAFE_INTEGER:
			pnl._width - pnl.dimensionsX().total;
	for(ctl of seq) {
		if (lft + ctl._width > wid){
			if (lft !== 0){
				top += hei + pnl._splitY;
				hei = 0;
			}
			lft = 0; 
		}
		upd = buildUpdate(ctl, res, (rtl) ? (wid - (lft + ctl._width)) : lft, top);
		if (hei < ctl._height)
			hei = ctl._height;
		lft += ctl._width + pnl._splitX;
		if (!pnl._autosize)
			continue;
		if (totWid < upd.x + ctl._width)
			totWid = upd.x + ctl._width;
		if (totHei < upd.y + ctl._height)
			totHei = upd.y + ctl._height;
	}
	return ((pnl._autosize) ? finalizeSize(pnl, seq, res, totWid, totHei): r );
}

function calcVertical(pnl, seq) {
	var hei,
		top = 0,
		lft = 0,
		wid = 0,
		rtl = pnl._rightToLeft,
		ctl,
		upd,
		res = {},
		totWid = 0,
		totHei = 0;

	hei = (pnl._autosize) ?
			Number.MAX_SAFE_INTEGER :
			pnl._height - pnl.dimensionsY().total;
	for(ctl of seq) {
		if (top + ctl._height > hei) {
			if (top !== 0) {
				lft += wid + pnl._splitX;
				wid = 0;
			}
			top = 0;
		}
		upd = buildUpdate(ctl, res, (rtl) ? (wid - (lft + ctl._width)) : lft, top);
		if (wid < ctl._width)
			wid = ctl._width;
		top += ctl._height + pnl._splitY;
		if (!pnl._autosize)
			continue;
		if (totWid < upd.x + ctl._width)
			totWid = upd.x + ctl._width;
		if (totHei < upd.y + ctl._height)
			totHei = upd.y + ctl._height;
	}
	return ((pnl._autosize) ? finalizeSize(pnl, seq, res, totWid, totHei): r );
}

// Calculates size according to boundaries of controls in panel.
// Adds a _t_ entry to result set if panel width or height changes.
function finalizeSize(pnl, seq, res, totWid, totHei){
	var mem,
		ctl,
		upd = {};

	for(mem in pnl._mem){
		ctl = pnl._mem[mem];
		if (!is.control(ctl) || !ctl._visible || seq.indexOf(ctl) > -1)
			continue;
		d = ctl._x + ctl._width;
		if (totWid < d)
			totWid = d;
		d = ctl._y + ctl._height;
		if (totHei < d)
			totHei = d;
	}
	totWid += pnl.dimensionsX().total;
	totHei += pnl.dimensionsY().total;
	if (pnl._width != totWid)
		upd.width = totWid;
	if (pnl._height != totHei) 
		upd.height = totHei;
	if (upd.width || upd.height)
		res._t_ = upd;
	return res;
}

// Disables alignments in a controls update set.
// Adds x, y values to update set.
// Adds update set to result set.
function buildUpdate(ctl, res, xPos, yPos){
	var upd = {x: xPos,	y: yPos};
	
	if (ctl._alignX != "none")
		upd.alignX = "none";
	if (ctl._alignY != "none")
		upd.alignY = "none";
	res[ctl._nam] = upd;
	return upd;
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

sys.registerClass(Panel);