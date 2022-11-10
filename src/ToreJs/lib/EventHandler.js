/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	İhsan V. Töre
  About		: 	EventHandler.js: Tore Js event handler object class.
  License 	: 	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc } from "./system.js";
import { TObject } from "./TObject.js";

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: EventHandler
  TASKS:
  	Event handler class defines the handler target call information.
	An Event handler instance can be used only for one event.
	Component setEvent method takes care of that.
	Event handler instances connect source and target components, 
	if one of them gets destroyed, event handler instance is automatically
	destroyed.
———————————————————————————————————————————————————————————————————————————*/
export class EventHandler extends TObject {
	
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
	  TASK: Constructs a EventHandler instance.
	  ARGS: 
		target : Component	: 	Target handler component.
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
		setEventHandlerTarget(this, target);
		setEventHandlerMethod(this, method);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the EventHandler instance.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
	var t = this,
		i,
		src = t._src,
		tar = t._tar;

		if (t._rdy) {					// If assigned,
			delete src._eve[t._nam];	// Detach from event source.
			i = tar._hdt.indexOf(t);	// Kill back hook.
			if (i > -1)
				tar._hdt.splice(i, 1);
			if (t._fun)					// Remove bound function.
				src[t._def.src].removeEventListener(t._def.typ, t._fun);
			t._fun = null;
		}
		t._rdy = false;					// Release all data for GC.
		t._nam = null;
		t._src = null;
		t._tar = null;
		t._def = null;
		t._met = null;
		super.destroy();				// Logical destruction.
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: dispatch.
	  TASK: Calls the handler method in target component.
	  ARGS:
		args : Array : Arguments to pass to target handler method.
	  INFO:
		For triggering non-native events, this method is used directly, 
		If event handler instance is not valid, throws exception.
		By convention, it is recommended to pass the sender component as the 
		first argument.
	——————————————————————————————————————————————————————————————————————————*/
	dispatch(args){
		if (this._rdy)
			return this._tar[this._met].apply(this._tar, args);
		exc('E_INV_HANDLER', 
			((this._src) ? this._src._nam : "?") + "." +
			((this._nam) ? this._nam : "?") + " = [ EventHandler ]" +
			((this._tar) ? this._tar._nam : "?") + "." +
			 (this._met) ? this._met : "?");
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	target : Component or string;
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
		setEventHandlerTarget(this, val);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	method : string;
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
		setEventHandlerMethod(this, val);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	name : string;
	  GET : Returns event name at source (like 'onAttach' etc.).
	  INFO: This property is valid after assignment.
	——————————————————————————————————————————————————————————————————————————*/
	get name() { 
		return this._nam;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	source : Component;
	  GET : Returns event source component.
	  INFO: This property is valid after assignment.
	——————————————————————————————————————————————————————————————————————————*/
	get source() {
		return this._src;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete
	  TASK:	Used to signal event handler that loading (deserialization) is 
			complete.
	———————————————————————————————————————————————————————————————————————————*/
	doLoadComplete(){
		checkEventHandlerTarget(this);
		checkEventHandlerMethod(this);
		super.doLoadComplete();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: assign.
	  TASK: Assigns the handler method in target to event at source component.
	  ARGS:
		source 		: Component : Event source component (sender).
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
				return this.dispatch([this._src, e]);
			} 
			this._src is the sender; Event source component,
			e is the native event object.
			Then this._fun is added as event listener to native event source.
		Throws exception for invalid definitions.
	——————————————————————————————————————————————————————————————————————————*/
	assign(source = null, eventName = null){
	var t = this,
		d;

		if (t._rdy)
			return;
		checkEventHandlerTarget(this);
		checkEventHandlerMethod(this);
		if (!is.component(source))
			exc('E_INV_ARG', "source");
		if (typeof eventName !== 'string')
			exc('E_INV_ARG', 'eventName');
		d = source.class.cdta[eventName];
		if (!d || !d.event)
			exc('E_INV_ARG', 'eventName');
		t._rdy = true;
		t._src = source;
		t._nam = eventName;
		t._def = d;
		t._src._eve[t._nam] = t;
		t._tar._hdt.push(t);
		if (!t._def.src)
			return;
		t._fun = function(e) { 
			return t.dispatch([t._src, e]); 
		}
		t._src[t._def.src].addEventListener(t._def.typ, t._fun, false);
	}
}

// private.
// Controls the target handler component assignment.
function setEventHandlerTarget(handler, target) {
	if (target === null)
		return;
	if (handler._tar !== null)
		exc("E_SET_ONCE_ONLY", "target");
	if (typeof target === 'string')
		target = sys.fetchObject(target);
	handler._tar = target;
	checkEventHandlerTarget(handler);
}

// private.
// Controls the target handler component method name assignment.
function setEventHandlerMethod(handler, method) {
	if (method === null)
		return;
	if (handler._met !== null)
		exc("E_SET_ONCE_ONLY", "method");
	handler._met = method;
	if (handler._sta != sys.LOAD) 
		checkEventHandlerMethod(handler)
}

// private.
// Checks the target handler component assignment.
function checkEventHandlerTarget(handler) {
	if (is.component(handler._tar)) 
		return;
	handler._tar = null;
	exc("E_INV_VAL", "target != TComponent");
}

// private.
// Checks the target handler component method assignment.
function checkEventHandlerMethod(handler) {
	if (is.fun(handler._tar[handler._met])) 
		return;
	handler._met = null;
	exc("E_INV_VAL", "method");
}