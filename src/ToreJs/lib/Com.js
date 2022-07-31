/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	İhsan V. Töre
  About		: 	Com.js: Tore Js http client communicator component class.
  License	:   MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc } from "./system.js";
import { Component } from "./Component.js";
import { EventHandler } from "./EventHandler.js";

/*————————————————————————————————————————————————————————————————————————————
  FUNC: send.
  TASK: Builds a Com component sets it up and sends the request.
  ARGS: Arguments map to Com component properties, please refer there.
  RETV: 	: Promise : resolve returns XMLHttpRequest object.
  INFO: On completion of communication, com component is auto destroyed.
————————————————————————————————————————————————————————————————————————————*/

export function send(owner=null, method='POST', url='', content=null,
	responseType='blob', query=null, headers=null, user=null, pass=null) {

	var o = {method: method, url: url, content: content, 
		responseType: responseType,	query: query,
		headers: headers, user: user, pass: pass };
	return sendPromise(owner, o);
}

// internal.
function sendPromise(owner = null, options = null){
	return new Promise ( (resolve, reject) => {
		var com = new Com(null, owner, options);
			xhr = com.xhr,
			err = () => reject(xhr.statusText);

		xhr.onerror = err;
		xhr.onabort = err;
		xhr.ontimeout = err;
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(xhr);
			} else {
				err();
			}
		};
		xhr.onloadend = () => {
			xhr.onerror = null;
			xhr.onabort = null;
			xhr.ontimeout = null;
			xhr.onload = null;
			xhr.onloadEnd = null;
			com.destroy();
		};
		com.send();
	});
}

/*————————————————————————————————————————————————————————————————————————————
  CLASS: Com.
  TASKS:
	Defines http client communicator class.
	* It is an XHR wrapper.
	* Does not allow members.
	* Communication is always asynchronous.
	* Normally used by send(), talk() methods above.
	* It is exported also as a micro management option.
  USAGE:

	* Properties:

	method					as http method, default is 'POST'.
	url						as url, default is ''.
	content 				as content, default is null.
	responseType			as responseType, default is 'blob'.
	query					as query object, default is null.
	headers					as headers object, default is null.
	user					as username, default is null.
	pass					as password, default is null.

	* Request and upload events, default null:

	onLoadStart, onProgress, onAbort, onTimeout, onError, onLoad, onLoadEnd.
	onUploadStart, onUploadProgress, onUploadAbort,	onUploadTimeout,
	onUploadError, onUpload, onUploadEnd.

	* If an owner is given;

	comLoadStart, comProgress, comAbort, comTimeout,
	comError, comLoad, comLoadEnd,
	comUploadStart, comUploadProgress, comUploadAbort,	comUploadTimeout,
	comUploadError, comUpload, comUploadEnd

	handler methods are sought in the owner, and the existing ones are
	bound to their respective events.

	Handler method signature example: 
		owner.comLoadStart(sender, e)
			where sender is com object and e is the event object.
————————————————————————————————————————————————————————————————————————————*/
export class Com extends Component {
	
	static cdta = {
		method: {value: 'POST'},
		url: {value:	''},
		content: {value: null},
		responseType: {value: 'blob'},
		query: {value: null},
		headers: {value: null},
		timeout: {value: 0},
		user: {value: null},
		pass: {value: null},
		
		onLoadStart: {event: true, typ: 'loadstart', src: '_xhr'},
		onProgress: {event: true, typ: 'progress', src: '_xhr'},
		onAbort: {event: true, typ: 'abort', src: '_xhr'},
		onTimeout: {event: true, typ: 'timeout', src: '_xhr'},
		onError: {event: true, typ: 'error', src: '_xhr'},
		onLoad: {event: true, typ: 'load', src: '_xhr'},
		onLoadEnd: {event: true, typ: 'loadend', src: '_xhr'},
		
		onUploadStart: {event: true, typ: 'loadstart', src: '_upl'},
		onUploadProgress: {event: true, typ: 'progress', src: '_upl'},
		onUploadAbort: {event: true, typ: 'abort', src: '_upl'},
		onUploadTimeout: {event: true, typ: 'timeout', src: '_upl'},
		onUploadError: {event: true, typ: 'error', src: '_upl'},
		onUpload: {event: true, typ: 'load', src: '_upl'},
		onUploadEnd: {event: true, typ: 'loadend', src: '_upl'},
	};
	
	static allowMemberClass = null;

	_xhr = null;				// XMLHttpRequest Object
	_res = null;				// response object (shortcut).
	_upl = null;				// upload object (shortcut).
	
	_met = 'POST';				// method.
	_url = '';					// url.
	_cnt = null;				// content.
	_typ = 'blob';				// response type.
	_qry = null;				// query.
	_hdr = null;				// headers.
	_pfx = null;				// owner handlers prefix.
	
