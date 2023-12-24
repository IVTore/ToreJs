/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230301
  Author	: 	İhsan V. Töre
  About		: 	TSystem.js: Tore Js common system library.
  License   :	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { TObject } from "../lib/TObject.js";
import { TEventHandler } from "./TEventHandler.js";
import { TComponent } from "./TComponent.js";

// Precompile identifier detection regexp value.
const IDENTIFIER_REGEXP = new RegExp(/^[_a-z][_a-z0-9٠]{0,63}$/i);

// Precompile whitespace detection regexp value.
const WHITESPACE_REGEXP = new RegExp(/^\s*$/);

// Exception interceptor method variable.
// Please refer to : sys.exceptionInterceptor.
var excInterceptor = null;

// Exception output to console variable.
// Please refer to : sys.exceptionLogToConsole.
var excToConsole = true;

// Log function.
// Please refer to : sys.logFunction.
var sysLogFunction = console.log;

// LogEnabled flag.
// Please refer to : sys.logEnabled.
var sysLogEnabled = true;


// Class registry.
const classes = {
	"Object": Object,
	"Array": Array
};

/*———————————————————————————————————————————————————————————————————————————
  PROC: exc. 
  TASK: Reports and/or throws an exception with appropriate message.
  ARGS: tag	: String : Exception descriptor.
  		inf : *		 : Extra information (string or array of strings).
		err : Error  : Error to process if any.
  INFO: If err is not null exception is not thrown but just processed.
        For more info please refer to : 
            sys.exceptionInterceptor & sys.exceptionLogToConsole.
———————————————————————————————————————————————————————————————————————————*/
function exc(tag = "E_NO_TAG", inf = "", err = null) {
var asg = err instanceof Error,
    cex = asg ? err : new Error(tag),
    clg = console.log,
    dta = {
        exc: cex.name, 
        tag: tag,
        inf: Array.isArray(inf) ? inf.join("\n") : inf,
        msg: cex.message
    };

    if (typeof excInterceptor === 'function') 
        excInterceptor(dta, err);

    if (excToConsole) {
        clg("———————————————————————————————————————————————————————————————————————————");
        clg("EXC: ", dta.exc);
        clg("TAG: ", dta.tag);
        clg("INF: ", dta.inf);
        clg("MSG: ", dta.msg);
        clg("———————————————————————————————————————————————————————————————————————————");
    }
    if (!asg)
        throw cex;
}

function log(...args) {
    if (sysLogEnabled && sysLogFunction instanceof Function)
        sysLogFunction(...args);
}

