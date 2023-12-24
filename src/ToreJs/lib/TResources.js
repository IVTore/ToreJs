/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TResources.js: Tore Js Resource manager component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, core, exc, log, TComponent, TObject } from "../lib/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TResources.
  TASKS: 
    TResources class instance resources is a singleton component 
  	which manage application assets.

    Assets are allowed in TObject descendants.
    Assets are associated to names.
    resources also manage asset claiming, promise and events.

    Using asset claiming:
    
    Asset claiming means, the named asset is reserved but not ready yet.
    A claimed asset is useful when asynchronous preparations can take 
    place for a resource asset being requested by multiple targets. 

    This provides:
    Avoiding multiple attempts of preparation via checking hasClaim().
    Accessing the promise of the first claimer if any.
    Multi target function calls per event (not via TEventHandler).

    *   Use case with promise example:

        prepare() {
            var prom = null;

            if (!resources.hasAsset(this.assetName)) {
                this.assignAsset();
                return;
            }
            if (hasClaim(this.assetName)) {
                prom = resources.addClaim(this.assetName, this);
            } else {
                prom = new Promise((resolve, reject)=> {
                    const result;
                    result = someLongFunctionKicking();
                    if (result !== null) {
                        resources.add(this.assetName, result);
                        resolve();
                    } else {
                        resources.del(this.assetName);
                        reject();
                    }
                } ); 
                newClaim(this.assetName, this, prom);
            }

            prom.then(this.assignAsset);
        }

        assignAsset() {
            var theData = resources.addLink(this.assetName, this);
            // use theData as you wish. 
        }

    *   Use case with method triggers example:
        Note that method names are arbitrary but they MUST be SAME among claimers. 
        When a method is triggered, it will be called for all claimers having it.
        In the example below the developer chose unconventional method names.
        It does not matter when the names in other claimers are the same. 

        prepare() {
            var thing, // some very tricky thing needing preparation.
                aName = this.assetName;
            
            if (resources.hasAsset(aName)) {
                this.doPrepared();
                return;
            }
            if (resources.hasClaim(aName)) {
                resources.addClaim(aName, this);
                return;
            }
            

            // assume HtmlBlaBla is a loading thing.
            // build it and set native events:

            thing = new HTMLBlaBla(...parameters);
            
            thing.onerror = () => { 
                resources.trigger(aName, 'doException');
            }
            
            thing.onload = () => {
                resources.add(aName, thing);    // this assigns the data and 
                                                // turns claim into an asset.
                resources.trigger(aName, 'doPrepared'); // calls doPrepared method on all claimers
            }

            thing.onloadend = () => {
                resources.trigger(aName, 'doFinalize', true); // calls doFinalize method on all claimers
                resources.delClaims(aName); // this removes all claimers from asset.
                thing.onerror = null;
                thing.onload = null;
                thing.onloadend = null;
            }
            
            // claim the name
            resources.newClaim(aName, this);

            // start loading HtmlBlaBla
            thing.load();

        }

        doException(assetName, e) {
            // e is the event 
        }

        doPrepared(assetName, e) {
            var thing = resources.addLink(assetName, this);
            // use the "thing" as you wish.
        }

        doFinalize(assetName, e) {
            // Do cleanups if you need.
        }
    
    *   Promise and events can be used together too. Look TImage.

——————————————————————————————————————————————————————————————————————————*/
class TResources extends TComponent {

    static serializable = false;
	static allowMemberClass = null; // Members not allowed.

