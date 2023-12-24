/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230301
  Author	: 	İhsan V. Töre
  About		: 	TXhrClient.js: Tore Js xml http request client class.
  License	:   MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc} from "./TSystem.js";
import { TObject } from "./TObject.js";
import { resources } from "./TResources.js";

/*————————————————————————————————————————————————————————————————————————————
  FUNC: send.
  TASK: Builds a TXhrClient object sets it up and sends the request.
  ARGS: Arguments map to TXhrClient object properties.
  RETV: 	: Promise : resolve returns XMLHttpRequest object.
  INFO: TXhrClient object auto-destroys when done.
————————————————————————————————————————————————————————————————————————————*/
export function send (
        method = 'POST', 
        url = '', 
        content = null, 
        responseType = 'blob', 
        query = null, 
        headers = null, 
        user = null, 
        pass = null
    ) {

	var o = { method, url, content, responseType, query, headers, user, pass };
	return sendPromise(o);
}

// internal.
function sendPromise(options = null) {
    var com = new TXhrClient(null, null, options),
		xhr = com.xhr;

	return new Promise ( (resolve, reject) => {
		xhr.onerror = trouble;
		xhr.onabort = trouble;
		xhr.ontimeout = trouble;
		xhr.onload = success;
		xhr.onloadend = terminate;

        function success() {
            if (xhr.status >= 200 && xhr.status < 300) {
            	resolve(xhr);
			} else {
				trouble();
			}
        }

        function trouble() {
            reject(xhr.statusText);
        }

        function terminate() {
            xhr.onerror = null;
			xhr.onabort = null;
			xhr.ontimeout = null;
			xhr.onload = null;
			xhr.onloadEnd = null;
			com.destroy();
        }

        com.send();
	});

}

/*  Standards For Event Binding.

	doLoadStart: 		{src: '_xhr', typ: 'loadstart'},
	doProgress: 		{src: '_xhr', typ: 'progress' },
	doAbort: 			{src: '_xhr', typ: 'abort'    },
	doTimeout: 			{src: '_xhr', typ: 'timeout'  },
	doError: 			{src: '_xhr', typ: 'error'    },
	doLoad: 			{src: '_xhr', typ: 'load'     },
	doLoadEnd: 			{src: '_xhr', typ: 'loadend'  },

	doUploadStart: 		{src: '_upl', typ: 'loadstart'},
	doUploadProgress: 	{src: '_upl', typ: 'progress' },
	doUploadAbort: 		{src: '_upl', typ: 'abort'    },
	doUploadTimeout: 	{src: '_upl', typ: 'timeout'  },
	doUploadError: 		{src: '_upl', typ: 'error'    },
	doUpload: 			{src: '_upl', typ: 'load'     },
	doUploadEnd: 		{src: '_upl', typ: 'loadend'  }
*/

/*————————————————————————————————————————————————————————————————————————————
  CLASS: TXhrClient.
  TASKS:
	Defines xhr http client class.
	* It is an XHR wrapper.
	* Normally used by send(), talk() methods above.

  USAGE:

	* Building Properties:
	method					as http method, default is 'POST'.
	url						as url, default is ''.
	content 				as content, default is null.
	responseType			as responseType, default is 'blob'.
	query					as query object, default is null.
	headers					as headers object, default is null.
	user					as username, default is null.
	pass					as password, default is null.

————————————————————————————————————————————————————————————————————————————*/
export class TXhrClient extends TObject {

	static serializable = false;
	static cdta = {
		method:             {value: 'POST'},
		url:                {value:	''},
		content:            {value: null},
		responseType:       {value: 'blob'},
		query:              {value: null},
		headers:            {value: null},
		timeout:            {value: 0},
		user:               {value: null},
		pass:               {value: null}
	};
	
    _xhr = null;				// XMLHttpRequest Object
	_res = null;				// response object (shortcut).
	_upl = null;				// upload object (shortcut).
    