/*———————————————————————————————————————————————————————————————————————————
  CLASS: sys [static singleton].
  USAGE: Contains Tore Js base system framework.
———————————————————————————————————————————————————————————————————————————*/
const sys = {

    // TObject states
    CTOR:-1,            // In construction.
	DEAD: 0,			// logically dead.
	LIVE: 1,			// live.
	SAVE: 2,			// saving.
	LOAD: 3,			// loading.

    /*———————————————————————————————————————————————————————————————————————————
      PROP: exceptionInterceptor : function [static]. 
      SET : Sets    the exception interceptor method.
      GET : Returns the exception interceptor method.
      ARGS: val : function : Exception interceptor method. :DEF: null.
  	  INFO: Interceptor method form should be function(dta, err)
            dta is {
                exc: <error classname>,
                tag: <exception tag>,
                inf: <exception info>,
                msg: <error message>
            },
            err is of class Error.
    ———————————————————————————————————————————————————————————————————————————*/
    set exceptionInterceptor(val = null) {
        if (val !== null && typeof val !== 'function')
            exc('E_INV_ARG', 'must be null or function.');
        excInterceptor = val;
    },

    get exceptionInterceptor() {
        return excInterceptor;
    },

    /*———————————————————————————————————————————————————————————————————————————
      PROP: exceptionToConsole : boolean [static].
      SET : Sets    if the exceptions will be written to console.
      GET : Returns if the exceptions will be written to console.
    ———————————————————————————————————————————————————————————————————————————*/
    set exceptionToConsole(val = true) {
        excLogToConsole = !!val;
    },

    get exceptionToConsole() {
        return excToConsole;
    },

    /*———————————————————————————————————————————————————————————————————————————
      PROP: logFunction : Function [static].
      SET : Sets    the logging function.
      GET : Returns the logging function .
      ARGS: val : function : logging function. :DEF: null.
    ———————————————————————————————————————————————————————————————————————————*/
    set logFunction(val = null) {
        if (val instanceof Function)
            sysLogFunction = val;
    },

    get logFunction() {
        return sysLogFunction;
    },

    /*———————————————————————————————————————————————————————————————————————————
      PROP: logEnabled : boolean [static].
      SET : Sets    if logging is enabled.
      GET : Returns if logging is enabled.
    ———————————————————————————————————————————————————————————————————————————*/
    set logEnabled(val = true) {
        sysLogEnabled = !!val;
    },

    get logEnabled() {
        return sysLogEnabled;
    },


    /*———————————————————————————————————————————————————————————————————————————
      FUNC: chk [static].                                      
      TASK:                                                     
    	Checks argument and if it is null or undefined then:
    		if inf =  null : returns false
    		if inf = !null : raises exception with tag.  
    	otherwise returns true.                                               
      ARGS:                                                     
    	arg : object        : Argument to check validity.   :DEF: null.     
    	inf : string        : Exception info if arg invalid.:DEF: null.   
    	tag : string        : Exception tag if arg invalid.	
                              :DEF: null => 'E_INV_ARG'.
      RETV: : boolean       : When inf = null, 
                                false if arg is null or undefined.
                                true if otherwise.
    ————————————————————————————————————————————————————————————————————————————*/
    chk(arg = null, inf = null, tag = null) {
        if (arg === undefined || arg === null){
            if (!inf)
                return false;
            if (tag === null)
                tag = 'E_INV_ARG';
            exc(tag, inf);
        }
        return true;		
    },

    /*———————————————————————————————————————————————————————————————————————————
      FUNC: str [static].                                      
      TASK:                                                     
    	Checks string argument and 
    	if it is null or empty or whitespace string then:
    		if inf =  null : returns false
    		if inf = !null : raises exception with tag and inf.  
    	otherwise returns true.                                               
      ARGS:                                                     
    	arg : string        : Argument to check validity.   :DEF: null.     
    	inf : string        : Exception info if arg invalid.:DEF: null.   
    	tag : string        : Exception tag if arg invalid.	
    						  :DEF: null => 'E_INV_ARG'.
      RETV: : boolean       : When inf = null, 
                                false if arg is null, empty or whitespace string.
                                true if otherwise.
    ————————————————————————————————————————————————————————————————————————————*/
    str(arg = null, inf = null, tag = null) {
    	if (typeof arg !== 'string' || WHITESPACE_REGEXP.test(arg)) {
            if (!inf)
                return false;
            if (tag === null)
                tag = 'E_INV_ARG',
            exc(tag, inf);
    	}
    	return true;		
    },

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: isClass [static].
      TASK: Returns true if the expression is a constructor.
      ARGS: cls : Class     : presumed constructor.
      RETV:	    : boolean   : true if x can be a constructor.
    ———————————————————————————————————————————————————————————————————————————*/
    isClass(cls = null) {
        if (!cls || !cls.prototype)
            return false;
        return ((cls.prototype && (cls === cls.prototype.constructor)) !== undefined);
    },

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isSuper [static].
	  TASK: Returns true if the class cls is super class of class sub or same.
	  ARGS:
		cls	: Class     : presumed super class (constructor).
		sub	: Class     : presumed descendant class (constructor).
	  RETV:	: boolean   : true if cls is Super Class or same of sub class.
    ———————————————————————————————————————————————————————————————————————————*/
    isSuper(cls, sub) {
        return( 
            sys.isClass(cls) &&
            sys.isClass(sub) &&	
            ((cls === sub)||(cls.prototype.isPrototypeOf(sub.prototype)))
        );
    },

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isIdent [static].
	  TASK: Returns true if the string can be an identifier (english only).
	  ARGS:	str	: string    : presumed identifier string.
	  RETV:	    : boolean   : true if string can be an identifier.
      INFO: No keyword checking, no utf8.
    ———————————————————————————————————————————————————————————————————————————*/
    isIdent(str) {
        return (typeof str === 'string' && IDENTIFIER_REGEXP.test(str));
    },
    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isPlain [static].
	  TASK: Returns true if object is a plain object.
	  ARGS:	obj	: object    : presumed plain object.
	  RETV:	    : boolean   : true if object is a plain object.
    ———————————————————————————————————————————————————————————————————————————*/
    isPlain(obj) {
        return (
            (!!obj) && (obj.__proto__ === null || obj.__proto__ === Object.prototype)
        );
    },
    
    /*———————————————————————————————————————————————————————————————————————————
	  FUNC:	classByName [static].
	  TASK:	Tries to fetch a constructor of a class with given name.
	  	    class constructor must be registered before.
	  ARGS:	name    : string	: Class name.
	  RETV:	        : Class 	: If registered the class constructor else null.
	———————————————————————————————————————————————————————————————————————————*/
	classByName(name = null) {
        var cls;
            
        if (typeof name !== 'string')
            return null;
        cls = classes[name];
        return (!cls) ? null : cls;			
    },
    
	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	fetchObject [static].
	  TASK:	Tries to fetch an object from its namepath.
	  ARGS:	namePath	: String	: object name path or
					    : Array		: pre splitted object name path
		    fromObject	: Object	: Start object. :DEF: null, means window.
	  RETV:			    : Object 	: fetched object.
      INFO: For arrays, a syntax like "myObject.subObjsArr.3.someProp" work.
      WARN: Raises exception if object or variable does not exist.
	———————————————————————————————————————————————————————————————————————————*/
	fetchObject(namePath = "", fromObject = null){
		var	curObj = (fromObject) ? fromObject : window,
			namArr,
			i;
		
		namArr = (namePath instanceof Array) ? namePath : (namePath === '') ? [] : namePath.split('.');
		try {								
			for(i in namArr)			// try fetching by names
				curObj = curObj[namArr[i]]; 
		} catch (e) {   				// on failure
			exc('E_REF_INV', null, namArr.join('.') + ' [' + namArr[i] + ']?');
		}
		return(curObj);					// return fetched
	},

    /*———————————————————————————————————————————————————————————————————————————
	  FUNC:	arrAddUnique [static].
	  TASK:	Adds an item to an array if it is not already added.
	  ARGS:	array	: Array		: Array to add item to.
		    item	: *			: Item to add.
	  RETV:	    	: number	: Index of item.
	  INFO:	*	Throws exception if array argument is null or not an array.
	———————————————————————————————————————————————————————————————————————————*/
	arrAddUnique(array = null, item = null) {
		var i;

		if (!array || !Array.isArray(array))
			exc('E_INV_ARG', 'array');
		i = array.indexOf(item);
		if (i > -1)
			return i;
		return array.push(item) - 1;
	},

    /*———————————————————————————————————————————————————————————————————————————
	  FUNC:	arrDelUnique [static].
	  TASK:	Deletes an item from an array if it exists.
	  ARGS:	array	: Array		: Array to remove item from.
		    item	: *			: Item to remove.
	  
      INFO: Unique here is the expected state of item in the array not a fact.
            This deletes the all instances of item it encounters in the array.
	  WARN:	*	Throws exception if array argument is null or not an array.
	———————————————————————————————————————————————————————————————————————————*/
	arrDelUnique(array = null, item = null) {
		var i;

		if (!array || !Array.isArray(array))
			exc('E_INV_ARG', 'array');
        while (true) {
		    i = array.indexOf(item);
		    if (i === -1)
			    return;
            array.splice(i, 1);
		}
	},

    /*———————————————————————————————————————————————————————————————————————————
	  FUNC:	registerClass [static].
	  TASK:	Adds a class to class registry. If it is not prepared, prepares it.
      ARGS:	cls	: Class	: Class constructor.
	———————————————————————————————————————————————————————————————————————————*/
    registerClass(cls = null) {
        if (!sys.isClass(cls))
            return;
        log("Registering " + cls.name + ".");
        if (!sys.isSuper(TObject, cls)) {
            classes[cls.name] = cls;
            return;
        }
        if (!cls[cls.name + 'ready'])
            prepareClassData(cls);
    },

    /*———————————————————————————————————————————————————————————————————————————
	  FUNC: bindHandler [static].
	  TASK: Binds a native event handler to a component in a closure.
	  ARGS:	target	: TComponent	: Target component to link the event.
			handler	: string		: Handler name to link the event.
	  RETV:			: function		: Bound anonymous function.
	  INFO: The returned bound function then should be assigned with 
	  		addEventListener() method to the source.
	———————————————————————————————————————————————————————————————————————————*/
	bindHandler: function(target = null, handler = null) {
		if(!(target instanceof TComponent))
			exc('E_INV_ARG', 'target');
		if(typeof handler !== 'string')
			exc('E_INV_ARG', 'handler');
		if(!(target[handler] instanceof Function))
			exc('E_HANDLER_INV', target.name + "." + handler);
		return(function(e){target[handler](e);});
	},

    /*———————————————————————————————————————————————————————————————————————————
      FUNC:	resolveODS  [static].
      TASK  Checks and resolves an Object Designator String (ODS).
      ARGS:	tar     : Object :  target object.
            par     : Object :  parent object. 
            ods     : String :  object designator string.
      RETV:         : *      :  if valid ODS, returns designated value.
                                otherwise, the ods string.                                 
      INFO: Invalid parameters raise exception.
    ———————————————————————————————————————————————————————————————————————————*/
    resolveODS: function(tar = null, par = null, ods = null) {
        sys.chk(tar, 'tar');
        sys.str(ods, 'ods');
        if (ods[0] !== '.')
            return ods;
        return fastResolveODS(tar, par, ods);
    },

    /*———————————————————————————————————————————————————————————————————————————
	  PROC:	propSet [static].
	  TASK:	Assigns a group of properties from an object to another.
	  ARGS:	
		t :  Object : target object to feed the properties.		:DEF: null. 
		s :  Object : source object containing property data.	:DEF: null.
		p :  Object : target parent (automatic).				:DEF: null.
					  p is used during recursive descent assignments for 
					  ".prnt." definitions automatically.
	  INFO:
        * Tricky object designator string values:
			propName: 	".t."   will fetch from "this" and assign.
			propName: 	".p."   will fetch from parent of "this" and assign.
			propName: 	".c."   will fetch from core and assign.

		* If t has properties which are also sub objects it is possible to 
		set their properties in a single call. Requirements are as follows:
        A) If sub object exists:
	        The data should be added like this: 
			<subObjectName>: { <prop>: <value>, <prop>: <value>}
			Ex: for a panel 'p' with a button named 'b' inside;
			propSet(p, {x: 10, y:10, b: {x:5, y:5} });
        B) If sub object does not exist:
		    It is possible to make sub objects during propSet.
		    <subObjectName>: {	_new_: <subObject className or class>,
								_var_: <assign as variable, look below>,
								<prop>: <value>, <prop: value>...}   
            Ex: for a panel 'p', to make a button named 'b' inside;
			propSet(p, {x: 10, y:10, b: {_new_: TButton, x:5, y:5} });
		    _new_ can be the class constructor or a string having class name.
		    _var_ is valid only for when target and sub object are components.
    		When set to false or not set at all it means the sub component 
            will be added as a member component. 
			THIS		 SUB			_var_    defaults to
			TComponent	 TComponent		false	(false - add as member)
			TComponent	 TComponent		true	(true  - add as variable)
			TComponent	!TComponent		ignored	(true  - add as variable)
		   !TComponent	!TComponent		ignored	(true  - add as variable)
		    When _var_ defaults to true, it is not overridable.
        C) If sub object exists the _new_ & _var_ are ignored.  
	———————————————————————————————————————————————————————————————————————————*/
    propSet: function(tar = null, src = null, par = null) { 
        var lst = [],
            res = [],
            bnd = [],
            cur = 0,
            itm,
            typ,
            val,
            cla,
            obj;


        function pushLst(t, s, p) {
            sys.chk(t, "target");
            sys.chk(s, "source");
            lst.push({t: t, s: s, p: p});
            if (t instanceof TObject)
                t._sta = sys.LOAD;
        }

        sys.arrAddUnique(res, par);
        sys.arrAddUnique(res, tar);
        pushLst(tar, src, par);

        while(cur < lst.length) {
            obj = lst[cur];
            tar = obj.t;
            src = obj.s;
            par = obj.p;
            cur++;                
            for(itm in src) {                                       // iterate source.      
                if (itm === '_new_' || itm === '_var_')             // If special keys,
                    continue;                                       // processed already.
                val = src[itm];                                     // get value.
                typ = typeof val; 
                if (typ === 'undefined' || val === null) {          // If undefined or null.          
                    tar[itm] = null;                                // set to null.
                    continue;                                       // next.
                }
                if (val.constructor !== Object) {		            // If primitive-ish,
                    if (typ === 'string' && val[0] === '.')         // If ODS, 
                        val = fastResolveODS(tar, par, val);        // set value to resolved.
                    tar[itm] = val;					                // set directly
                    continue;                                       // next.
                }		                                            // Here the value is Object.
                if (tar[itm]) {                                     // if target exists.
                    if (tar[itm] instanceof Object &&               // if target is Object and
                        !(tar[itm] instanceof TEventHandler)) {     // not an event handler and
                        pushLst(tar[itm], val,  tar);               // just transfer values.
                        continue;
                    }
                }                                                   // tar[itm] needs instantiation.
                cla = (val._new_) ? val._new_ : Object;
                if (typeof cla === 'string')		                // if class name
                    cla = sys.classByName(cla);		                // try fetching class
                if (!sys.isClass(cla))				                // if failed to fetch, exception
                    exc('E_CLASS_INV', (val._new_) ? val._new: 'null');
                obj = new cla();
                pushLst(obj, val, tar);                             // push to transfer list.
                if (obj instanceof TComponent) {
                    obj.name = val.name ? val.name : itm;
                    if (!val._var_) {                               // If member, pre-bind.
                        tar.attach(obj);                            // attach to owner.
                        continue;                                   // no more binding here.   
                    }
                } 
                bnd.push({t: tar, i: itm, o: sys.arrAddUnique(res, obj)});
            }
        }
        for (itm of bnd)                                            // lazy binder.
             itm.t[itm.i] = res[itm.o];
        for (itm of lst) {                                          // deserializinator :D
            if (itm.t instanceof TObject) 
                itm.t.doDeserializeEnd();
        }
    }
}

