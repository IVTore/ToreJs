/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TCtlSys.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, core, TComponent } from "../lib/index.js";

/*————————————————————————————————————————————————————————————————————————————
  CLASS:    cts [static singleton]
  TASKS:    Control system framework with 
            Visual control constants settings and helpers. 
————————————————————————————————————————————————————————————————————————————*/

var vpSizes = [ 576, 768, 992, 1200, 1400];

var vpNames = ['xs','sm','md','lg','xl','xxl'];

const cts = {
				
	// TControl States
	DYING: 0,	// exiting or dead	
	ALIVE: 1,	// normal, idle
	HOVER: 2,	// pointer over 
	FOCUS: 3,	// selected, focused 
	SLEEP: 4,	// disabled

	// TControl state style suffixes
	SUFFIX: [		
		'Dying',
		'Alive',
		'Hover',
		'Focus',
		'Sleep'
	],

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: viewportInfo. [static]
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
            E_INV_VAL       -> If val is not a plain javascript object.
            E_VP_INF_REQ_UB -> If upper bound is not given.
            E_VP_INF_MUL_UB -> If multiple upper bounds given.
            E_VP_INF_INV_SZ -> If invalid size (NAN or < 16) given.
            E_VP_INF_DUP_SZ -> If same size with different names given.
            E_VP_INF_REQ_SZ -> If no numeric size value is given.
    ———————————————————————————————————————————————————————————————————————————*/
    set viewportInfo(val = null) {
        var nm = [],
            sz = [],
            ub = null,
            sn,
            sv,
            ix,
            ln,
            sn;

        if (!sys.isPlain(val))
            exc('E_INV_VAL', "viewportInfo");
        for(sn in val) {
            if (!val.hasOwnProperty(sn))
                continue;
            sv = val[sn];
            if (sv === null) {
                if (ub) 
                    exc('E_VP_INF_MUL_UB', sn + ' = ' + ub + ' = null.');
                ub = sn;
                continue;
            }
            if (typeof sv !== 'number' || sv < 16)
                exc('E_VP_INF_INV_SZ', sn +': '+ sv);
            ix = sz.indexOf(sv);
            if (ix > -1)
                exc('E_VP_INF_DUP_SZ', sn + ' = ' + nm[ix] + ' = ' + sv);
            ln = sz.length;
            if (ln === 0) {
                nm.push(sn);
                sz.push(sv);
                continue;
            }
            for(ix = 0; ix < ln; ix++) {
                if (sv < sz[ix])
                    break;
            }
            nm.splice(ix, 0, sn);
            sz.splice(ix, 0, sv);
        }
        if (sz.length === 0)
            exc('E_VP_INF_REQ_SZ');
        if (ub === null)
            exc('E_VP_INF_REQ_UB');
        nm.push(ub);
        vpNames = nm;
        vpSizes = sz;
    },

    get viewportInfo() {
        var rv = {},
            ln = vpSizes.length,   
            ix;
             
        for(ix = 0; ix < ln; ix++) 
            rv[vpNames[ix]] = vpSizes[ix];
        rv[vpNames[ln]] = null;
        return rv;
    },

    get viewportSizes() {
        return vpSizes;
    },

	get viewportNames() {
        return vpNames;
    },
    

	SIZES: {
		Tiny: 1,
		Small: 1,
		Medium: 1,
		Big: 1,
		Large: 1,
		Huge: 1
	},

	COLORS: {
		First: 1,
		Second: 1,
		Done: 1,
		Fail: 1, 
		Warn: 1, 
		Info: 1, 
		Light: 1,
		Dark: 1, 
		Link: 1
	},
	
	/*——————————————————————————————————————————————————————————————————————————
  	  FUNC: viewportValue.
  	  TASK: 
  		Gets a value corresponding to current viewport from a 
		viewport values object in a property of a component.
  	  ARGS:
		t		: TComponent	: For exception data. Generally a TControl.
		v		: Object		: Viewport Values object.
		name	: String		: Property name for exception message.
		force	: String		: Viewport name forced or null for current name.
  	  RETV: 	: * 			: Extracted string or number.
	——————————————————————————————————————————————————————————————————————————*/
	viewportValue(t = null, v = null, name = '', force = null) {
		var vp = (force === null) ? core.display.viewportName : force;

		if (!t || !(t instanceof TComponent)) 
			exc('E_INV_ARG', 't');
		if (!v || !(v.constructor === Object))
			exc('E_INV_ARG', 'v');
		v = (v[vp]) ? v[vp] : v.df;
		if (!v)
			exc('E_INV_VP_VAL', t.namePath+'.'+ name + ':{'+ vp +': ?, df: ?}');
		return v;
	},

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isVpObj.
	  TASK: Returns true if object is a valid viewport value object.
	  ARGS:	obj	: object    : presumed valid viewport value object.
	  RETV:	    : boolean   : true if object is a valid viewport value object.
      INFO: A valid viewport object :
            * Must be plain.
            * Should contain a df (default) value or all other values.
    ———————————————————————————————————————————————————————————————————————————*/
    isVpObj(o = null) {
        var i,
            n,
            l;
    
        if (o === null || !sys.isPlain(o))
            return false;
        if (o.df !== undefined)
            return true;
        n = cts.viewportNames;
        l = n.length;
        for(i = 0; i < l; i++) {
            if (o[n[i]] === undefined)
                return false;
        }
        return true;
    }

}

Object.freeze(cts);

export { cts };
