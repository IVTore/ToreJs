/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TCtl.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { TComponent, exc, is } from "../lib/index.js";

/*————————————————————————————————————————————————————————————————————————————
  CLASS: TCtl [static]
  TASKS: Contains Visual control constants settings and helpers. 
————————————————————————————————————————————————————————————————————————————*/
export const TCtl = {
				
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

    viewportSizes : [ 576, 768, 992, 1200, 1400],

	viewportNames : ['xs','sm','md','lg','xl','xxl'],

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
  		Gets a property value corresponding to current viewport from a 
		viewport values object.
  	  ARGS:
		t		: TComponent	: For exception data. Generally a TControl.
		v		: Object		: Viewport Values object.
		name	: String		: Property name for exception message.
		force	: String		: Viewport name, forced or null for current name.
  	  RETV: 	: * 			: Extracted string or number.
	——————————————————————————————————————————————————————————————————————————*/
	viewportValue: function(t = null, v = null, name = '', force = null) {
		var vp = (force === null) ? core.display.viewportName : force;

		if (!t || !(t instanceof TComponent)) 
			exc('E_INV_ARG', 't');
		if (!v || !(v.constructor === Object))
			exc('E_INV_ARG', 'v');
		v = (v[vp]) ? v[vp] : v.df;
		if (!v)
			exc('E_INV_VP_VAL', t.namePath+'.'+ name + ':{'+ vp +': ?, df: ?}');
		return v;
	}
}

Object.freeze(TCtl);

function isViewportObject(o = null) {
    var i,
        l;

    if (o === null || !is.plain(o))
        return false;
    if (o.df !== undefined)
        return true;
    l = TCtl.viewportNames.length;
    for(i = 0; i < l; i++) {
        if (o[TCtl.viewportNames[i]] === undefined)
            return false;
    }
    return true;
}

is.vpObj = isViewportObject;