/*———————————————————————————————————————————————————————————————————————————
  FUNC:	fastResolveODS  [static private].
  TASK  resolves Object Designator Strings.
  ARGS:	tar     : Object :  target object.
        par     : Object :  parent object. 
        ods     : String :  object designator string.
  RETV:         : *      :  if valid ODS, returns designated value.
                            otherwise, the ods string.          
  INFO: Internal system function.
        This does not check parameters.
        Returns null when *value of the variable* is undefined.
  WARN: Raises exception when references or variable not found.
———————————————————————————————————————————————————————————————————————————*/
const R_ODS_STR = 'tpcw';
const R_ODS_ERR = ['E_NO_TARGET', 'E_NO_PARENT', 'E_NO_CORE', 'E_NO_WINDOW'];

function fastResolveODS(tar, par = null, ods) {
    var i,    // indexer.
        d,    // descriptor.
        r;    // root & return.
    
    if (ods.length > 2 && ods[2] !== '.')
        return ods;
    i = R_ODS_STR.indexOf(ods[1]);
    if (i === -1)
        return ods;
    d = ods.substr(3);
    r = [tar, par, core, window][i];
    if (!r)
        exc(R_ODS_ERR[i], ((tar._nam) ? tar._nam : '?') + '.' + itm + ' = .' + ods[1] +'.'+ d);
    r = sys.fetchObject(d, r);
    return  typeof r !== 'undefined' ? r : null;
}

