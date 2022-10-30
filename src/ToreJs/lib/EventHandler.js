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
———————————————————————————————————————————————————————————————————————————*/
export class EventHandler extends TObject {
	
	static cdta = {
		target: {value: null},
		method: {value: ""}
	}

	_rdy = false; 	// Internal
	_fun = null; 	
	_nam = null; 	// Via TComponent.setEvent
	_src = null;
	_def = null;
	_tar = null; 	// These are from here.
	_met = null;

	constructor (target = null, method = null) {
		if (target == sys.LOAD && super(sys.LOAD))
			return;
		super();
		setEventHandlerTarget(this, target);
		setEventHandlerMethod(this, method);
	}

	destroy(){
	var t = this,
		i,
		src = t._src,
		tar = t._tar;

		if (t._rdy) {
			delete src._eve[t._nam];
			i = tar._hdt.indexOf(t);
			if (i > -1)
				tar._hdt.splice(i, 1);
			if (t._fun)
				src[t._def.src].removeEventListener(t._def.typ, t._fun);
			t._fun = null;
		}
		t._rdy = false;
		t._nam = null;
		t._src = null;
		t._tar = null;
		t._def = null;
		t._met = null;
		super.destroy();
	}

	dispatch(args){
		if (this._rdy)
			return this._tar[this._met].apply(this._tar, args);
		exc('E_INV_HANDLER', 
			((this._src) ? this._src._nam : "?") + "." +
			((this._nam) ? this._nam : "?") + " = [ EventHandler ]" +
			((this._tar) ? this._tar._nam : "?") + "." +
			 (this._met) ? this._met : "?");
	}

	get target(){ return this._tar;}
	set target(value) {
		setEventHandlerTarget(this, value);
	}

	get method(){ return this._met;}
	set method(value){
		setEventHandlerMethod(this, value);
	}

	get name() { 
		return this._nam;
	}

	get source() {
		return this._src;
	}

	doLoadComplete(){
		checkEventHandlerMethod(this);
		super.doLoadComplete();
	}

	assign(source = null, eventName = null){
	var t = this,
		d;

		if (t._rdy)
			return;
		checkEventHandlerTarget(this);
		checkEventHandlerMethod(this);
		if (!is.component(source))
			exc('E_INV_ARG', "source");
		if (!is.str(eventName))
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
function checkEventHandlerTarget(handler) {
	if (is.component(handler._tar)) 
		return;
	handler._tar = null;
	exc("E_INV_VAL", "target != TComponent");
}

// private.
function checkEventHandlerMethod(handler) {
	if (is.fun(handler._tar[handler._met])) 
		return;
	handler._met = null;
	exc("E_INV_VAL", "method");
}