/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20231205
  Author	: 	İhsan V. Töre
  About		: 	TApplication.js: Tore Js application class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, core, TComponent } from "../lib/index.js"
import { display } from "./TDisplay.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TApplication.
  TASKS: 
	As a singleton, it serves primarily to give a structural consistency to 
    any application written on Tore Js. 
    * Provides an onLoad event for page load completion.
    * Page support.
    * Page Show navigation.	
————————————————————————————————————————————————————————————————————————————*/
class TApplication extends TComponent {
    
    static serializable = false;

    static cdta = {
        mainPageName: {value: 'main'},
        onLoad: {event: true}
    }

    _boundDoWindowLoad = null;

    _mainPageName = 'main';
    _currPage = null;


    constructor() {
        var n = 'application';
        if (core[n])
            exc('E_SINGLETON', n);
        super(n, core);
        this._boundDoWindowLoad = sys.bindHandler(this, '_doWindowLoad');
        window.addEventListener("load", this._boundDoWindowLoad, true);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys application singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		if (this._sta === sys.DEAD)
			return;
		super.destroy();
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doWindowLoad [private].
	  TASK: Works once when the window is loaded.
	——————————————————————————————————————————————————————————————————————————*/
    _doWindowLoad(e) {
        window.removeEventListener('load', this._boundDoWindowLoad, true);
        this._boundDoWindowLoad = null;
        display.refresh();
        this.dispatch(this._eve.onLoad);
        if (this._mainPageName) 
            this.show(this._mainPageName);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: show.
	  TASK:	Shows a given page in the application on display.
      ARGS: page : TPage  : Page to show. :DEF: null.
                 : string : Name of Page to show. :DEF: null.
      INFO:
        *   If page is already on display, does nothing.
        *   If there is another page on display, it is hidden.
        *   This method attaches the page to the display as member.      
      WARN:
        *   If page is not found, raises exception. 
	——————————————————————————————————————————————————————————————————————————*/
    show(page = null) {
        var t = this,
            cur = this._currPage,
            nxt = page;
    
        if (typeof page === 'string') 
            nxt = (cur && cur.name === page) ? cur : this.member(page);         
        if (cur === nxt)
            return;
        if (!nxt)
            exc('E_INV_ARG', page + ' is not a member of application.'); 
        if (cur) {
            cur.dispatch(cur._eve.onBeforeHide);
            this.attach(cur);
            cur.dispatch(cur._eve.onAfterHide);
        }
        this._currPage = nxt;
        nxt.dispatch(nxt._eve.onBeforeShow); 
        display.attach(nxt);
        nxt.dispatch(nxt._eve.onAfterShow); 
        display.refresh();
    }


    /*————————————————————————————————————————————————————————————————————————————
      PROP:	mainPageName : string;
      GET : Returns the main page name.
      SET : Sets the main page name. :DEF: 'main'.
      INFO: Main page is the first page to be shown.
            Also it is the fallback page if the requested page is not found.
    ————————————————————————————————————————————————————————————————————————————*/
    get mainPageName() {
        return(this._mainPageName);
    }

    set mainPageName(val = 'main') {
        sys.str(val, 'value of mainPageName must be a string');
        if (!this.hasMember(val))
            exc('E_INV_ARG', val  + ' is not a member of application.');
        this._mainPageName = val;
    }


}

sys.registerClass(TApplication);

export const application = new TApplication();