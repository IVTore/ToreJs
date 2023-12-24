/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TPanel.js: Tore Js TPanel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys }          from "../lib/index.js";
import { TCtl }         from "./TCtlSys.js";
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
		is a control and sequence is true it is added to layout sequence.
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
			sys.arrAddUnique(this._sequence, component.name);
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
		i = this.sequenceIdx(component._nam);
		if (i !== -1)
			this._sequence.splice(i, 1);
		this.calcLayout();
		return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxW [protected] [override].
      TASK: This finds the maximum control width required for the panel.
      RETV:     : number : maximum control width for the panel.
      INFO: 
        *   Called by autoFitW or autoMaxW. 
        *   When autoW is "fit" or "max", tries to find maximum panel
            width required for contents ignoring any boundaries.
        *   This maximum is according to the contents of the panel.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
        var s,                  // sub control.
            p,                  // sub control right position.
            m = 0;              // maximum.

        for (s of this._subCtls) {
            if (!s._visible)
                continue;
            p = s._x + s._w;
            if (p > m)
                m = p;
        }
    	return m + this._shellW;         
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
    	var s,                  // sub control.
            p,                  // sub control bottom position.
            m = 0;              // maximum.

        for (s of this._subCtls) {
            if (!s._visible)
                continue;
            p = s._y + s._h;
            if (p > m)
                m = p;
        }
    	return m + this._shellH;            
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
		t._calculating = false;			// Release.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: sequenceIdx [override].
	  TASK: Finds the index of control in panel layout sequence.
	  ARGS: 
        memberName	: string  : Name of the member control to search.
	  RETV: 		: number  : The member index in sequence or -1 if 
	  							there is no sequence or
	  							member is not a member of panel or
								member is not sequenced.
	——————————————————————————————————————————————————————————————————————————*/
	sequenceIdx(memberName = null){
		return this._sequence ? this._sequence.indexOf(memberName) : -1;
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
const PNL_CALIGN = ['top','bottom','left','right','center'];

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorWrapped
  TASK: Calculates subcontrol positions for wrapped horizontal layout.
  ARGS:	t	: TPanel	 : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcHorWrapped(t, s) {
	var wid = t.maxContainableInnerW(),
		top = 0,
		lft = 0,
		hei = 0,
        chx,
        chy,
		sub;

        for(sub of s) {
            if (lft + sub._w > wid){
                if (lft !== 0){
                    top += hei + t._splitY;
                    hei = 0;
                    lft = 0;
                }
            }
            chx = sub._setX(lft);
            chy = sub._setY(top);
            if (chx || chy) 						// control needs rendering.
                sub.invalidate();
            if (hei < sub._h)
			    hei = sub._h;
		    lft += sub._w + t._splitX;
        }
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerWrapped
  TASK: This utterly unnecessary function calculates subcontrol positions 
		for wrapped vertical layout.
  ARGS:	t	: TPanel : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  INFO: When wrapped, contentAlign has no meaning.
——————————————————————————————————————————————————————————————————————————*/
function calcVerWrapped(t, s) {
	var hei = t.maxContainableInnerH(),
		top = 0,
		lft = 0,
		wid = 0,
		sub,
		chx,
		chy;

	for(sub of s) {
		if (top + sub._h > hei) {
			if (top !== 0) {
				lft += wid + t._splitX;
				wid = 0;
			}
			top = 0;
		}
		chx = sub._setX(lft);
        chy = sub._setY(top);
        if (chx || chy) 						// control needs rendering.
            sub.invalidate();
		if (wid < sub._w)
			wid = sub._w;
		top += sub._h + t._splitY;
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorLinearHeight
  TASK: Calculates inner height for horizontal linear layout.
  ARGS:	t	: TPanel : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner height.
——————————————————————————————————————————————————————————————————————————*/
function calcHorLinearHeight(t, s) {
	var cah,
        sub = t._subCtls,
		ctl,
		hei,
		min = 0;

	cah = TCtl.autoValue(t._autoH);
    cah = (cah === 'fit' || cah === 'max');
	for(ctl of sub) {
		if (!ctl.visible)
			continue;
		hei = (s.indexOf(ctl) > -1) ? ctl._h : ctl._y + ctl._h;
		if (min < hei)
			min = hei;
	}
    if (cah)                // if max or fit go on. 
        return min;    
    hei = t.innerH;
    return (min > hei) ? min : hei;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcHorLinear [private].
  TASK: Calculates subcontrol positions for linear horizontal layout.
  ARGS:	t	: TPanel : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  INFO: contentAlign property defines vertical alignment for subcontrols.
		"center", centers, "bottom" aligns bottom, any other value is top.
——————————————————————————————————————————————————————————————————————————*/
function calcHorLinear(t, s) {
	var hei = calcHorLinearHeight(t, s),
       	cal = t._contentAlign[0],
		lft = 0,
		cty,
		sub,
		chx,
		chy;
	
    for(sub of s) {
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
		if (chx || chy) 
			sub.invalidate();
		lft += sub._w + t._splitX;
	}         
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerLinearWidth
  TASK: Calculates inner width for vertical linear layout.
  ARGS:	t	: TPanel : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  RETV: 	: number : minimum possible inner height.
——————————————————————————————————————————————————————————————————————————*/
function calcVerLinearWidth(t, s) {
	var caw,
        sub = t._subCtls,
		ctl,
		wid,
		min = 0;

	caw = TCtl.autoValue(t._autoW);
    caw = (caw === 'max' || caw === 'fit');

    for(ctl of sub) {
		if (!ctl.visible)
			continue;
		wid = (s.indexOf(ctl) > -1) ? ctl._w: ctl._x + ctl._w;
		if (min < wid)
			min = wid;
	}

    if (caw)                // if max or fit go on. 
        return min;    
    wid = t.innerW;
    return (min > wid) ? min : wid;
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: calcVerLinear
  TASK: Calculates subcontrol positions for linear vertical layout.
  ARGS:	t	: TPanel : TPanel.
		s	: Array	 : Array of visible controls in sequence.
  INFO: 
  	*	contentAlign property defines horizontal alignment for subcontrols.
		"center", centers, "right" aligns right, any other value is left.
——————————————————————————————————————————————————————————————————————————*/
function calcVerLinear(t, s) {
	var wid = calcVerLinearWidth(t, s),
		cal = t._contentAlign[0],		
		top = 0,
		sub,
		ctx,
		chx,
		chy;

    for(sub of s) {
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
		if (chx || chy) 
			sub.invalidate();
		top += sub._h + t._splitY;
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
    for(c of s){
        if (!(t._mem[c] instanceof TControl))
            continue;
        sys.arrAddUnique(n, c);
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