/*———————————————————————————————————————————————————————————————————————————
  FUNC:	prepareClassData [static private].
  ARGS:	ctor	: Constructor of class to prepare.
  INFO: Internal system function.
———————————————————————————————————————————————————————————————————————————*/
function prepareClassData(ctor = null) {
    var	ptor,		// parent constructor.
        cdta,		// current prop data.
        pdta,		// parent prop data.
        rflg,
        cp,			// current prop.
        pp,			// parent prop.
        i;
    
    ptor = Object.getPrototypeOf(ctor).prototype.constructor;
    ptor = (ptor !== Object) ? ptor : null;
    if (ptor) {
        if (!ptor[ptor.name + 'ready'])
            prepareClassData(ptor);
    }	
    cdta = (ctor.cdta) ? ctor.cdta: {};
    pdta = (ptor) ? ptor.cdta: {};
    rflg = ctor.name + 'ready';
    if (ctor[rflg])
        return;
    // Add class info.
    ctor[rflg] = false;
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
    ctor[rflg] = true;
    classes[ctor.name] = ctor;
}
  
// This adds event properties to a class according to cdta.
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

// This makes sys hopefully static.
Object.freeze(sys);

// Register base classes.
sys.registerClass(TObject);
sys.registerClass(TEventHandler);
sys.registerClass(TComponent);

/*——————————————————————————————————————————————————————————————————————————— 
  CONST: core.
  TASKS: This is the singleton component named core.
  		 It constructs a component framework connecting various subsystems 
		 to each other. It integrates the system into one access point.
———————————————————————————————————————————————————————————————————————————*/
const core = new TComponent('core');

export {sys, exc, log, core};
