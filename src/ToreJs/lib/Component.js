/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TComponent.js: Tore Js base component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc } from "./system.js";
import { TObject } from "./TObject.js";
import { EventHandler } from "./EventHandler.js";


/*——————————————————————————————————————————————————————————————————————————
  CLASS: Component.
  TASKS: This is the component class for Tore Js providing.
		1)	Component hierachy with ownership / membership relations.
		2)	Easy to use event notification mechanism.
——————————————————————————————————————————————————————————————————————————*/

export class Component extends TObject {

	/*——————————————————————————————————————————————————————————————————————————
		static allowMemberClass		: (used in attach method).
			The allowed anchestor class of member.
			When null component is not allowed have members.
	——————————————————————————————————————————————————————————————————————————*/
	static allowMemberClass = Component;
	/*——————————————————————————————————————————————————————————————————————————
		static allowMemberOverwrite	: (used in attach method).
			When the name of new member clashes	with an existing member name.
			true	:	Old member is destroyed first, new member is added.
			false	:	Raises exception.
	——————————————————————————————————————————————————————————————————————————*/
	static allowMemberOverwrite = true;

	static cdta = {
		name: {value:''},
		onAttach: {event: true},
		onDetach: {event: true},
		onLoadComplete: {event: true},
		onLanguageChange: {event: true}
	}

