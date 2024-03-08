/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20240307
  Author	: 	İhsan V. Töre
  About		: 	TPage.js: Tore Js page class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, core, TComponent } from "../lib/index.js"
import { display }      from "./TDisplay.js";
import { TPanel }       from "./TPanel.js";
import { application }  from "./TApplication.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TPage.
  TASKS: 
	TPage instances can be subclassed or just used directly for defining
    pages of application. They are basically panels, supporting navigation
    and several other aspects.
    TPage instances are normally members of TApplication.
    They are passed to display when activated.
    If not destroyed, then they are reclaimed back to TApplication.

    In contrast to the other components, the page data at the constructor
    is passed to the page when page.build() is called.
————————————————————————————————————————————————————————————————————————————*/
class TPage extends TPanel {
    
    static serializable = true;

    static cdta = {
        onLoad: {event: true},
        onShow: {event: true},
        onHide: {event: true}
    }

    
    constructor(name = null, data = null) {
        super(name);
        this.initControl(name, application);9
    }

    /*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys display singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		if (this._sta === sys.DEAD)
			return;
		super.destroy();
	}



}

sys.registerClass(TPage);
