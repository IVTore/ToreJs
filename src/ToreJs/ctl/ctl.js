/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	ctl.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { is } from "../lib/index.js";

export const ctl = {
				
	// Control States
	DYING: 0,	// exiting or dead	
	ALIVE: 1,	// normal, idle
	HOVER: 2,	// pointer over 
	FOCUS: 3,	// selected, focused 
	SLEEP: 4,	// disabled

	// Control state style suffixes
	SUFFIX: [		
		'Dying',
		'Alive',
		'Hover',
		'Focus',
		'Sleep'
	],

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

    viewportSizes : [ 576, 768, 992, 1200, 1400],

	viewportNames : ['xs','sm','md','lg','xl','xxl']
}

function isViewportObject(o = null) {
    var i,
        l;

    if (o === null || !is.plain(o))
        return false;
    if (o.df !== undefined)
        return true;
    l = ctl.viewportNames.length;
    for(i = 0; i < l; i++) {
        if (o[ctl.viewportNames[i]] === undefined)
            return false;
    }
    return true;
}

is.vpObj = isViewportObject;