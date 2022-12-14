/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220618
  Author	: 	İhsan V. Töre
  About		: 	system.js: Tore Js platform adapter & common system library.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { TObject } from "../lib/TObject.js";
import { TComponent } from "../lib/TComponent.js";
import { TEventHandler } from "../lib/TEventHandler.js";


// Precompiled identifier regexp values.
const IDENTIFIER_REGEXP = new RegExp(/^[_a-z][_a-z0-9٠]{0,63}$/i);
const WHITESPACE_REGEXP = new RegExp(/^\s*$/);

/*———————————————————————————————————————————————————————————————————————————
  PROC: exc 
  TASK: Raises an exception with appropriate message.
  ARGS: tag	: String : Exception descriptor.
  		inf : *		 : Extra information (string or array of strings).
		err : Error  : Error to process if any.
  INFO: If err is an Error exception is not raised but just processed.
———————————————————————————————————————————————————————————————————————————*/
function exc(tag = "E_NO_TAG", inf = "", err = null) {
var asg = err instanceof Error,
	cex = asg ? err : new Error(tag),
	dta = {
		exc: cex.name, 
		tag: tag,
		inf: Array.isArray(inf) ? inf.join("\n") : inf,
		msg: cex.message
	};

	if (typeof sys.excInterceptor === 'function') 
		sys.excInterceptor(dta, err);

	if (sys.excConsoleLog) {
		console.log("EXC: ", dta.exc);
		console.log("TAG: ", dta.tag);
		console.log("INF: ", dta.inf);
		console.log("MSG: ", dta.msg);
	}

	if (!asg)
		throw new Error(tag);
}

/*———————————————————————————————————————————————————————————————————————————
  FUNC: chkNul.                                      
  TASK:                                                     
	Checks argument and if it is null then:
		if inf =  null : returns false
		if inf = !null : raises exception with tag.  
	otherwise returns true.                                               
  ARGS:                                                     
	arg : object        : Argument to check validity.   :DEF: null.     
	inf : string        : Exception info if arg invalid.:DEF: null.   
	tag : string        : Exception tag if arg invalid.	
						  :DEF: null => 'E_INV_ARG'.
————————————————————————————————————————————————————————————————————————————*/
function chkNul(arg = null, inf = null, tag = null) {
	if (arg === undefined || arg === null) {
		if (!inf)
			return false;
		if (tag === null)
			tag = 'E_INV_ARG';
		exc(tag, inf);
	}
	return true;		
}

/*———————————————————————————————————————————————————————————————————————————
  FUNC: chkStr.                                      
  TASK:                                                     
	Checks argument and 
	if it is null or empty / whitespace string then:
		if inf =  null : returns false
		if inf = !null : raises exception with tag and inf.  
	otherwise returns true.                                               
  ARGS:                                                     
	arg : string        : Argument to check validity.   :DEF: null.     
	inf : string        : Exception info if arg invalid.:DEF: null.   
	tag : string        : Exception tag if arg invalid.	
						  :DEF: null => 'E_INV_ARG'.
————————————————————————————————————————————————————————————————————————————*/
function chkStr(arg = null, inf = null, tag = null) {
	if (arg === undefined || 
		arg === null ||
		typeof arg !== 'string' ||
		arg.length === 0 ||
		WHITESPACE_REGEXP.test(arg)) {
			if (!inf)
				return false;
			if (tag === null)
				tag = 'E_INV_ARG',
			exc(tag, inf);
	}
	return true;		
}

const is = {                                                                    
	plain: x => x !== undefined &&									// Checks if argument is a plain object: {}.
				x !== null && 
				(x.__proto__ === null || x.__proto__ === Object.prototype), 
	ident: x => typeof x === 'string' && IDENTIFIER_REGEXP.test(x),	// Checks if argument is identifier.
	class: x =>	isClass(x),											// Checks if argument is a class.
	super: (sup, des) => isSuper(sup, des),							// Checks if sup is super or same of des class.
}

