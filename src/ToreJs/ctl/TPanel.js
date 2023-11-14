/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TPanel.js: Tore Js TPanel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys }          from "../lib/index.js";
import { TControl }     from "./TControl.js";
import { TContainer }   from "./TContainer.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TPanel
  TASKS: 
	TPanel is a container supporting automatic layout of sub controls.
  	
	Sub control layout is interdependant on:
		
	layout	: string.
			if 'none' there is no layout.
			if 'horizontal' controls are laid horizontally.
			if 'vertical' controls are laid vertically. 
	
	wrap : boolean.
			if true controls are wrapped while laid.
			if false controls are laid linearly.

	sequence: array.
			Contains the names of controls effected from layout and 
			their laying order.

	contentAlign : null or string.
			Valid when wrap is false so controls are laid linearly.
			If layout is 'horizontal' :
                    if 'top', controls are aligned top.
					if 'center', controls are vertically centered. 
					if 'bottom', controls are aligned bottom.
					else , controls are aligned top.
			If layout is 'vertical' :
                    if 'left', controls are aligned left.
					if 'center', controls are horizontally centered. 
					if 'right', controls are aligned right.
					else , controls are aligned left.

	splitX : number.
			Horizontal split distance between controls in pixels.

	splitY : number.
			Vertical split distance between controls in pixels.

	w / autoW and h / autoH:
			These are limiting factors for layout.

		1) Only members in sequence array are effected.
		2) When layout is null nothing is done.
		3) When there is layout:
			a)	If wrap is true sequenced controls will be fitted into
				panel via wrapping if their coordinates overflow.
			b)	Sequenced control autoX and autoY will be set to null.
				anchorRight and anchorBottom will be set to false.
——————————————————————————————————————————————————————————————————————————*/
export class TPanel extends TContainer {

	
	// Property publishing map.
	static cdta = {
		splitX		: {value: 0},
		splitY		: {value: 0},
        autoW       : {value: 'fit'},
        autoH       : {value: 'fit'}, 
		sequence	: {value: null},
		layout		: {value: 'horizontal'},
		wrap		: {value: true},
		contentAlign : {value: 'left'}
	};