	_met = 'POST';				// method.
	_url = '';					// url.
	_cnt = null;				// content.
	_typ = 'blob';				// response type.
	_qry = null;				// query.
	_hdr = null;				// headers.
    _tim = null;                // timeout.
	_usr = null;				// user name if required.
	_pwd = null;				// user pass if required.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: TXhrClient.
	  TASK: Constructs an xml http client object.
	  ARGS: Look instance properties with same names.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(
        method = 'POST',
        url = '',
        content = null, 
        responseType = 'blob', 
        query = null,
        headers = null,
        user = null, 
        pass = null) {

        var data;

        super();
		this._xhr = new XMLHttpRequest();
		this._upl = this._xhr.upload;
		data = {method, url, content, responseType, query, headers, user, pass};
		sys.propSet(this, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy [override].
	  TASK: Destroys the xml http client component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
        var x = this._xhr,
            u = this._upl;

        x.onloadstart = null;   // clear xhr event handlers.
        x.onprogress  = null;
        x.onabort     = null;
        x.ontimeout   = null;
        x.onerror     = null;
        x.onload      = null;
        x.onloadend   = null;

        u.onloadstart = null;   // clear upload event handlers.
        u.onprogress  = null;
        u.onabort     = null;
        u.ontimeout   = null;
        u.onerror     = null;
        u.onload      = null;
        u.onloadend   = null;
   		
        this._xhr = null;
		super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: send.
	  TASK: Sets up XMLHttpRequest parameters and sends the request.
	——————————————————————————————————————————————————————————————————————————*/
	send() {
		var t = this;
		if (t._xhr.readyState > XMLHttpRequest.OPENED)
			exc('E_CLIENT_SENT', t._url);
		setup(t);
		t._xhr.send(t._cnt);
		return t;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: abort 
	  TASK: Aborts communication.
	——————————————————————————————————————————————————————————————————————————*/
	abort() {
		this._xhr.abort();
	}

    /*——————————————————————————————————————————————————————————————————————————

	  TXhrClient getter-setters.
	
	——————————————————————————————————————————————————————————————————————————*/

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
	
	set url(val) { 
		checkSet(this, '_url', val, "url", typeof val === 'string'); 
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	content : Object.
	  GET : Returns request content data.
	  SET : Sets    request content data.
	——————————————————————————————————————————————————————————————————————————*/
	get content() {
		return this._cnt;
	}

	set content(val = null) {
		checkSet(this, '_cnt', val, "content", true);
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
        checkSet(this, '_tim', val, 'timeout', typeof value === 'number');
	}
	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	responseType : String.
	  GET : Returns response type.
	  SET : Sets    response type.
	——————————————————————————————————————————————————————————————————————————*/
	get responseType() {
		return this._typ;
	}

	set responseType(val = 'blob') {
		const valid = RESPONSE_TYPES.indexOf(val) > -1;
		val = valid ? val : 'blob';
		checkSet(this, '_typ', val, "responseType", valid);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	query : object.
	  GET : Returns query object.
	  SET : Sets    query object.
	——————————————————————————————————————————————————————————————————————————*/
	get query() {
		return this._qry;
	}

	set query(val = null) {
		const valid = val === null || sys.isPlain(val);
		checkSet(this, '_qry', val, "query", valid);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	headers : object.
	  GET : Returns request headers object.
	  SET : Sets    request headers object.
	——————————————————————————————————————————————————————————————————————————*/
	get headers() {
		return this._hdr;
	}

	set headers(val = null) {
		const valid = val === null || sys.isPlain(val);
		checkSet(this, '_hdr', val, "headers", valid);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  Get only properties.
	——————————————————————————————————————————————————————————————————————————*/
    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	xhr : XMLHttpRequest.
	  GET : Returns the XMLHttpRequest object.
	——————————————————————————————————————————————————————————————————————————*/
	get xhr() {
		return this._xhr;
	} 

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	upload : XMLHttpRequestUpload.
	  GET : Returns the XMLHttpRequestUpload object.
	——————————————————————————————————————————————————————————————————————————*/
	get upload() {
		return this._upl;
	} 

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	response : whatever the responseType is.
	  GET : Returns the response object.
	——————————————————————————————————————————————————————————————————————————*/
	get response() {
		return this._res;
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

// private. DRY routine. Proxies the xhr event dispatching.
function eventProxy(t, e, eventName) {
    var den = 'do' + eventName;

    if (t._tar) {
        if (t._tar === resources) {
            resources.trigger(t._url, den, e);
            if (eventName === 'LoadEnd' || eventName === 'UploadEnd')
                resources.clearClaims(t._url);
        } else {
            if (t._tar[den] instanceof Function)
                t._tar[den](t._url, e);
        }
    }
}

// private. DRY routine. Checks and executes propery assignment.
function checkSet(client, varName, value, propName, valid = true) {
	if (!valid)
		exc('E_INV_ARG', propName);
	if (client[varName] === value)
		return;
	if (client._xhr.readyState > XMLHttpRequest.OPENED)
		exc('E_CLIENT_RUN', propName);
	client[varName] = value;
}


//private.
function setup(client) {
	var t = client,
		q = buildQuery(t),
		u = t._url + (q ? '?'+q : '');

	t._xhr.open(t._met, u, true, t._usr, t._pwd);
	buildHeaders(t);
	t._xhr.responseType = t._typ;
	t._xhr.timeout = t._tim;
}

// private.
function buildQuery(client) {
	var s = '',
		q = client._qry;

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
function buildHeaders(client) {
	var s = '',
		x = client._xhr,
		h = client._hdr;

	if (!h )
		return;
	for(var i in h)
		x.setRequestHeader(i, h[i]);	
}

sys.registerClass(TXhrClient);