const sys = {
	
	// Object states
	DEAD: 0,			// logically dead
	LIVE: 1,			// live
	SAVE: 2,			// saving
	LOAD: 3,			// loading
	DSGN: 4,			// designing

	excConsoleLog: true,		// Log exception to console if true.
	excInterceptor: false,		// Assign to a function (dta, err) to intercept exception.

	registerClass: registerClass,
	
	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	classByName
	  TASK:	
	  	Tries to fetch a constructor of a class with given name.
	  	class constructor must be registered before.
	  ARGS:	
		name : string		: Class name.
	  RETV:	 : Constructor 	: If registered the class constructor else null.
	———————————————————————————————————————————————————————————————————————————*/
	classByName: function(name = null) {
	var ctor;
		
		if (typeof name !== 'string')
			return null;
		ctor = classes[name];
		return (!ctor) ? null : ctor;			
	},

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	addUnique
	  TASK:	Adds an item to array if it is not already added.
	  ARGS:	
		array	: Array		: Array to add item to.
		item	: *			: Item to add.
	  RETV:		: number	: Index of item.
	  INFO:
		*	Throws exception if array argument is null or not an array.
	———————————————————————————————————————————————————————————————————————————*/
	addUnique: function(array = null, item = null) {
		var i;

		if (!array || !Array.isArray(array))
			exc('E_INV_ARG', 'array');
		i = array.indexOf(item);
		if (i > -1)
			return i;
		return array.push(item) - 1;
	},

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	fetchObject 
	  TASK:	Tries to fetch an object from its pathname from window.
	  ARGS:	
		namePath	: String	: object name path or
					: Array		: pre splitted object name path
		fromObject	: Object	: Start object. :DEF: null, means window.
	  RETV:			: Object 	: fetched object.
	———————————————————————————————————————————————————————————————————————————*/
	fetchObject: function(namePath = "", fromObject = null){
		var	v = (fromObject) ? fromObject : window,
			p,
			i;
		
		p = (namePath instanceof Array) ? 
				 namePath : 
				(namePath === '') ? [] : namePath.split('.');
		try {								
			for(i in p)				// try fetching by names
				v = v[p[i]]; 
		} catch (e) {				// on failure
			exc(	
				'E_REF_INV', 
				null, 
				p.join('.') + ' [' + p[i] + ']?'
			);
		}
		return(v);					// return fetched
	},
	
	/*———————————————————————————————————————————————————————————————————————————
	  FUNC: bindHandler
	  TASK: Binds a native event handler to a component in a closure.
	  ARGS:	target	: TComponent	: Target component to link the event.
			handler	: String		: Handler name to link the event.
	  RETV:			: Function		: Bound anonymous function.
	  INFO: The returned bound function then should be assigned with 
	  		addEventListener() method to the source.
	———————————————————————————————————————————————————————————————————————————*/
	bindHandler: function(target = null, handler = null) {
		if(!(target instanceof TComponent))
			exc('E_INV_ARG', 'target');
		if(typeof handler !== 'string')
			exc('E_INV_ARG', 'handler');
		if(!typeof target[handler] === 'function')
			exc('E_HANDLER_INV', target.name + "." + handler);
		return(function(e){target[handler](e);});
	},
	
	/*———————————————————————————————————————————————————————————————————————————
	  PROC:	propSet
	  TASK:	Assigns a group of properties from an object to another.
	  ARGS:	
		t :  Object : target object to feed the properties.		:DEF: null. 
		s :  Object : source object containing property data.	:DEF: null.
		p :  Object : target parent (automatic).				:DEF: null.
					  p is used during recursive descent assignments for 
					  "__p." definitions automatically.
	  INFO:
		If t has properties which are also sub objects it is possible to 
		set their properties in a single call. Requirements are as follows:
		A) The sub object should be made before the call to propSet.
		B) The data should be added like this: 
			<subObjectName>: { <prop>: <value>, <prop>: <value>}
			Example: for a panel 'p' with a button named 'b' inside;
			propSet(p, {x: 10, y:10, b: {x:5, y:5} });
		It is possible to make sub objects during propSet.
		To make a sub object the information should be given in the 
		following format:
			<subObjectName>: {	_new_: <subObject className or class>,
								_var_: <true if to be added as variable>,
								<prop>: <value>, <prop: value>...}   
		_new_ can be the class constructor or a string having class name.
		_var_ is only for components.
		When set to false it means the sub object will be added as
		a member component. 
			THIS		 SUB			_var_    defaults to
			TComponent	 TComponent		false	(false - add as member)
			TComponent	 TComponent		true	(true  - add as variable)
			TComponent	!TComponent		ignored	(true  - add as variable)
		   !TComponent	!TComponent		ignored	(true  - add as variable)
		When _var_ defaults to true, it is not overridable.

		Tricky object designator string values:
			propName: 	"__t." will fetch from "this" and assign.
			propName: 	"__p." will fetch from parent of "this" and assign.
			propName: 	"__c." will fetch from core and assign.
	———————————————————————————————————————————————————————————————————————————*/
	propSet: function(t = null, s = null, p = null){  
	var i,	c,o,d,e;
	
		chkNul(t);
		chkNul(s);

		for(e in s){							// iterate source elements
			if (e === '_new_' || e === '_var_')	// those keys are processed
				continue;
			i = s[e];							// get element value at source
			if(i === null){						// if null
				t[e] = i;						// set directly
				continue;
			}
			// Tricky object designator string value evaluator, abracadabra...
			if (typeof i === 'string' && i.startsWith('__') && (i.length === 3 || i[3] === '.')) {
				d = i.substring(4);
				switch(i.substring(0, 3)) { 
				case '__t':
					t[e] = sys.fetchObject(d, t);
					continue;
				case '__p':
					if (p !== null) {
						t[e] = sys.fetchObject(d, p);
						continue;
					}
					exc('E_NO_PARENT', 	((t._nam) ? t._nam : '?') + '.' + e + ' = "__p"');
					break;
				case '__c' :
					t[e] = sys.fetchObject(d, core);
					continue;
				}
			}
			if (i.constructor !== Object){		// if source is not generic Object
				t[e] = i;						// set directly
				continue;
			}									// source is generic object...
			if(t[e] instanceof Object){			// if target is an Object
				sys.propSet(t[e], i, t);		// transfer values
				continue;
			}									// target is null...
			if(!i._new_){						// if not a new sub object
				t[e] = {};						// so it is a generic one
				sys.propSet(t[e], i, t);		// transfer values
				continue;
			}									// new sub object...
			c = i._new_;						// get the class
			if (typeof c === 'string')			// if string
				c = sys.classByName(c);			// try fetching class
			if (!isClass(c))					// if failed to fetch, exception
				exc('E_CLASS_INV', (i._new_) ? 'null' : i._new_);
			d = isSuper(TComponent, c);
			o = d ? new c(e) : new c();
			d = d && t instanceof TComponent && !i._var_ ; 
			if (d) 
				t.attach(o);
			sys.propSet(o, i, t);				// set the contents
			if (!d) 
				t[e] = o;
		}
	}
};

