/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220618
  Author	: 	İhsan V. Töre
  About		: 	system.js: Tore Js platform adapter & common system library.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { TObject } from "../lib/TObject.js";
import { Component } from "../lib/Component.js";
import { EventHandler } from "../lib/EventHandler.js";
import { Control } from "../ctl/Control.js";
import { Container } from "../ctl/Container.js";

/*———————————————————————————————————————————————————————————————————————————
  PROC: exc 
  TASK: Raises an exception with appropriate message.
  ARGS: tag	: String : Exception descriptor.
  		inf : *		 : Extra information (string or array of strings).
		err : Error  : Error to process if any.
  INFO: If err is an Error exception is not raised but just processed.
———————————————————————————————————————————————————————————————————————————*/
function exc(tag = "E_NO_TAG", inf = "", err = null) {
var asg = (is.asg(err) && err instanceof Error),
	cex = asg ? err : new Error(tag),
	dta = {
		exc: cex.name, 
		tag: tag,
		inf: is.arr(inf) ? inf.join("\n") : inf,
		msg: cex.message
	};

	if (is.fun(sys.excInterceptor)) 
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
	
	classByName: function(name = null) {
	var ctor;
		
		if (!is.str(name))
			return null;
		ctor = classes[name];
		return (!ctor) ? null : ctor;			
	},

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	fetchObject 
	  TASK:	Tries to fetch an object from its pathname from window.
	  ARGS:	
		n	: String	: object name path or
			: Array		: pre splitted object name path
	  RETV:		: Object 	: fetched object.
	———————————————————————————————————————————————————————————————————————————*/
	fetchObject: function(n){
	var	p = (n instanceof Array)? n : n.split('.'),	
		i,
		v = window;
		
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
		if(!is.component(target))
			exc('E_ARG_INV', 'target');
		if(!is.str(handler))
			exc('E_ARG_INV', 'handler');
		if(!is.fun(target[handler]))
			exc('E_HANDLER_INV', target.name + "." + handler);
		return(function(e){target[handler](e);});
	},
	
	/*———————————————————————————————————————————————————————————————————————————
	  PROC:	propSet
	  TASK:	Assigns a group of properties from an object to another.
	  ARGS:	
		t :  Object : target object to feed the properties
		s :  Object : source object containing property data[d=NULL].
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
		_new_ can be the class object or a string having class name.
		_var_ is only for components.
		When set to false it means the sub object will be added as
		a member component. 
			THIS		 SUB			_var_    defaults to
			TComponent	 TComponent		false	(false - add as member)
			TComponent	 TComponent		true	(true  - add as variable)
			TComponent	!TComponent		ignored	(true  - add as variable)
		   !TComponent	!TComponent		ignored	(true  - add as variable)
		When _var_ defaults to true, it is not overridable.
	———————————————————————————————————————————————————————————————————————————*/
	propSet: function(t, s){  
	var i,	c,o,d,e;
	
		if ((!t) || (!s))						// invalid arguments
			exc('E_ARG_INV');
		for(e in s){							// iterate source elements
			if (e == '_new_' || e == '_var_')	// those keys are processed
				continue;
			i = s[e];							// get element value at source
			if(i === null){						// if null
				t[e] = i;						// set directly
				continue;
			}
			if(i.constructor != Object){		// if source is not generic Object
				t[e] = i;						// set directly
				continue;
			}									// source is generic object...
			if(t[e] instanceof Object){			// if target is an Object
				sys.propSet(t[e], i);			// transfer values
				continue;
			}									// target is null...
			if(!i._new_){						// if not a new sub object
				t[e] = {};						// so it is a generic one
				sys.propSet(t[e], i);			// transfer values
				continue;
			}									// new sub object...
			c = i._new_;						// get the class
			if (is.str(c))						// if string
				c = sys.classByName(c);			// try fetching class
			if (isClass(c))						// if failed to fetch, exception
				exc('E_CLASS_INV', (i._new_) ? 'null' : i._new_);
			d = (isSuper(TObject, c));
			o = d ? new c(sys.LOAD) : new c();
			if (is.component(o) && is.component(t) && !i._var_) {
				o.name = e;
				t.attach(o);
			} else {
				t[e] = o;
			}
			sys.propSet(o, i);					// set the contents
			if (d)
				o.doLoadComplete();
		}
	}

};

// Precompiled identifier regexp.
const IDENTIFIER_REGEXP = new RegExp(/^[_a-z][_a-z0-9٠]{0,63}$/i);

const is = {
	def: x => x !== undefined,										// Checks if argument is defined.
	asg: x => x !== undefined && x !== null,						// Checks if argument is assigned.
	str: x => typeof(x) === "string",								// Checks if argument is a string.
	num: x => typeof(x) === "number",								// Checks if argument is a number.
	arr: x => Array.isArray(x),										// Checks if argument is an array.
	fun: x => typeof(x) === "function",								// Checks if argument is a function.
	plain: x => is.asg(x) && (x.__proto__ === null || x.__proto__ === Object.prototype),				// Checks if argument is a plain object: {}.
	ident: x => is.str(x) && IDENTIFIER_REGEXP.test(x),				// Checks if argument is identifier.
	class: x =>	isClass(x),											// Checks if argument is a class.
	super: (sup, des) => isSuper(sup, des),							// Checks if sup is super or same of des class.
	component: x => (x !== undefined && x instanceof Component),
	control: x => (x !== undefined && x instanceof Control),
	container: x => (x !== undefined && x instanceof Container)
}


var classes = {
	Object: Object,
	Array: Array
};

function registerClass(ctor = null) {
	if (!isClass(ctor))
		return;
	console.log("Registering "+ctor.name+".");
	if (!isSuper(TObject, ctor)) {
		classes[ctor.name] = ctor;
		return;
	}
	if (!ctor.info || !ctor.info.ready)
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
	cp,			// current prop.
	pp,			// parent prop.
	i;

	function initialize() {
		if (!ctor.info.initialized && is.fun(ctor.classInit))
			ctor.classInit();
		ctor.info.initialized = true;
	}

	ptor = Object.getPrototypeOf(ctor.prototype).constructor;
	ptor = (ptor !== Object) ? ptor : null;
	if (ptor && (!ptor.info || !ptor.info.ready))
		prepareClassData(ptor);	
	cdta = (ctor.cdta) ? ctor.cdta: {};
	pdta = (ptor) ? ptor.cdta: {};
	if (ctor.info && ctor.info.ready) {
		initialize();
		return;
	}
	// Add class info.
	ctor.info = {ready: false, initialized: false};
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
			if (cp.type === undefined)		// inherit event type.
				cp.type = pp.type;
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
			Object.defineProperty(			// define event property.
				ctor.prototype,	i,	{
					get: function(){return(this.getEvent(i));},
					set: function(v = null){this.setEvent(i, v);},
					enumerable  : false,	// do not iterate
					configurable: false		// variable persists
				}
			);
			continue;
		}
		if (cp.store && (cp.value === undefined))
			exc('E_NO_DEFAULT', ctor.name + "." + i);
	}
	ctor.cdta = cdta;
	ctor.info.ready = true;
	classes[ctor.name] = ctor;
	initialize();
}

registerClass(TObject);
registerClass(Component);
registerClass(EventHandler);
registerClass(Control);
registerClass(Container);

/*——————————————————————————————————————————————————————————————————————————— 
  CONST: core
  TASKS: This is the singleton component named core.
  		 It constructs a component framework connecting various subsystems 
		 to each other. It integrates the system into one access point.
———————————————————————————————————————————————————————————————————————————*/
const core = new Component('core');
window.core = core;

export {sys, is, exc, core};