	_layout = 'horizontal';
	_wrap = true;
	_splitX = 0;
	_splitY = 0;
    _autoW = 'fit';
    _autoH = 'fit';
	_sequence = null;
	_contentAlign = 'left';
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
	constructor(name = null, owner = null, data = null) {
		super(name);
        this.initControl(name, owner, data);
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
		sequence	: boolean	 : Add to layout sequence if true. :DEF: false.
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
	  TASK: Flags the TPanel that its member is resized or repositioned.
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
	  FUNC: calcLayout
	  TASK: Sets the coordinates of sub control(s) in panel.
	——————————————————————————————————————————————————————————————————————————*/
	calcLayout() {
		var t = this,
			s;

		if (t._calculating ||
            t._layout === 'none' ||              
            t._sequence === null ||
            !t._ctlState)
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

	set layout(val = 'none') {
		var cal;

		if (val !== 'none' && val !== 'vertical' && val !== 'horizontal')
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
			set to 'top' or 'bottom' when layout is 'vertical',
			set to 'left' or 'right' when layout is 'horizontal'
	——————————————————————————————————————————————————————————————————————————*/
	get contentAlign() {
		return this._contentAlign;
	}

	set contentAlign(val = null) {
		if (PNL_CALIGN.indexOf(val) === -1)
			return;		
		if (val === this._contentAlign)
			return;
		this._contentAlign = val;
		if (this._layout)
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

	set wrap(val = false) {
		val = !!val;
		if (this._wrap === val) 
			return;
		this._wrap = val;
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
		if (this._sta === sys.LOAD){		// Sequence at load
			if (val !== null)
				this._sequence = val.concat(); 
			return;
		}
		buildSequence(this, val);
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

	set splitX(val = 0) {
		if (typeof val !== 'number' || val < 0)
			val = 0;
		if (this._splitX == val) 
			return;
		this._splitX = val;
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

	set splitY(val = 0) {
		if (typeof val !== 'number' || val < 0)
			val = 0;
		if (this._splitY == val) 
			return;
		this._splitY = val;
		this.contentChanged();
	}

}

// Private methods and values.
const PNL_CALIGN = ['none','top','bottom','left','right','center'];

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorWrapped
  TASK: Calculates subcontrol positions for wrapped horizontal layout.
  ARGS:	pnl	: TPanel	 : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcHorWrapped(pnl, seq) {
	var wid = pnl.maxContainableInnerW(),
		top = 0,
		lft = 0,
		hei = 0,
        chx,
        chy,
		sub;

        for(sub of seq) {
            if (lft + sub._w > wid){
                if (lft !== 0){
                    top += hei + pnl._splitY;
                    hei = 0;
                    lft = 0;
                }
            }
            chx = sub._setX(lft);
            chy = sub._setY(top);
            if (chx || chy) {						// control needs rendering.
                sub.invalidate();
                pnl.doMemberRelocate(sub);
            }
            if (hei < sub._h)
			    hei = sub._h;
		    lft += sub._w + pnl._splitX;
        }
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerWrapped
  TASK: This utterly unnecessary function calculates subcontrol positions 
		for wrapped vertical layout.
  ARGS:	pnl	: TPanel : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcVerWrapped(pnl, seq) {
	var hei = pnl.maxContainableInnerH(),
		top = 0,
		lft = 0,
		wid = 0,
		sub,
		chx,
		chy;

	for(sub of seq) {
		if (top + sub._h > hei) {
			if (top !== 0) {
				lft += wid + pnl._splitX;
				wid = 0;
			}
			top = 0;
		}
		chx = sub._setX(lft);
        chy = sub._setY(top);
        if (chx || chy) {						// control needs rendering.
            sub.invalidate();
            pnl.doMemberRelocate(sub);
        }
		if (wid < sub._w)
			wid = sub._w;
		top += sub._h + pnl._splitY;
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcMinHeight
  TASK: Calculates minimum inner height for horizontal linear layout.
  ARGS:	pnl	: TPanel : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner height.
——————————————————————————————————————————————————————————————————————————*/
function calcMinHeight(pnl, seq){
	var arr = pnl._subCtls,
		sub,
		hei,
		min = 0;
	
	for(sub of arr) {
		if (!sub.visible)
			continue;
		hei = (seq.indexOf(sub) > -1) ? sub._h : sub._y + sub._h;
		if (min < hei)
			min = hei;
	}
	return min;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorLinear [private].
  TASK: Calculates subcontrol positions for linear horizontal layout.
  ARGS:	pnl	: TPanel : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: contentAlign property defines vertical alignment for subcontrols.
		"center", centers, "bottom" aligns bottom, any other value is top.
——————————————————————————————————————————————————————————————————————————*/
function calcHorLinear(pnl, seq) {
	var hei = calcMinHeight(pnl, seq),
		cal = pnl._contentAlign[0],
		lft = 0,
		cty,
		sub,
		chx,
		chy;
	
    hei = (pnl.innerH > hei) ? pnl.innerH : hei;
	for(sub of seq) {
        switch (cal) {
        case 'c':           // center
            cty = (hei - sub._h) / 2;
            break;
        case 'b':           // bottom
            cty = hei - sub._h;
            break;
        default:
            cty = 0;        // All others default to top.
            break;
        }
		chx = sub._setX(lft);
		chy = sub._setY(cty);
		if (chx || chy) {
			sub.invalidate();
			pnl.doMemberRelocate(sub);
		}
		lft += sub._w + pnl._splitX;
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcMinWidth
  TASK: Calculates minimum inner width for vertical linear layout.
  ARGS:	pnl	: TPanel : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner width.
——————————————————————————————————————————————————————————————————————————*/
function calcMinWidth(pnl, seq){
	var arr = pnl._subCtls,
		sub,
		wid,
		min = 0;
	
	for(sub of arr) {
		if (!sub.visible)
			continue;
		wid = (seq.indexOf(sub) > -1) ? sub._w: sub._x + sub._w;
		if (min < wid)
			min = wid;
	}
	return min;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerLinear
  TASK: Calculates subcontrol positions for linear vertical layout.
  ARGS:	pnl	: TPanel : TPanel.
		seq	: Array	 : Array of visible controls in sequence.
  INFO: 
  	*	contentAlign property defines horizontal alignment for subcontrols.
		"center", centers, "right" aligns right, any other value is left.
——————————————————————————————————————————————————————————————————————————*/
function calcVerLinear(pnl, seq) {
	var wid = calcMinWidth(pnl, seq),
		cal = pnl._contentAlign[0],		
		top = 0,
		sub,
		ctx,
		chx,
		chy;

    wid = (pnl.innerW > wid) ? pnl.innerW : wid;
	for(sub of seq) {
        switch (cal) {
        case 'c':           // center
            ctx = (wid - sub._w) / 2;
            break;
        case 'r':           // right
            ctx = wid - sub._w;
            break;
        default:
            ctx = 0;        // All others defaults to left.
            break;
        }
		chx = sub._setX(ctx);
		chy = sub._setY(top);
		if (chx || chy) {
			sub.invalidate();
			pnl.doMemberRelocate(sub);
		}
		top += sub._h + pnl._splitY;
	}
}

// Builds sequence array carefully.
function buildSequence(t, s){
    var n = [],								// new sequence
		c;

    if (s === null) {
        t._sequence = null;   
        return;
    }
    for(c in s){
        if (!(t._mem[s[c]] instanceof TControl))
            continue;
        sys.addUnique(n, s[c]);
    }
    if (n.length === 0)
        n = null;
    t._sequence = n;

}

// Builds an array of sequenced controls that are visible.
function fetchSequenced(t) {
	var s = t._sequence,
		r = [],
		n,
		c,
        a = t._contentAlign,
        x,
        y;
        
	if (s === undefined || s === null)
		return null;
    if (t._layout === 'vertical') 
        x = (a === 'left' || a === 'right' || a === 'center')? a : null;
    if (t._layout === 'horizontal') 
        y = (a === 'top' || a === 'bottom' || a === 'center') ? a : null;
    for(n of s) {
		c = t._mem[n];
		if (!c._visible)
			continue;
        c._autoX = x; 
        c._autoY = y;
		c.anchorRight = false;
		c.anchorBottom = false;
		r.push(c);
	}
	return (r.length) ? r : null;
}

sys.registerClass(TPanel);