var classes = {
	"Object": Object,
	"Array": Array
};

function registerClass(ctor = null) {
	var info;

	if (!isClass(ctor))
		return;
	console.log("Registering " + ctor.name + ".");
	if (!isSuper(TObject, ctor)) {
		classes[ctor.name] = ctor;
		return;
	}
	info = 'info' + ctor.name;
	if (!ctor[info] || !ctor[info].ready)
		prepareClassData(ctor);
}

/*——————————————————————————————————————————————————————————————————————————
	FUNC: isClass 
	TASK: Returns true if the expression is a constructor.
	ARGS: x	: Object : presumed constructor.
	RETV:	: Boolean: true if x can be a constructor.
———————————————————————————————————————————————————————————————————————————*/
function isClass(x = null){
	if (!x || !x.prototype)
		return false;
	return ((x.prototype && (x === x.prototype.constructor)) !== undefined);
}

/*——————————————————————————————————————————————————————————————————————————
	FUNC: isSuper 
	TASK: Returns true if the class sup is super class of class des or same.
	ARGS:
		sup	: Object : presumed super class (ctor).
		des	: Object : presumed descendant class (ctor).
	RETV:	: Boolean: true if sup is Super Class of des Class.
———————————————————————————————————————————————————————————————————————————*/
function isSuper(sup, des) {
	return(
			isClass(sup)
		&&	isClass(des)
		&&	((sup === des)||(sup.prototype.isPrototypeOf(des.prototype)))
	);
}