	_namesList = [];
	_assetList = [];

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs resources singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor() {
		if (core["resources"])
			exc("E_SINGLETON", "core.resources");
		super("resources", core);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Removes all resources and links, destroys component.
	  INFO: It is not recommended to destroy resources component.
	  		If you are completely getting rid of ToreJs use core.destroy();
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		var asset;

        if (!this._sta)
            return;
		for(asset of this._assetList)
            asset.destroy();
        this._namesList = null;
        this._assetList = null;
        super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: add.
	  TASK: Stores a resource asset.
	  ARGS: 
	  	name	: string	: Resource asset name such as an url.   :DEF: null.
		data	: *			: Resource asset data such as an Image.	:DEF: null.
	  INFO: 
		*   If data has a assetRemove function, it will be called when
            all links removed. data will be passed as argument.
        *   If asset was a claim, it becomes an asset.
      WARN: 
            If name or data is missing, raises 'E_INV_ARG'. 
	  	    If another data with same name is present raises 'E_RES_OVR'.
            If another name with same data is present raises 'E_RES_DUP'.
	——————————————————————————————————————————————————————————————————————————*/
	add(name = null, data = null) {
		var asset = null,
            iData;

		sys.str(name, 'name');
        sys.chk(data, 'data');
        asset = this._fetch(name);
        if (asset) { 
            if (asset._data === data) 
                return;
            if (asset._data !== null)
			    exc('E_RES_OVR', name);
        }
        iData = this.indexOfData(data);
        if (iData > -1)
            exc('E_RES_DUP', 'Add dup' + name + ' = ' + this._namesList[iData]);
        if (!asset) {
            asset = new TAsset(name, data);
            this._namesList.push(name);
            this._assetList.push(asset);
        } else {
            asset._data = data;
        }
        log('Resource asset added:', name);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: del.
	  TASK: Removes a resource asset or claim.
	  ARGS: 
	  	name	: string	: asset name such as an url. :DEF: null.
	  INFO: 
	  	*   This method never raises any exception.
        *   If named resource is a claim, it is simply removed.
		*   If named resource is an asset (if it has data):
            1] doAssetDetached(name) method on all linked and alive 
			   objects are searched and called if exists.
            2] Asset name will be removed from all target._res resource lists.
            3] If data has a data.assetRemove method, it will be called as:
               data.assetRemove(data);
			4] data will be set to null making it eligible for GC. 
	——————————————————————————————————————————————————————————————————————————*/
	del(name = null) {
		var t = this,
            i;

		i = t._namesList.indexOf(name);
		if (i < 0)
			return;
        t._assetList[i].destroy();
        t._namesList.splice(i, 1);
        t._assetList.splice(i, 1);
        log('Resource asset removed:', name);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: hasAsset.
	  TASK: Returns true if resources contain an asset with the given name.
	  ARGS: 
	  	name	: string	: Resource name such as an url. :DEF: null.
	  RETV:     : boolean   : true if an asset with the given name exists.
	——————————————————————————————————————————————————————————————————————————*/
    hasAsset(name = null) {
        var asset = this._fetch(name);
        return (asset && asset._data !== null);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: newClaim.
	  TASK: Stores a new asset claim.
	  ARGS: 
	  	name	 : string	: Asset name such as an url. :DEF: null.
		claimer	 : TObject	: Asset claimer.	         :DEF: null.
        promise  : Promise  : Promise for asset data preparation. :DEF: null.
      RETV:
                 : Promise  : Returns the promise given for convenience.
                              If promise is not a Promise, returns null.
	  INFO: 
		*   promise depends on developer convention per asset type.
            If developer wants to use promises, must give a promise.

        *   A new claim should be done only when an asset does not exist and
            not claimed before.

        *   Claimers share method triggers.

        *   If method triggers are not required, claimer can be null.
        
      WARN: 
            If name is missing or invalid, raises 'E_INV_ARG'. 
	  	    If asset is pre-claimed raises 'E_CLAIM_EXISTS'.
            If asset exists raises 'E_ASSET_EXISTS'.
	——————————————————————————————————————————————————————————————————————————*/
    newClaim(name = null, claimer = null, promise = null) {
        var claim = this._checkAndFetch(name, this);
        
        if (claim) 
            exc((claim.isClaim ? 'E_CLAIM_EXISTS': 'E_ASSET_EXISTS'), name); 
        promise = (promise instanceof Promise) ? promise : null;
        claim = new TAsset(name);
        claim.promise = promise;
        if (claimer instanceof TObject)
            claim.addClaimer(claimer);
        this._namesList.push(name);
        this._assetList.push(claim);
        return claim.promise;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: addClaim.
	  TASK: Stores secondary asset claims.
	  ARGS: 
	  	name	 : string	: Asset name such as an url. :DEF: null.
		claimer	 : TObject	: Asset claimer.	         :DEF: null.
      RETV:
                 : Promise  : Returns the promise given for convenience.
                              if no Promise given at newClaim, returns null.
	  INFO: 
		*   Promise depends on developer convention per asset type.
            If developer wants promises, must give a promise at newClaim.

        *   Claimers share method triggers.

        *   If method triggers are not required, claimer can be null.
        
      WARN: 
            If name missing or invalid, raises 'E_INV_ARG'.
            If claim does not exist raises 'E_NO_CLAIM'. 
            If asset exists raises 'E_ASSET_EXISTS'.
	——————————————————————————————————————————————————————————————————————————*/
	addClaim(name = null, claimer = null) {
		var claim = this._fetch(name);

        if (!claim)
            exc('E_NO_CLAIM', name);
        if (!claim.isClaim)
            exc('E_ASSET_EXISTS', name);
        if (claimer instanceof TObject)
            claim.addClaimer(claimer);
        return claim.promise;
	}

/*——————————————————————————————————————————————————————————————————————————
	  FUNC: clearClaims.
	  TASK: Clears all claiming data.
	  ARGS: 
	  	name	 : string	: Asset name such as an url. :DEF: null.
	  INFO: 
		*   Any promise and claimer info will be erased.
        *   Method raises no exception.
        *   This is a convenient way for any resource preparation algorithm 
            to clear claimers after some finalizing method triggering occurs.
	——————————————————————————————————————————————————————————————————————————*/
	clearClaims(name = null) {
		var claim = this._fetch(name);

        if (claim)
            claim.clearClaims();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: hasClaim.
	  TASK: returns true if a name exists as a claimed asset name.
	  ARGS: 
	  	name	: string : Claimed asset name such as an url. :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
    hasClaim(name = null) {
        var claim = this._fetch(name);
        return (claim && claim.isClaim);        
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: trigger.
	  TASK: Calls a method of claimers in a claimed asset.
	  ARGS: 
	  	name	: string : Claimed asset name such as an url. :DEF: null.
        method  : string : method name.
        ...args : *      : additional arguments.
      INFO: Even if the claim may become an asset (data assigned),
            It does not matter, until the claims are cleared the methods
            can be triggered on claimers. 
	——————————————————————————————————————————————————————————————————————————*/
    trigger(name = '?', methodName = '?', ...args) {
        var claim = this._fetch(name);
        if (!claim)
            exc('E_NO_CLAIM', name);
        sys.str(methodName, 'methodName');
        claim.trigger(methodName, ...args);        
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: addLink.
	  TASK: Links a resource asset to an object. Returns asset data.
	  ARGS: 
	  	name	: string	: Asset name such as an url. 	:DEF: null.
		obj     : TObject	: TObject to link the resource.	:DEF: null.
	  RETV:
		data	: *			: Asset data such as an Image etc.or null.
	  INFO: 
		Adds object to asset links if not added already. 
		Returns the asset data.
      WARN:
        If name is missing or object is not a TObject raises 'E_INV_ARG'. 
	  	If a resource asset with the name does not exist returns null.  
	——————————————————————————————————————————————————————————————————————————*/
	addLink(name = null, obj = null) {
		var asset = this._checkAndFetch(name, obj);
		return asset ? asset.addLink(obj) : null; 
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: delLink.
	  TASK: Removes the link of a resource from an object.
	  ARGS: 
	  	name    : string	 : Resource name such as an url. 	:DEF: null.
		obj     : TObject    : TObject to remove link of the resource.
							   :DEF: null.
	  INFO: 
		If a resource with the name doesn't exist it does nothing.
		If obj is in the links of resource,
			1] 	if obj is alive, obj.doResourceDetached(name) 
				method is called.
			2]  The link is deleted.,
		If there is no link left for resource, it is removed completely. 
      WARN:
        If name is missing or target is not a TObject raises 'E_INV_ARG'. 	
	——————————————————————————————————————————————————————————————————————————*/
	delLink(name = null, target = null) {
		var asset = this._checkAndFetch(name, target);

        if (!asset)
			return;
        asset.delLink(target);
		if (asset.linkCount === 0)
			this.del(name);
	}
        

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: delObjectLinks.
	  TASK: Removes all the links of an object from all resource assets.
	  ARGS: 
	  	object  : TObject    : object to remove links. :DEF: null. 	
	——————————————————————————————————————————————————————————————————————————*/
    delTarget(target = null) {
        var n,
            r;

        if (!(target instanceof TObject))
            return;
        r = target._resLst.concat();
        for(n of r) 
            this.delLink(n, target);
        target._resLst = [];
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: indexOfData.
	  TASK: Returns the asset list index of asset containing the data.
	  ARGS: 
	  	data	: *	  : asset data. 	:DEF: null.
      RETV: 
                : int : asset list index of asset data or -1 if not found. 	
	——————————————————————————————————————————————————————————————————————————*/
    indexOfData(data = null) {
        var a = this._assetList,
            l = a.length,
            i;
        
        if (!data)
            return -1;
        for(i = 0; i < l; i++) {
            if (a[i]._data === data)
                return i;
        }
        return -1;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: nameOfData.
	  TASK: Returns the asset list name of asset containing the data.
	  ARGS: 
	  	data	: *	  : asset data. 	:DEF: null.
      RETV: 
                : string : asset name of asset data or null if not found. 	
	——————————————————————————————————————————————————————————————————————————*/
    nameOfData(data = null) {
        var i = this.indexOfData(data);

        return (i > -1) ? this._namesList[i] : null;
    }



    // Private : checks asset name and an object, returns index of asset.
    _checkAndFetch(name, obj, oName = 'object') {
        if (!(obj instanceof TObject))
            exc('E_INV_ARG', oName);
        sys.str(name, 'name'); 
        return this._fetch(name);
    }

    _fetch(name) {
        var i = this._namesList.indexOf(name);
        return (i > -1) ? this._assetList[i] : null;
    }

}



/*——————————————————————————————————————————————————————————————————————————
  CLASS: TAsset.
  TASKS: Internal class to represent assets.
  USAGE: Asset data checking is done in resources.
         This is a private internal class.
——————————————————————————————————————————————————————————————————————————*/
class TAsset {
    _name = null;   // asset name.
    _data = null;   // asset data.
    _oLst = [];     // list of objects linked to asset.
    _cLst = [];     // list of objects claiming the asset.
    _prom = null;   // primary promise if any.
  

    constructor (name, data = null) {
        this._name = name;
        this._data = data;
    }

    destroy() {
        this.delLinks();
        this.clearClaims();
        if (this._data.assetRemove instanceof Function)
            this._data.assetRemove(this._data);
        this._data = null;
        this._oLst = null;
    }

    // adds an object to list of links, returns asset for convenience.
    addLink(obj) {
        sys.arrAddUnique(this._oLst, obj);
        sys.arrAddUnique(obj._resLst, this._name)
        return this._data;
    }

    // removes object from list of links.
    delLink(obj) {
        var i = this._oLst.indexOf(obj);

		if (i < 0)
			return ;
		this._oLst.splice(i, 1);
        if (!obj._sta)
            return;
        sys.arrDelUnique(obj._resLst, this._name);
		obj.doResourceLinkRemoved(this._name);
    }

    // removes all objects from list of links.
    delLinks() {
        var obj;

        for(obj of this._oLst) {
            if (obj._sta) {
                sys.arrDelUnique(obj._resLst, this._name);
                obj.doResourceLinkRemoved(this._name);
            }
        }
        this._oLst = [];
    }

    trigger(methodName, ...args) {
        var tar;

        for(tar of this._cLst){
            if (tar && tar._sta && tar[methodName] instanceof Function) 
                tar[methodName](this._name, ...args);
        }

    }

    addClaimer(claimer = null) {
        if (claimer instanceof TObject)
            sys.arrAddUnique(this._cLst, claimer);
    }

    clearClaims() {
        t._cLst = null;
        t._prom = null;
    }

    set promise(val) {
        if (val instanceof Promise)
            this._prom = val;
    }

    get promise() {
        return this._prom;
    }

    get isClaim() {
        return this._data === null;
    }

    get linkCount() {
        return this._oLst.length;
    }
}


sys.registerClass(TResources);

export const resources = new TResources();

