/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230301
  Author	: 	İhsan V. Töre
  About		: 	TEventHandler.js: Tore Js event handler object class.
  License 	: 	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc } from "./TSystem.js";
import { TObject } from "./TObject.js";
import { TComponent } from "./TComponent.js";


/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TEventHandler.
  TASKS:
  	Event handler class defines the handler target call information.
	An Event handler instance can be used only for one event.
	TComponent setEvent method takes care of that.
	Event handler instances connect source and target components, 
	if one of them gets destroyed, event handler instance is automatically
	destroyed.
———————————————————————————————————————————————————————————————————————————*/
export class TEventHandler extends TObject {
	
	static cdta = {
		target: {value: null},
		method: {value: ""},
        jobQueue: {value: null},
        jobParam: {value: null}
	}

	_rdy = false;	// Internal ready flag.
	_fun = null;	// Bound function as event listener.
	_nam = null;	// Event name set by assign().
	_src = null;	// Source component set by assign().
	_tar = null; 	// Target handler component.
	_met = null;	// Handler method name in target handler component.
    _que = null;    // Job queue if any.
    _par = null;    // Job queue parameters if any.

	/*———————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TEventHandler instance.
	  ARGS: 
		target      : TComponent	: Target handler component or
			        : string        : Target handler component namepath. 
			   					      :DEF: null.
								      if Sys.LOAD construction is by 
                                      deserialization.
		method      : string		: Handler method name in target component.
                    : Function      : Handler method in target component.
								      :DEF: null.
        jobQueue    : string        : Job Queue name.
                    : TJobQueue     : Job Queue object.
                                      :DEF: null.
        jobParam    : Object        : Job Queue specific parameters as object.
                                      :DEF: null.                            
	———————————————————————————————————————————————————————————————————————————*/
	constructor (target = null, method = null, jobQueue = null, jobParam = null) {
		if (target === sys.LOAD && super(sys.LOAD))
			return;
		super();
		setHandlerTarget(this, target);
		setHandlerMethod(this, method);
        setJobQueue(this, jobQueue);
        setJobParam(this, jobParam);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TEventHandler instance.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
	var	t = this,
        src = t._src,
		tar = t._tar,
        idx = t._rdy ? tar._hdt.indexOf(t) : -1,
        def = t._rdy ? src.class.cdta[t._nam] : null;


		if (t._rdy) {					    // If assigned,
			delete src._eve[t._nam];	    // Detach from event source.
            if (idx > -1)
				tar._hdt.splice(idx, 1);
			if (t._fun)					    // Remove bound function.
				src[def.src].removeEventListener(def.typ, t._fun);
		}
        t._fun = null;
		t._rdy = false;					    
		t._nam = null;
		t._src = null;
		t._tar = null;
		t._met = null;
        t._que = null;
        t._par = null;
		super.destroy();				    // Logical destruction.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dispatch.
	  TASK: Calls or queues the handler method in target component.
            Sender (source) is automatically added as the first argument.
	  ARGS:
		args : Array : Arguments to pass to target handler method.
	  INFO:
		For triggering non-native events, this method is used directly, 
		If event handler instance is not valid, throws exception.
        If pushed to a queue, queue add method must be like 
        add(instance, method, arguments, extra parameter data for queue);
	——————————————————————————————————————————————————————————————————————————*/
	dispatch(...args) {
        var t = this;

		if (!t._rdy) 
            t.assign(t._src, t._nam);
        if (!t._rdy) {
            exc('E_INV_HANDLER', 
			(t._src ? t._src.nameStr : "?")  + "." +
			(t._nam ? t._nam : "?") + " = [ TEventHandler ]" +
			(t._tar ? t._tar.nameStr : "?") + "." +
			(t._met ? t._met : "?"));
        }
        if (t._que) 
            return t._que.add(t._tar, t._tar[t._met], [t._src, ...args], t._par);
		else
        	return t._tar[t._met].apply(t._tar, [t._src, ...args]);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	target : TComponent or string.
	  GET : Returns target handler component.
	  SET : Sets target handler component.
	  INFO: Target component can only be set once.
			If set value is string, component is fetched by sys.fetchObject().
	  		Throws exception if not a component descendant.
	——————————————————————————————————————————————————————————————————————————*/
	get target() { 
		return this._tar;
	}

	set target(val) {
		setHandlerTarget(this, val);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	method : string.
	  GET : Returns target handler component method name.
	  SET : Sets target handler component method name.
	  INFO: Method name can only be set once.
			Throws exception if : 
                method already given or
				target component assigned and method does not exist.
	——————————————————————————————————————————————————————————————————————————*/
	get method() {
		return this._met;
	}

	set method(val) {
		setHandlerMethod(this, val);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	jobQueue : TJobQueue.
	  GET : Returns job queue if any.
	  SET : Sets job queue.
	  INFO: This can only be set once.
	——————————————————————————————————————————————————————————————————————————*/
	get jobQueue() {
		return this._que;
	}

	set jobQueue(val) {
		setJobQueue(this, val);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	jobParam : God knows whatever.
	  GET : Returns job parameter(s) if any.
	  SET : Sets job parameters.
	  INFO: This can only be set once.
            This must contain job specific parameters.
	——————————————————————————————————————————————————————————————————————————*/
	get jobParam() {
		return this._que;
	}

	set jobParam(val) {
		setJobParam(this, val);
    }

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	name : string.
	  GET : Returns event name at source (like 'onAttach' etc.).
	  INFO: This property is valid after assignment.
	——————————————————————————————————————————————————————————————————————————*/
	get name() { 
		return this._nam;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	source : TComponent.
	  GET : Returns event source component.
	  INFO: This property is valid after assignment.
	——————————————————————————————————————————————————————————————————————————*/
	get source() {
		return this._src;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: assign.
	  TASK: Assigns the handler method in target to event at source component.
	  ARGS:
		source 		: TComponent : Event source component (sender).
		eventName	: string	: Event definition name like 'onDetach'.
	  INFO:
		Checks 
			target component, 
			target component method, 
			source component,
			event,
		Completes the definition of event handler instance.
		Binds back hook data to target component.
		Binds itself to source component event.
		For native events, 
			Embeds dispatch into a bound method closure as:
			this._fun = function(e) { 
				return this.dispatch(e);
			} 
			e is the native event object.
			Then this._fun is added as event listener to native event source.
		Throws exception for invalid definitions.
	——————————————————————————————————————————————————————————————————————————*/
	assign(source = null, eventName = null){
	    var t = this,
            d;

		if (t._rdy)
			return;
		checkHandlerTarget(t);
		checkHandlerMethod(t);
		if (!(source instanceof TComponent))
			exc('E_INV_ARG', "source");
		if (typeof eventName !== 'string')
			exc('E_INV_ARG', 'eventName');
		d = source.class.cdta[eventName];
		if (!d || !d.event)
			exc('E_INV_ARG', 'eventName');
		t._src = source;
		t._nam = eventName;
        t._src._eve[t._nam] = t;
        t._tar._hdt.push(t);
		if (d.src) {    // if native.
			if (!t._src[d.src])
                exc('E_EVENT_SRC', t._src.name + '.' + d.src);
		    t._fun = function(e) { 
			    return this.dispatch(e); 
		    }
		    t._src[d.src].addEventListener(d.typ, t._fun, false);
        }
        t._rdy = true;
	}
}

// private. Controls the target handler component assignment.
function setHandlerTarget(t, target) {
    if (typeof target === 'string')
		target = sys.fetchObject(target);
    if (!setChecker(t, '_tar', 'target', target))
        return;
	t._tar = target;
}

// private. Controls the target handler component method name assignment.
function setHandlerMethod(t, method) {
    if (method instanceof Function) 
        method = method.name;
    if (!setChecker(t, '_met', 'method', method))
        return;
	t._met = method;
}

// private. Controls the job queue assignment.
function setJobQueue(t, queue) {
    if (!setChecker(t, '_que', 'jobQueue', queue))
        return;
    t._que = queue;
}

// private. Controls the job parameter assignment.
function setJobParam(t, param) {
    if (!setChecker(t, '_par', 'jobParam', param))
        return;
    t._par = par;
}

// private. Set checker DRY code.
function setChecker(t, pvar, name, val) {
    if (val === t[pvar])
        return false;
    if (t[pvar] !== null)
        exc("E_SET_ONCE_ONLY", name);
    return true;
}

// private. Checks the target handler component.
function checkHandlerTarget(t) {
    if (t._tar instanceof TComponent) 
		return;
	t._tar = null;
	exc("E_INV_VAL", "target != TComponent");
}

// private. Checks the target handler component method.
function checkHandlerMethod(t) {
	if (t._tar && typeof t._tar[t._met] === 'function') 
		return;
	t._met = null;
	exc("E_INV_VAL", "method != function");
}

// register class at sys.