	_nam = '';		// name
	_own = null;	// owner
	_mem = {};		// members
	_eve = {};		// event handler links
	_hdt = [];		// event hook data

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a Component object, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new component :DEF: null.
							  if Sys.LOAD construction is by deserialization.
		owner	: Component	: Owner of the new component if any :DEF: null.
		data	: Object	: An object containing instance data:DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		if (name == sys.LOAD && super(sys.LOAD))
			return;
		super();
		if (name)
			this.name = name;
		if (is.component(owner)) 
			owner.attach(this);
		if (data)
			sys.propSet(data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the component.
	  INFO: Detaches events, owner and all members. Destroys all members.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
	var t = this,
		k;
	
		if(!t._sta)							// already dead
			return;
		for(k in t._hdt)					// unhook incoming events
			t._hdt[k].destroy();
		for(k in t._eve)					// unhook outgoing events
			t.setEvent(k, null);
		for(k in t._mem)					// destroy members
			t._mem[k].destroy();
		t._mem = null;
		if (t._own)							// detach from owner
			t._own.detach(t);
		super.destroy();					// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: autoname.
	  TASK: Generates and assigns a name for component automatically.
	  ARGS:
		ownerCandidate : TComponent : Owner candidate of the component.
	  INFO:
		Without owner candidate, name can not be computed.
	——————————————————————————————————————————————————————————————————————————*/
	autoname(ownerCandidate = null) {
		var t = this,
			i = 1,
			n;

		if (!ownerCandidate)
			return;
		n = t.class.name.toLowerCase();
		while(true) {
			if (!ownerCandidate[n+i]) {
				t.name = n+i;
				return;
			}
			i++;
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
		Member subsystem
		
		Member subsystem introduces owner dependant components.
		Member components are like dynamic variables with five exceptions;

		1)	Member components are owned.
			They are destroyed if owner gets destroyed.
		2)	They can not be assigned or removed directly. 
			This should be done via attach and detach methods.
		3)	They should be Component or descendant class instances.
		4)	Member chain is strictly hierarchical. 
			An owner be a member in one of the components in its member chain.
		5)	Members are accessed by their names. 
			Member names should be identifiers.
			A getter for this.memberName is defined.
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach
	  TASK:	Attaches a member component to the component.
	  ARGS:
		component	: Component	: new member component.
	  RETV: 		: Boolean	: True on success
	  INFO:	
		Member components are added to _mem object and a getter
		is constructed for the this.<memberName> getting member component.
		onAttach event is dispatched after attachment.

		static allowMemberClass		:
			The allowed anchestor class of member.
			When null, component is not allowed have members.
		static allowMemberOverwrite	:	
			When the name of new member clashes	with an existing member name.
			true	:	Old member is destroyed first, new member is added.
			false	:	Raises exception.
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
	var t = this,
		allow = t.class.allowMemberClass,
		write = t.class.allowMemberOverwrite,
		event = t.onAttach,
		c = component,
		o,
		n;
		
		t.checkDead();
		if (!c)
			exc('E_MEM_NULL', 'component');
		if (!allow)
			exc('E_MEM_NOT_ALLOWED', t.class.name);
		if (!(c instanceof allow))			// if c is not permitted
			exc('E_MEM_RESTRICTED', 'component: ! '+ allow.class.name);
		if (c._own === t)					// if already attached to this
			return(false);
		o = t;
		while(o) {							// test if biting own tail
			if (c === o)
				exc('E_MEM_RING', t.namePath +"<-"+ c._nam);
			o = o._own;
		}
		if (!c._nam)						// If component is not named.
			c.autoname(t);					// give it a name.
		n = c._nam;							// get name
		if (write && t._mem[n])				// if overwritable and has member
			t._mem[n].destroy();			// destroy old member
		if (n in t)							// If has element with same name
			exc('E_MEM_NAME', n);
		if (c._own)							// If has an owner.
			c._own.detach(c);				// detach from it.
		c._own = t;
		t._mem[n] = c;
		Object.defineProperty( t, n, {
				get:function(){return(this._mem[n]);},
				enumerable: false,
				configurable: true			// deletable.
			}
		);
		c.attached();						// Inform component.
		if (event)
			event.dispatch([t, c]);
		return(true);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	detach
	  TASK:	Detaches a member component from the component.
	  ARGS:	
	  	component	: Component : member component to detach.
		kill		: Boolean	 : When true, detached component gets destroyed.
								   :DEF: false.
	  RETV: 		: Boolean	 : True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null, kill = false) {
	var t = this,
		c = component,
		event = t._eve.onDetach;
		
		t.checkDead();
		if (!is.component(c))				// if not a component exception
			exc('E_ARG_INV','component');
		if (c._own != t)					// if barking at the wrong tree
			return false;
		if (event)							// dispatch if event exists
			event.dispatch([t, c]);
		c._own = null;						// detach
		delete t[c._nam];					// delete getter.
		delete t._mem[c._nam];				// remove.
		c.detached(this);					// Inform component.
		if (kill)
			c.destroy();
		return true;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doAttached.
	  TASK:	Method to override to handle when "this" is attached to an owner.
	———————————————————————————————————————————————————————————————————————————*/
	doAttached() {}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doDetached.
	  TASK:	Method to override to handle when "this" is detached from an owner.
	  ARGS:
	  	exOwner	: Component : owner that "this" is detached from. :DEF: null
	———————————————————————————————————————————————————————————————————————————*/
	doDetached(exOwner = null) {}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	members
	  TASK:	Returns an array filled with member components.
	  ARGS:
	  	ofClass	: Object : class filter (ctor) 	:DEF: TComponent.
		filter	: Object : key-value filter  	:DEF: null.
	  RETV:		: Array  : member components.
	  INFO: 
	  	This is a shallow copy of members and any manipulation on array
		has no effect on members.
	———————————————————————————————————————————————————————————————————————————*/
	members(ofClass = Component, filter = null) {
	var t = this, 
		r = [],
		mem,
		itm;	

		function canAdd(nam){
			mem = t._mem[nam];
			if (!(mem instanceof ofClass))	// if class is not ok
				return false;
			for(itm in filter) {
				if (filter[itm] !== mem[itm])
					return false;
			}
			return true;
		}
	
		t.checkDead();
		if(!ofClass)						// check class filter
			ofClass = TComponent;	
		for(nam in t._mem){					// look members
			if (canAdd(nam))
				r.push(mem);				// collect it
		}
		return(r);
	}

	/*——————————————————————————————————————————————————————————————————————————
		Event subsystem
		
		WARNING: System automatically defines getters and setters for events.
		
		*	This subsystem adds event support to Tore Js components.
		*	Two main types of events are supported:
			1) Native Js events originating from any asset of the Component.
			2) Events originating from Components.
		*	The native events are translated to Component event subsystem.
		*	The Component events are not translated to native event flow.
		*	Event definitions are made in the class cdta.
		
			1)	Component events	: <eventName>: {event: true}
				Example: onAttachMember : {event: true},
			2)	Native events		: <eventName>: {
										event: true, 
										typ: <native event type name>, 
										src: <source object name>
									}
				Example: onOpen	: {event: true, typ:'open', src:'loader'}.
		*	Using events is straightforward: 
			To attach an event c1.onOpen to function c2.handler : 
				c1.onOpen = new EventHandler(c2,'handler');	
			To detach that event: 
				c1.onOpen = null;
		*	Events are designed carefully to avoid memory leaks. 
			An event connection is monitored by both source and target sides.
			If one side gets destroyed the event connection is destroyed, 
			this is done by hook subsystem automatically.
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: setEvent
	  TASK:	Event assignment procedure.
	  ARGS:	
		name	: String		: name of the event.
		handler	: EventHandler	: Event handler target object.
	  INFO:	This checks the event and the handler then assigns them.
	——————————————————————————————————————————————————————————————————————————*/
	setEvent(name = null, handler = null){
	var t = this,
		h = t._eve[name],
		d = t.constructor.cdta[name],
		hndNul = (handler === null),
		hndIns = (handler instanceof EventHandler);

		t.checkDead();
		if (!d || !d.event)							// if not an event, exception
			exc('E_EVENT_INV', name);
		if (!hndNul && h && h === handler)			// Same?.
			return;
		if (!(hndNul || hndIns))					// Valid parameter?
			exc('E_EVENT_ARG', "handler");
		if (h)										// if assigned, clear
			h.destroy();
		if (hndNul)									// if handler null,
			return;									// we just clear.
		if (handler.source) 						// if handler is in use,
			handler = new EventHandler(handler.target, handler.method)
		handler.assign(this, name);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: getEvent
	  TASK:	Returns the event handler assigned to an event if any.
	  ARGS:	
		name	: String		: name of the event.
	  RETV: 	: TEventHandler : event handler object or null.
	——————————————————————————————————————————————————————————————————————————*/
	getEvent(name = null) {
		if (!is.str(name))
			return null;
		r = this._eve[name];
		return (r) ? r : null;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	saveState 
	  TASK:	Saves published and dynamic properties to a generic object.
	  RETV:		: Object 
	  INFO:	Published properties with the default values are not saved.
			Dynamic properties are saved without such optimization.
	———————————————————————————————————————————————————————————————————————————*/
	saveState() {
	var t = this,
		r;
		
		r = super.saveState(); 	// call inherited
		r['m']= t._mem;
		r['e']= t._eve;
		return(r);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROC:	doLoadComplete
	  TASK:	Signals component that loading (deserialization) is complete.
	——————————————————————————————————————————————————————————————————————————*/
	doLoadComplete() {
	var t = this,
		d = t.onLoadComplete;
		
		if (d)
			d.dispatch([t]);
		super.doLoadComplete();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange(){
	var t = this,
		d = t.onLanguageChange,
		n;
		
		
		if (d)
			d.dispatch([t]);
		for(n in t._mem)					// propagate to members
			t._mem[n].doLanguageChange();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	name : String;
	  TASK:	GET  : Returns component name.
			SET  : Checks name validity, then sets the name of the component.
	——————————————————————————————————————————————————————————————————————————*/
	get name() {
		return(this._nam);
	}
		
	set name(value) {
	var t = this;	
	
		if (value == t._nam)
			return;
		if (!is.ident(value))
			exc('E_NAME_SYNTAX', value);
		if (t._own){
			if (value in t._own)
				exc('E_NAME_CLASH', t.own.name + "." + value);
			delete t._own[t._nam];
			delete t._own._mem[t._nam];
			t._own._mem[value] = t;
			Object.defineProperty( t, n, {
					get:function(){return(this._mem[n]);},
					enumerable: false,
					configurable: true			// deletable.
				}
			);
		}
		t._nam = value;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	namePath : String 
	  TASK:	GET : Returns the global component name path string.
	————————————————————————————————————————————————————————————————————————————*/
	get namePath(){
	var t = this;
		return((t._own ? t._own.namePath + '.' : '') + t._nam);
	}
	/*————————————————————————————————————————————————————————————————————————————
	  PROP: owner
	  TASK:	GET : Get owner of the component.
	 ———————————————————————————————————————————————————————————————————————————*/
	get owner(){
		return(this._own);
	}
}