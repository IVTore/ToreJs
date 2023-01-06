/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	İhsan V. Töre
  About		: 	THttpClient.js: Tore Js http client communicator component class.
  License	:   MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc } from "./system.js";
import { TComponent } from "./TComponent.js";

/*————————————————————————————————————————————————————————————————————————————
  FUNC: send.
  TASK: Builds a THttpClient component sets it up and sends the request.
  ARGS: Arguments map to THttpClient component properties, please refer there.
  RETV: 	: Promise : resolve returns XMLHttpRequest object.
  INFO: On completion of communication, THttpClient component is destroyed.
		THttpClient instances are nicknamed as 'com'.
————————————————————————————————————————————————————————————————————————————*/

export function send (
		owner = null,
		method = 'POST',
		url = '',
		content = null,
		responseType = 'blob',
		query = null,
		headers = null,
		user = null,
		pass = null) {

	var o = {method: method, url: url, content: content, 
		responseType: responseType,	query: query,
		headers: headers, user: user, pass: pass };
	return sendPromise(owner, o);
}

// internal.
function sendPromise(owner = null, options = null){
	return new Promise ( (resolve, reject) => {
		var com = new THttpClient(null, owner, options),
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
  CLASS: THttpClient.
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

	doLoadStart, doProgress, doAbort, doTimeout,
	doError, doLoad, doLoadEnd,
	doUploadStart, doUploadProgress, doUploadAbort,	doUploadTimeout,
	doUploadError, doUpload, doUploadEnd

	handler methods are *sought* in the owner, and the existing ones are
	bound to their respective events auto*magic*ally.

	Handler method signature example: 
		owner.doLoadStart(e)
			where e is the event object.
————————————————————————————————————————————————————————————————————————————*/
export class THttpClient extends TComponent {
	
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
	
	_usr = null;				// user name if required.
	_pwd = null;				// user pass if required.

	_bnd = null;				// bound functions list.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: THttpClient.
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
		if (owner instanceof TComponent)
			owner.attach(this);
		if (data)
			sys.propSet(this, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy [override].
	  TASK: Destroys the http communicator component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (this._own)					// Unbinding has priority (doDetached).
			this._own.detach(this);
		this._xhr = null;
		super.destroy();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doAttached [override].
	  TASK:	Seeks for do<event> handler methods* in new owner and binds them.
	  INFO: * Methods like: owner.doLoad(e) etc.
	———————————————————————————————————————————————————————————————————————————*/
	doAttached() {
		var own = this._own,
			nam,
			dta,
			hnd;

		if (!own)
			return;

		this._bnd = {};
		// Automatic event routing: set all available handlers to events.
		for(nam in EVENT_INFO) {
			dta = EVENT_INFO[nam];
			if (typeof own[nam] !== 'function')
				continue;
			hnd = sys.bindHandler(own, nam);
			this[dta.src].addEventListener(dta.typ, hnd);
			this._bnd[nam] = hnd;
		}
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doDetached [override].
	  TASK:	Seeks for bound handler methods* to old owner and unbinds them.
	  ARGS:
	  	exOwner	: TComponent : owner that "this" is detached from. :DEF: null
	  INFO: * Methods like: exOwner.doLoad(e) etc.
	———————————————————————————————————————————————————————————————————————————*/
	doDetached(exOwner = null) {
		var nam,
			dta;

		if (!exOwner)
			return;
		for(nam in this._bnd) { 		// Clear all events targeting ex owner.
			dta = EVENT_INFO[nam];
			if (!dta)
				continue;
			this[dta.src].removeEventListener(dta.typ, this._bnd[nam]);
			delete this._bnd[nam];
		}
		this._bnd = null;
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

	  THttpClient getter-setters.
	
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
		const valid = (typeof value === 'string');
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
		checkSet(this, '_url', value, "url", typeof value === 'string'); 
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
		const valid = (typeof value === 'string') && (RESPONSE_TYPES.indexOf(value) > -1);
		value = valid ? value : 'blob';
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
		const valid = value === null || is.plain(value);
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
		const valid = value === null || is.plain(value);
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

const EVENT_INFO = { 
	doLoadStart: 		{typ: 'loadstart', src: '_xhr'},
	doProgress: 		{typ: 'progress', src: '_xhr'},
	doAbort: 			{typ: 'abort', src: '_xhr'},
	doTimeout: 			{typ: 'timeout', src: '_xhr'},
	doError: 			{typ: 'error', src: '_xhr'},
	doLoad: 			{typ: 'load', src: '_xhr'},
	doLoadEnd: 			{typ: 'loadend', src: '_xhr'},

	doUploadStart: 		{typ: 'loadstart', src: '_upl'},
	doUploadProgress: 	{typ: 'progress', src: '_upl'},
	doUploadAbort: 		{typ: 'abort', src: '_upl'},
	doUploadTimeout: 	{typ: 'timeout', src: '_upl'},
	doUploadError: 		{typ: 'error', src: '_upl'},
	doUpload: 			{typ: 'load', src: '_upl'},
	doUploadEnd: 		{typ: 'loadend', src: '_upl'}
}


// private.
function checkSet(com, varName, value, propName, valid = true) {
	if (!valid)
		exc('E_INV_ARG', propName);
	if (com[varName] === value)
		return;
	if (com._xhr.readyState > XMLHttpRequest.OPENED)
		exc('E_COM_RUN', propName);
	com[varName] = value;
}


//private.
function setup(com) {
	var t = com,
		q = buildQuery(t),
		u = t._url + (q ? '?'+q : '');

	t._xhr.open(t._met, u, true, t._usr, t._pwd);
	buildHeaders(t);
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

sys.registerClass(THttpClient);