/*———————————————————————————————————————————————————————————————————————————
  PROC:	prepareClassData
  ARGS:	ctor	: Constructor of class to prepare.
  INFO: Internal system function.
———————————————————————————————————————————————————————————————————————————*/
function prepareClassData(ctor = null) {
var	ptor,		// parent constructor.
	cdta,		// current prop data.
	pdta,		// parent prop data.
	info,		// class info name.
	cp,			// current prop.
	pp,			// parent prop.
	i;

	ptor = Object.getPrototypeOf(ctor.prototype).constructor;
	ptor = (ptor !== Object) ? ptor : null;
	if (ptor) {
		info = 'info' + ptor.name;
		if (!ptor[info] || !ptor[info].ready)
			prepareClassData(ptor);
	}	
	cdta = (ctor.cdta) ? ctor.cdta: {};
	pdta = (ptor) ? ptor.cdta: {};
	info = 'info' + ctor.name;
	if (ctor[info] && ctor[info].ready)
		return;
	// Add class info.
	ctor[info] = {ready: false};
	// Inherit properties of parent.
	for(i in pdta) {
		if (!cdta[i]) 						// if not defined.
			cdta[i] = {};					// define it.
		cp = cdta[i];
		pp = pdta[i];
		if (cp.store === undefined)			// inherit storage
			cp.store = pp.store;
		if (cp.value === undefined)			// inherit default value
			cp.value = pp.value;
		if (pp.event) {						// if old property is an event.
			if (cp.event === undefined)		// inherit event.
				cp.event = true;
			if (cp.typ === undefined)		// inherit event type.
				cp.typ = pp.typ;
			if (cp.src === undefined)		// inherit event source.
				cp.src = pp.src;
		}
	}
	// Complete attributes
	for(i in cdta){							// scan entries
		cp = cdta[i];
		if (cp.store === undefined)			// complete storage
			cp.store = true;
		if (cp.event !== undefined){		// complete event
			cp.event = true;
			cp.value = null;
			if (cp.typ === undefined)
				cp.typ = null;
			if (cp.src === undefined)
				cp.src = null;
			pp = pdta[i];
			if (pp) {
				if (!pp.event)
					exc("E_EVENT_DEF", ptor.name + "." + i +" <-> "+ ctor.name +"."+ i);
				continue;
			}
			defineEventProperty(ctor, i);
			continue;
		}
		if (cp.store && (cp.value === undefined))
			exc('E_NO_DEFAULT', ctor.name + "." + i);
	}
	ctor.cdta = cdta;
	ctor[info].ready = true;
	classes[ctor.name] = ctor;
}

// this is here because it needs a seperate closure. 
function defineEventProperty(ctor, propName) {
	Object.defineProperty(
		ctor.prototype,	propName,	{
			get: function(){return(this.getEvent(propName));},
			set: function(v = null){this.setEvent(propName, v);},
			enumerable  : false,	// do not iterate
			configurable: false		// variable persists
		}
	);
}

registerClass(TObject);
registerClass(TComponent);
registerClass(TEventHandler);

/*——————————————————————————————————————————————————————————————————————————— 
  CONST: core
  TASKS: This is the singleton component named core.
  		 It constructs a component framework connecting various subsystems 
		 to each other. It integrates the system into one access point.
———————————————————————————————————————————————————————————————————————————*/
const core = new TComponent('core');
window.core = core;

export {sys, is, exc, chkNul, chkStr, core};