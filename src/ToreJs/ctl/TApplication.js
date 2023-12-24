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
    Provides an onLoad event for page load completion...	
    TODO: views etc...
————————————————————————————————————————————————————————————————————————————*/
class TApplication extends TComponent {
    
    static serializable = false;

    static cdta = {
        onLoad: {event: true}
    }

    _doWindowLoad = null;

    constructor() {
        var n = 'application';
        if (core[n])
            exc('E_SINGLETON', n);
        super(n, core);
        this._doWindowLoad = sys.bindHandler(this, 'doWindowLoad');
        window.addEventListener("load", this._doWindowLoad, true);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys display singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		var t = this;
	
		if (t._sta === sys.DEAD)
			return;
		window.removeEventListener('load', t._doWindowLoad, true);
        t._doWindowLoad = null;
		super.destroy();
	}


    doWindowLoad(e) {
        display.refresh();
        this.dispatch(this._eve.onLoad);
    }

    

}

sys.registerClass(TApplication);

export const application = new TApplication();