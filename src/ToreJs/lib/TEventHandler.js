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
		method: {value: ""}
	}

	_rdy = false;	// Internal ready flag.
	_fun = null;	// Bound function as event listener.
	_nam = null;	// Event name set by assign().
	_src = null;	// Source component set by assign().
	_def = null;	// Event definition data object set by assign().
	_tar = null; 	// Target handler component.
	_met = null;	// Handler method name in target handler component.

	/*———————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TEventHandler instance.
	  ARGS: 
		target : TComponent	: 	Target handler component.
			   : string     : 	Target handler component namepath. 
			   					:DEF: null.
								if Sys.LOAD construction is by deserialization.
		method : string		:	Handler method name in target handler component.
								:DEF: null.
	———————————————————————————————————————————————————————————————————————————*/
	constructor (target = null, method = null) {
		if (target === sys.LOAD && super(sys.LOAD))
			return;
		super();
		setTEventHandlerTarget(this, target);
		setTEventHandlerMethod(this, method);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TEventHandler instance.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
	var	i,
		src = this._src,
		tar = this._tar;

		if (this._rdy) {					// If assigned,
			delete src._eve[this._nam];	    // Detach from event source.
			i = tar._hdt.indexOf(this);	    // Kill back hook.
			if (i > -1)
				tar._hdt.splice(i, 1);
			if (this._fun)					// Remove bound function.
				src[this._def.src].removeEventListener(this._def.typ, this._fun);
			this._fun = null;
		}
		this._rdy = false;					// Release all data for GC.
		this._nam = null;
		this._src = null;
		this._tar = null;
		this._def = null;
		this._met = null;
		super.destroy();				    // Logical destruction.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dispatch.
	  TASK: Calls the handler method in target component.
            Sender (source) is automatically added as the first argument.
	  ARGS:
		args : Array : Arguments to pass to target handler method.
	  INFO:
		For triggering non-native events, this method is used directly, 
		If event handler instance is not valid, throws exception.
	——————————————————————————————————————————————————————————————————————————*/
	dispatch(...args) {
		if (this._rdy)
           	return this._tar[this._met].apply(this._tar, [this._src, ...args]);
        exc('E_INV_HANDLER', 
			((this._src) ? this._src._nam : "?") + "." +
			((this._nam) ? this._nam : "?") + " = [ TEventHandler ]" +
			((this._tar) ? this._tar._nam : "?") + "." +
			 (this._met) ? this._met : "?");
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
		setTEventHandlerTarget(this, val);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	method : string.
	  GET : Returns target handler component method name.
	  SET : Sets target handler component method name.
	  INFO: Method name can only be set once.
			Throws exception if :
				method already given.
				target component assigned and method does not exist.
	——————————————————————————————————————————————————————————————————————————*/
	get method() {
		return this._met;
	}

	set method(val) {
		setTEventHandlerMethod(this, val);
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

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete.
	  TASK:	Used to signal event handler that loading (deserialization) is 
			complete.
	———————————————————————————————————————————————————————————————————————————*/
	doLoadComplete(){
		checkTEventHandlerTarget(this);
		checkTEventHandlerMethod(this);
		super.doLoadComplete();
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
	    var def;

		if (this._rdy)
			return;
		checkTEventHandlerTarget(this);
		checkTEventHandlerMethod(this);
		if (!(source instanceof TComponent))
			exc('E_INV_ARG', "source");
		if (typeof eventName !== 'string')
			exc('E_INV_ARG', 'eventName');
		def = source.class.cdta[eventName];
		if (!def || !def.event)
			exc('E_INV_ARG', 'eventName');
				this._src = source;
		this._nam = eventName;
		this._def = def;
		this._src._eve[this._nam] = this;
		this._tar._hdt.push(this);
		if (this._def.src) {    // if native.
			if (!this._src[this._def.src])
                exc('E_EVENT_SRC', this._src.name + '.' + this._def.src);
		    this._fun = function(e) { 
			    return this.dispatch(e); 
		    }
		    this._src[this._def.src].addEventListener(this._def.typ, this._fun, false);
        }
        this._rdy = true;
	}

}

// private.
// Controls the target handler component assignment.
function setTEventHandlerTarget(handler, target) {
	if (target === handler._tar)
		return;
	if (handler._tar !== null)
		exc("E_SET_ONCE", "target");
	if (typeof target === 'string')
		target = sys.fetchObject(target);
	handler._tar = target;
	checkTEventHandlerTarget(handler);
}

// private.
// Controls the target handler component method name assignment.
function setTEventHandlerMethod(handler, method) {
	if (method === handler._met)
		return;
	if (handler._met !== null)
		exc("E_SET_ONCE_ONLY", "method");
	handler._met = method;
	if (handler._sta != sys.LOAD) 
		checkTEventHandlerMethod(handler)
}

// private.
// Checks the target handler component assignment.
function checkTEventHandlerTarget(handler) {
	if (handler._tar instanceof TComponent) 
		return;
	handler._tar = null;
	exc("E_INV_VAL", "target != TComponent");
}

// private.
// Checks the target handler component method assignment.
function checkTEventHandlerMethod(handler) {
	if (typeof handler._tar[handler._met] === 'function') 
		return;
	handler._met = null;
	exc("E_INV_VAL", "method != function");
}