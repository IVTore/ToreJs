/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	ctl.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

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

	// Control 2D X alignment
	ALIGN_X: [
		'none',
		'left',
		'center',
		'right'
	],
	// Control 2D Y alignment	
	ALIGN_Y: [
		'none',
		'top',
		'center',
		'bottom'
	],

	// Panel Container 2D layout
	LAYOUT: {
		none: 1,
		horizontal: 1,
		vertical: 1
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

}