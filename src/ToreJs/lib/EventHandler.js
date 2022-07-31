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
		t._src = null;
		t._tar = null;
		t._def = null;
		t._met = null;
		super.destroy();
	}

	dispatch(args){
		var t = this;
		return t._tar[t._met].apply(t._tar, args);
	}

	get target(){ return this._tar;}
	set target(value) {
		if (this._sta !== sys.LOAD)
			exc("E_CTOR_ONLY", "target");
		setEventHandlerTarget(this, value);
	}

	get method(){ return this._met;}
	set method(value){
		if (this._sta !== sys.LOAD)
			exc("E_CTOR_ONLY", "method");
		setEventHandlerMethod(this, value);
	}

	get name() { 
		return this._nam;
	}

	get source() {
		return this._src;
	}

	doLoadComplete(){
		checkEventHandlerMethod(this, this._met);
		super.doLoadComplete();
	}

	assign(source = null, eventName = null){
	var t = this;

		if (t._rdy)
			return;		
		if (!is.component(source))
			exc('E_INV_ARG',"source");
		if (!is.str(eventName))
			exc('E_INV_ARG', 'eventName');
		def = source.class.cdta[eventName];
		if (!def || !def.event)
			exc('E_INV_ARG', 'eventName');
		t._rdy = true;
		t._src = source;
		t._nam = eventName;
		t._def = def;
		t._src._eve[t._nam] = t;
		t._tar._hdt.push(t);
		if (!t._def.src)
			return;
		t._fun = function(e){ return t.dispatch([t._src, e]); }
		t._src[t._def.src].addEventListener(t._def.typ, t._fun, false);
	}
}

// private.
function setEventHandlerTarget(eventHandler, target){
	if (!is.component(target))
		exc("E_INV_ARG","target != TComponent");
	eventHandler._tar = target;
}
// private.
function setEventHandlerMethod(eventHandler, method){
	if (eventHandler._sta != sys.LOAD) 
		checkEventHandlerMethod(eventHandler, method)
	eventHandler._met = method;
}
// private.
function checkEventHandlerMethod(eventHandler, method){
	if (!is.fun(eventHandler._tar[method]))
		exc("E_INV_ARG","method");
}