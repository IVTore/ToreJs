/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230301
  Author	: 	İhsan V. Töre
  About		: 	TI18n.js: Tore Js internationalization class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, core } from "./TSystem.js"
import { TComponent } from "./TComponent.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TLanguage.
  TASKS: 
	Stores text and other specific data for a language.
	Designed as member of core.i18n component.
  USAGE:
    Any variable added to TLanguage instance is a language dependent data.
    Variable names are selectors.
    Selector ***convention*** :
        1]  Selectors are keys to access language spesific data.
        2]  Selectors must be in CAPITAL LETTERS.
        3]  Second character must be an underscore "_".
        4]  Reserved selector prefixes:
            "E_": Exception selector string.  
            "T_": Text string or if multi line, an array of strings.
            "I_": Image url (string).
    Use the convention.
  NOTES:
	Does not accept members.
	To take effect it must be attached to core.i18n singleton.
————————————————————————————————————————————————————————————————————————————*/
export class TLanguage extends TComponent {

	static allowMemberClass = null;		// Members not allowed.

}

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TI18n.
  TASKS: Internationalization singleton component.
  		 TI18n instance is core.i18n singleton.
  NOTES: It only accepts TLanguage components as members.
———————————————————————————————————————————————————————————————————————————*/
class TI18n extends TComponent {

    static serializable = false;
	static allowMemberClass = TLanguage;

	_seq = []; 			// language sequence
	
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs i18n singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(){
        const n = 'i18n';
		if (core[n])
			exc("E_SINGLETON", 'core.' + n);
		super(n, core);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys i18n singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		this._seq = null;
		super.destroy();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	Modifies member attachment logic to check language sequencing.
	———————————————————————————————————————————————————————————————————————————*/
	attach(component = null){
		if (!super.attach(component))
			return false;
		if (sys.arrAddUnique(this._seq, component.name) === 0)
			core.doLanguageChange();
		return true;
	}
	
	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override].
	  TASK:	Modifies member detachment logic to check language sequencing.
	———————————————————————————————————————————————————————————————————————————*/
	detach(component = null, kill = false) {
	var i;

		if (!super.detach(component))
			return false;
		i = (this._seq) ? this._seq.indexOf(component.name) : -1;
		if (kill)
			component.destroy();
		if (i < 0)
			return true;
		this._seq.splice(i, 1);
		if (i === 0)
			core.doLanguageChange();
		return true;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC: find. 
	  TASK: Tries to find a specific data by data selector and language.
	  ARGS:
		selector	: String : Data identifier name.    :DEF:null.
        language	: String : The language name 		:DEF:null.
	  RETV:			: * 	 : data or null if not found.
	  INFO:
        * selector parameter :
          If selector is not a string, returns null.
          If second character of selector is not '_', null is returned.

        * language parameter :
          If language is specified :
			If language is invalid it is set to default.
			If data not found in language, behaves as if language is null.
		  If language is null (default):
			All languages are scanned for selector with respect to sequence 
			until data is found. 
			If data is not found null is returned.
	———————————————————————————————————————————————————————————————————————————*/
	find(selector = null, language = null) {
		var	r,
			s; 
		        
        if (typeof selector !== 'string' || selector[1] !== '_')
            return null;
        if (typeof language === "string" && this._mem[language]) {
            r = this._mem[language][selector];
            if (r !== undefined) 
                return r;
        }
        for(s of this._seq){
            r = this._mem[s][selector];
            if (r !== undefined)
                return r;
        }
        return null;
        
	}


    /*———————————————————————————————————————————————————————————————————————————
	  FUNC: findSet. 
	  TASK: Tries to find a specific data by data selector and language.
            Sets the selector on target and returns the data.
	  ARGS:
		selector	: String : Data identifier name.    :DEF:null.
        target      : Object : Target object if any.    :DEF:null.
        reference   : String : Target selector ref.     :DEF:null.
		language	: String : The language name 		:DEF:null.
	  RETV:			: * 	 : data or null if not found.
	  INFO:         

        * selector parameter :
          If selector is not a string, returns null.
          If second character of selector is not '_', null is returned.

        * target and reference parameters :
          If non null there is a selector reference in the target to set.
          If data is found target[reference] will be set to selector.
          Otherwise target[reference] will be set to null.

		* language parameter :
          If language is specified :
			If language is invalid it is set to default.
			If data not found in language, behaves as if language is null.
		  If language is null (default):
			All languages are scanned for selector with respect to sequence 
			until data is found. 
			If data is not found null is returned.
	———————————————————————————————————————————————————————————————————————————*/
	findSet(selector = null, target = null, reference = null, language = null) {
		var r = this.find(selector, language);
        
        if (target instanceof Object && typeof reference === 'string') 
            target[reference] = (r) ? selector : null;
        return r;
	}
	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	language : string.
	  GET : Gets the name of active language.
	  SET : Sets the active language by name.
	  INFO: Active language is the first language at sequence.
	————————————————————————————————————————————————————————————————————————————*/
	get language() {
		if (!this._sta || this._seq.length == 0) 
			return null;
		return this._seq[0];
	}

	set language(val = null) {
		var s = this._seq;

		if (!this._sta || s.length == 0 || typeof val !== 'string' || !this._mem[val])
			exc('E_LANG_SET', val);
		if (s[0] === val)
			return;
		s.splice(s.indexOf(val), 1);
		s.unshift(val);
		core.doLanguageChange();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	sequence : Array.
	  GET : Returns an array of language names as the search sequence.
	  SET : Checks validity, sets language search sequence array.
	  INFO: 
		* Set routine is intelligent enough to filter invalid languages etc.
		  It prioritizes the languages with names given in the array.
		  Omitted languages are moved to the back of sequence.
		* Sequence serves as language fallback order when a selector is not found.
	————————————————————————————————————————————————————————————————————————————*/
	get sequence() {
		var t = this;

		if (!t._sta || !t._seq || t._seq.length == 0) 
			return null;
		return t._seq.concat();
	}

	set sequence(val = null) {
		var t = this,
			a = [],
			i,
			l = t.language,
			s;

		t.checkDead();
		if (!Array.isArray(val))
			exc("E_INV_ARG", "value");
		for(i in val){
			if (!t._mem[val[i]])		// if no such language,
				continue;				// skip.
			a.push(val[i]);
		}
		for(i in t._seq){
			s = t._seq[i];
			if ((a.indexOf(s) === -1) && (t._mem[s]))
				a.push(s);
		}
		for(i in t._mem)
			sys.arrAddUnique(a, i);
		t._seq = a;
		t.language = l;
	}
}

sys.registerClass(TLanguage);
sys.registerClass(TI18n);

export const i18n = new TI18n();