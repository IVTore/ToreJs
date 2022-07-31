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
	HOVER: 2,	// mouse over 
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

	// Properties not allowed in control styles
	INV_STYLE: {	
		'length'	:1,	// rule.style internal
		'cssText'	:1,
		'parentRule':1,
		'top'		:1, // Control managed
		'left'		:1, 
		'bottom'	:1,
		'right'		:1,
		'width'		:1,
		'height'	:1,
		'zIndex'	:1,
		'display'	:1,
		'visibility':1,
		'clip'		:1
	},

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
	LAYOUT: [
		'none',
		'horizontal',
		'vertical'
	]
}