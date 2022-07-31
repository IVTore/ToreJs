/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	İhsan V. Töre
  About		: 	I18n.js: Tore Js internationalization class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc, core } from "./system.js"
import { Component } from "./Component.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: Language
  TASKS: 
	Stores text and other specific data for a language.
	Designed as member of core.i18n component.
  NOTES:
	Does not accept members.
	To take effect it must be attached to core.i18n singleton.
————————————————————————————————————————————————————————————————————————————*/
export class Language extends Component {
	static allowMemberClass = null;		// no members allowed.
}

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: I18n
  TASKS: Internationalization singleton component.
  		 I18n instance is core.i18n singleton.
  NOTES: It only accepts Language components as members.
———————————————————————————————————————————————————————————————————————————*/
export class I18n extends Component {
	static cdta = {
		sequence: {value: null}
	}
	
	static allowMemberClass = Language;
	
	_seq = [];

	constructor(){
		if (core["i18n"])
			exc("E_SINGLETON", "core.i18n");
		super("i18n", core);
	}

	destroy(){
		this._seq = null;
		super.destroy();
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override]
	  TASK:	Modifies member attachment logic to control language sequence..
	———————————————————————————————————————————————————————————————————————————*/
	attach(component = null){
	var t = this,
		n;

		if (!super.attach(component))
			return false;
		n = component.name;
		if (t._seq.indexOf(n) < 0)
			t._seq.push(n);
		if (t._seq.indexOf(n) == 0)
			core.doLanguageChange();
		return true;
	}
	
	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override]
	  TASK:	Modifies member detachment logic to control language sequence.
	———————————————————————————————————————————————————————————————————————————*/
	detach(component = null, kill = false) {
	var t = this,
		i;

		if (!super.detach(component))
			return false;
		i = (t._seq) ? t._seq.indexOf(component.name) : -1;
		if (kill)
			component.destroy();
		if (i < 0)
			return true;
		t._seq.splice(i, 1);
		if (i == 0)
			core.doLanguageChange();
		return true;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC: find 
	  TASK: Tries to find a specific data by data selector and language.
	  ARGS:
		selector	: String : The data identifier name.
		language	: String : The language name 		[d = null].
	  RETV:			: * 	 : data or selector if not found.
	  INFO:
		* If language is specified :
			If language is invalid selector is returned.
			If data not found selector is returned.
		* If language is null (default):
			All languages are scanned for selector with respect to sequence 
			until data is found. 
			If data is not found selector is returned.
	———————————————————————————————————————————————————————————————————————————*/
	find(selector = null, language = null){
	var t = this,
		r,
		i,
		s = (is.str(language)) ? [language] : t._seq;
		
		if (!is.str(selector))
			exc("E_INV_ARG", "selector");
		if (!s[0])
			return selector;
		for(i in s){
			r = t._mem[s[i]][selector];
			if (r)
				return(r);
		}
		return(selector);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	language : string
	  GET : Gets the name of active language.
	  SET : Sets the active language by name.
	  INFO: Active language is the first language at sequence.
	————————————————————————————————————————————————————————————————————————————*/
	get language() {
		var t = this;
				
		if (!t._sta || t._seq.length == 0) 
			return null;
		return t._seq[0];
	}

	set language(value = null) {
		var t = this,
			s = t._seq;

		if (!t._sta || s.length == 0 || !is.str(value) || !t._mem[value])
			exc('E_LANG_SET', value);
		if (s[0] == value)
			return;
		s.splice(s.indexOf(value), 1);
		s.unshift(value);
		core.doLanguageChange();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	sequence : Array;
	  GET : Returns an array of language names as the search sequence.
	  SET : Checks validity, sets language search sequence array.
	  INFO: 
		* Set routine is intelligent enough to filter invalid languages etc.
		  It prioritizes the languages with names given in the array.
		  Omitted languages are moved to the back of sequence.
		* Sequence serves as language fallback order when a symbol is not found.
	————————————————————————————————————————————————————————————————————————————*/
	get sequence() {
		var t = this;

		if (!t._sta || !t._seq || t._seq.length == 0) 
			return null;
		return t._seq.concat();
	}

	set sequence(value = null) {
		var t = this,
			a = [],
			i,
			l = t.language,
			s;

		t.checkDead();
		if (!is.arr(value))
			exc("E_INV_ARG", "value");
		for(i in value){
			if (!t._mem[value[i]])		// if no such language,
				continue;				// skip.
			a.push(value[i]);
		}
		for(i in t._seq){
			s = t._seq[i];
			if ((a.indexOf(s) === -1) && (t._mem[s]))
				a.push(s);
		}
		for(i in t._mem){
			if (a.indexOf(i) === -1)
				a.push(i)
		}
		t._seq = a;
		t.language = l;
	}
}

sys.registerClass(Language);
sys.registerClass(I18n);