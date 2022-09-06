/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: ToreUI.js: Tore Js UI style definition.
  License   : MIT.
————————————————————————————————————————————————————————————————————————————*/
import { styler } from "../ctl/index.js";

/*————————————————————————————————————————————————————————————————————————————
    1]  xs, sm, md, lg, xl, xxl values refer to VIEWPORT css breakpoints.
        df is the default value. Viewport values precede default value.
    2]  Tiny, Small, Medium, Big, Large, Huge words refer to control sizes.
————————————————————————————————————————————————————————————————————————————*/

export function ToreUI(){
    var s = styler;


    s.addRule("Tiny", {
        fontSize: 'calc(1.2rem + 2.5vw)'
    });

    s.addRule("Small", {
        fontSize: 'calc(1.3rem + 3.0vw)'
    });

    s.addRule("Medium", {
        fontSize: 'calc(1.4rem + 3.5vw)'
    });

    s.addRule("Big", {
        fontSize: 'calc(1.5rem + 4.0vw)'
    });

    s.addRule("Large", {
        fontSize: 'calc(1.6rem + 4.5vw)'
    });

    s.addRule("Huge", {
        fontSize: 'calc(1.7rem + 5.0vw)'
    });


}