	_usr = null;				// user name if required.
	_pwd = null;				// user pass if required.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: Com.
	  TASK: Constructs an http communicator component.
	  ARGS:
		name	: String		: Name of new communicator			:DEF: null.
		owner	: TComponent	: Owner component.					:DEF: null.
		data	: Object		: An object containing instance data:DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name);
		this._xhr = new XMLHttpRequest();
		this._upl = this._xhr.upload;
		if (is.component(owner))
			owner.attach(this);
		if (data)
			sys.propSet(this, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy [override].
	  TASK: Destroys the http communicator component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		this._xhr = null;
		super.destroy();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doAttached [override].
	  TASK:	Seeks for com<event> handler methods* in new owner and binds them.
	  INFO: * Methods like: owner.comOnLoad(this, e) etc.
	———————————————————————————————————————————————————————————————————————————*/
	doAttached() {
		var o = this._own,
			h;

		if (!o)
			return;
		for(h in OWNER_HANDLERS_LIST){	// set all available handlers to events.
			if (is.fun(o['com' + h]))
				this.setEvent('on' + h, new EventHandler(o, 'com' + h));
		}
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doDetached [override].
	  TASK:	Seeks for bound handler methods* to old owner and unbinds them.
	  ARGS:
	  	exOwner	: TComponent : owner that "this" is detached from. :DEF: null
	  INFO: * Methods like: exOwner.comOnLoad(this, e) etc.
	———————————————————————————————————————————————————————————————————————————*/
	doDetached(exOwner = null) {
		if (!exOwner)
			return;
		for(e in this._eve) { 		// Clear all events targeting ex owner.
			if (this._eve[e].target === exOwner)
				this.setEvent(e, null);
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: send.
	  TASK: Sets up XMLHttpRequest parameters and sends the request.
	——————————————————————————————————————————————————————————————————————————*/
	send() {
		var t = this;
		if (t._xhr.readyState > XMLHttpRequest.OPENED)
			exc('E_COM_RUN', propName);
		setup(t);
		t._xhr.send(t._cnt);
		return t;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: abort 
	  TASK: Aborts communication.
	——————————————————————————————————————————————————————————————————————————*/
	abort() {
		t._xhr.abort();
	}

	/*——————————————————————————————————————————————————————————————————————————

	  Com getter-setters.
	
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	xhr : XMLHttpRequest.
	  GET : Returns the XMLHttpRequest object.
	——————————————————————————————————————————————————————————————————————————*/
	get xhr() {
		return this._xhr;
	} 

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	timeout : number.
	  GET : Returns timeout in milliseconds.
	  SET : Sets    timeout in milliseconds.
	——————————————————————————————————————————————————————————————————————————*/
	get timeout() {
		return this._xhr.timeout;
	}

	set timeout(value = 0) {
		if (typeof(value)==="number")
			this._xhr.timeout = value;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  After communication start, attempting to set these throws exception.
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	method : String.
	  GET : Returns http(s) method.
	  SET : Sets    http(s) method.
	——————————————————————————————————————————————————————————————————————————*/
	get method() { 
		return this._met; 
	}
	
	set method(value) {
		valid = is.str(value);
		value = valid ? value.toUpperCase() : null;
		checkSet(this, '_met', value, "method", valid); 
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	url : String.
	  GET : Returns url.
	  SET : Sets    url.
	——————————————————————————————————————————————————————————————————————————*/
	get url() { 
		return this._url; 
	}
	
	set url(value) { 
		checkSet(this, '_url', value, "url", is.str(value)); 
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	content : Object.
	  GET : Returns request content data.
	  SET : Sets    request content data.
	——————————————————————————————————————————————————————————————————————————*/
	get content() {
		return this._cnt;
	}

	set content(value = null) {
		checkSet(this, '_cnt', value, "content", true);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	responseType : String.
	  GET : Returns response type.
	  SET : Sets    response type.
	——————————————————————————————————————————————————————————————————————————*/
	get responseType() {
		return this._typ;
	}

	set responseType(value = 'blob') {
		valid = (value) && (RESPONSE_TYPES.indexOf(value) > -1);
		checkSet(this, '_typ', value, "responseType", valid);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	query : object.
	  GET : Returns query object.
	  SET : Sets    query object.
	——————————————————————————————————————————————————————————————————————————*/
	get query() {
		return this._qry;
	}

	set query(value = null) {
		valid = typeof(value) === "object" && !is.arr(value);
		checkSet(this, '_qry', value, "query", valid);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	headers : object.
	  GET : Returns request headers object.
	  SET : Sets    request headers object.
	——————————————————————————————————————————————————————————————————————————*/
	get headers() {
		return this._hdr;
	}

	set headers(value = null) {
		valid = typeof(value)==="object" &&	!is.arr(value);
		checkSet(this, '_hdr', value, "headers", valid);
	}
}

const RESPONSE_TYPES = [
	"",
	"arraybuffer",
	"blob",
	"document",
	"json",
	"text"
];

const OWNER_HANDLERS_LIST = [
	"LoadStart",
	"Progress",
	"Abort",
	"Timeout",
	"Error",
	"Load",
	"LoadEnd",

	"UploadStart",
	"UploadProgress",
	"UploadAbort",
	"UploadTimeout",
	"UploadError",
	"Upload",
	"UploadEnd"
];

// private.
function checkSet(com, varName, value, propName, valid = true) {
	if (!valid)
		exc('E_INV_ARG', propName);
	if (com[varName] == value)
		return;
	if (com._xhr.readyState > XMLHttpRequest.OPENED)
		exc('E_COM_RUN', propName);
	com[varName] = value;
}


//private.
function setup(com) {
	var t = com,
		q = buildQuery(t._qry),
		u = t._url + (q ? '?'+q : '');

	t._xhr.open(t._met, u, true, t._usr, t._pwd);
	buildHeaders(com);
	t._xhr.responseType = t._typ;
	t._xhr.timeout = t._tim;
}

// private.
function buildQuery(com) {
	var s = '',
		q = com._qry;

	if (!q )
		return null;
	for(var i in q){
		if (s != '')
			s += '&';
		s += encodeURI(i) + '=' + encodeURI(q[i]);
	}
	return (s == '') ? null : s;
}

// private.
function buildHeaders(com) {
	var s = '',
		x = com._xhr,
		h = com._hdr;

	if (!h )
		return;
	for(var i in h)
		x.setRequestHeader(i, h[i]);	
}

sys.registerClass(Com);