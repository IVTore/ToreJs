/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TCtlSys.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc,  TComponent } from "../lib/index.js";


/*————————————————————————————————————————————————————————————————————————————
  CLASS:    TCtlSys [static singleton]
  TASKS:    Control system framework with 
            Visual control constants settings and helpers. 
————————————————————————————————————————————————————————————————————————————*/

// private viewport sizes array.
var vpSiz = [ 576, 768, 992, 1200, 1400];
// private viewport names array.
var vpNam = ['xs','sm','md','lg','xl','xxl'];




const TCtl = {
				
	// TControl States
	DYING: 0,	// exiting or dead	
	ALIVE: 1,	// normal, idle
	HOVER: 2,	// pointer over 
	FOCUS: 3,	// selected, focused 
	SLEEP: 4,	// disabled

    // TControl state names
    stateNames : [		
        'Dying',
        'Alive',
        'Hover',
        'Focus',
        'Sleep'
    ],
	

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpInfo. [static]
	  SET : Sets viewport names and sizes all at once via a plain object.
      GET : Gets viewport names and sizes as a plain object.
	  INFO: 
        *   A valid viewport info object is formed as:
            {
                <viewportName 1>: max number of css pixels in width,
                <viewportName 2>: max number of css pixels in width,
                .
                <viewportName n>: null (means no upper bound, mandatory) 
            }
        *   Example:
            {xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: null}
            in which xxl is the upper bound (null).
        *   Viewport names will be sorted according to sizes then assigned to
            vpSizes and vpNames arrays. 
        *   Only one null size value will be accepted as upper bound.
      WARN: 
        *   Exceptions:
            E_INV_VAL     -> If val is not a plain javascript object.
            E_VP_REQ_UBND -> If upper bound is not given.
            E_VP_MUL_UBND -> If multiple upper bounds given.
            E_VP_INV_SIZE -> If invalid size (NAN or < 16) given.
            E_VP_DUP_SIZE -> If same size with different names given.
            E_VP_REQ_SIZE -> If no numeric size value is given.
    ———————————————————————————————————————————————————————————————————————————*/
    set vpInfo(val = null) {
        var nm = [],
            sz = [],
            ub = null,
            sn,
            sv,
            ix,
            ln;

        if (!sys.isPlain(val))
            exc('E_INV_VAL', "viewportInfo");
        for(sn in val) {
            if (!val.hasOwnProperty(sn))    // Filter ancestral props.
                continue;
            sv = val[sn];
            if (sv === null) {              // Fetch upper bound.
                if (ub) 
                    exc('E_VP_MUL_UBND', sn + ' = ' + ub + ' = null.');
                ub = sn;
                continue;
            }
            if (typeof sv !== 'number' || sv < 16 || isNaN(sv))
                exc('E_VP_INV_SIZE', sn +': '+ sv);
            ix = sz.indexOf(sv);
            if (ix > -1)
                exc('E_VP_DUP_SIZE', sn + ' = ' + nm[ix] + ' = ' + sv);
            ln = sz.length;
            for(ix = 0; ix < ln; ix++) {
                if (sv < sz[ix])
                    break;
            }
            nm.splice(ix, 0, sn);
            sz.splice(ix, 0, sv);
        }
        if (sz.length === 0)
            exc('E_VP_REQ_SIZE');
        if (ub === null)
            exc('E_VP_REQ_UBND');
        nm.push(ub);
        vpNam = nm;
        vpSiz = sz;
    },

    get vpInfo() {
        var rv = {},
            ln = vpSiz.length,   
            ix;
             
        for(ix = 0; ix < ln; ix++) 
            rv[vpNam[ix]] = vpSiz[ix];
        rv[vpNam[ln]] = null;
        return rv;
    },

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpSizes. [static]
	  GET : Gets viewport sizes as an array.
    ———————————————————————————————————————————————————————————————————————————*/
    get vpSizes() {
        return vpSiz.concat();
    },

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpNames. [static]
	  GET : Gets viewport sizes as an array.
    ———————————————————————————————————————————————————————————————————————————*/
	get vpNames() {
        return vpNam.concat();
    },

    /*——————————————————————————————————————————————————————————————————————————
  	  FUNC: vpValue.
  	  TASK: 
  		Gets a value corresponding to current viewport from a 
		viewport values object in a property of a component.
  	  ARGS:
		c		: TComponent	: For exception data. Generally a TControl.
		v		: Object		: Viewport Values object.
		name	: String		: Property name for exception message.
		force	: String		: Viewport name forced or null for current name.
  	  RETV: 	: * 			: Extracted string or number.
	——————————————————————————————————————————————————————————————————————————*/
	vpValue(c = null, v = null, name = '', force = null) {
		var vp = (force === null) ? display.viewportName : force;

		if (!c || !(c instanceof TComponent)) 
			exc('E_INV_ARG', 'c');
		if (!v || !(v.constructor === Object))
			exc('E_INV_ARG', 'v');
		v = (v[vp]) ? v[vp] : v.df;
		if (!v)
			exc('E_INV_VP_VAL', c.namePath+'.'+ name + ':{'+ vp +': ?, df: ?}');
		return v;
	},

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: vpCheck.
	  TASK: Returns true if object is a valid viewport value object.
	  ARGS:	o	: object    : presumed valid viewport value object.
	  RETV:	    : boolean   : true if object is a valid viewport value object.
      INFO: A valid viewport object :
            * Must be plain.
            * Should contain a df (default) value and / or all other values.
            * This routine is used during assignments.
    ———————————————————————————————————————————————————————————————————————————*/
    vpCheck(v = null) {
        var i,
            n,
            l;
    
        if (!sys.isPlain(v))
            return false;
        if (v.df !== undefined)
            return true;
        n = TCtl.vpNames;
        l = n.length;
        for(i = 0; i < l; i++) {
            if (v[n[i]] === undefined)
                return false;
        }
        return true;
    },

    /*——————————————————————————————————————————————————————————————————————————
  	  FUNC: autoValue.
  	  TASK: 
  		Gets an auto value corresponding to the value given.
        This gives no error.
  	  ARGS:
		v		: *		: auto value.
  	  RETV: 	: * 	: Extracted string, number or null.
	——————————————————————————————————————————————————————————————————————————*/
    autoValue(v = null) {
        var n;

        if (v === null)
            return null;
        if (v.constructor === Object) {
            n = display.viewportName;
            v = (v[n]) ? v[n] : v[df];
        }	
        return v;
    }
}

Object.freeze(TCtl);

export { TCtl };
