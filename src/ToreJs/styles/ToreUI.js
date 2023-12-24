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
        xs < 576
        sm < 768
        md < 992
        lg < 1200 
        xl < 1400 
        xxl >= 1400
        df is the default value. Viewport values precede default value.
    2]  Tiny, Small, Medium, Big, Large, Huge words refer to control sizes.
        When standalone, they refer to all control classes.
    3]  To give default sizes to specific controls, write rules with:
        <ControlClass><SizeName>
        Example: Let class name be Car;
        CarTiny, CarSmall, CarMedium, CarBig, CarLarge, CarHuge.
————————————————————————————————————————————————————————————————————————————*/

export function ToreUI(){
    var s = styler;


    s.addRule("Tiny", {    // 14
        fontWeight: '400',
        fontSize: '0.875rem'
    });

    s.addRule("Small", {   // 16
        fontWeight: '400',
        fontSize: '1rem'
    });

    s.addRule("Medium", {  // 20 - 18
        fontWeight: '400',
        fontSize: {
            xs: '1.125rem',
            df: 'calc(1.04rem + 0.24vw)',
            xxl: '1.25rem'
        }
    });

    s.addRule("Big", {     // 24 - 20
        fontWeight: '400',
        fontSize: {
            xs: '1.25rem',
            df: 'calc(1.08rem + 0.48vw)',
            xxl: '1.5rem'
        }
    });

    s.addRule("Large", {   // 48 - 32
        fontWeight: '400',
        fontSize: {
            xs: '2rem',
            df: 'calc(1.3rem + 1.945vw)',
            xxl: '3rem'
        }
    });

    s.addRule("Huge", {    // 64 - 48
        fontWeight: '400',
        fontSize: {
            xs: '3rem',
            df: 'calc(2.3rem + 1.945vw)',
            xxl: '4rem'
        }
    });

    s.addRule("LabelFirst", {
        color: 'White'
    });
    
    s.addRule("LabelFirstHover", {
        color: 'White'
    });

    s.addRule("PanelFirst",{
        backgroundColor: 'rgb(30,30,30)',
        color: 'White'
    });

    s.addRule("DisplayFirst", {
        backgroundColor: 'rgb(20,20,20)'
    });

    s.addRule("Button", {
        padding:'6px 8px 8px 8px',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '4px'
    });

    s.addRule("ButtonFirst",{
        backgroundColor: 'rgb(30,30,30)',
        borderColor: 'rgb(60,60,60)',
    });

    s.addRule("ButtonFirstHover",{
        backgroundColor: 'rgb(70,70,70)',
        borderColor: 'rgb(90,90,90)',
    });

    s.addRule("ButtonFirstFocus",{
        backgroundColor: 'rgb(70,70,70)',
        borderColor: 'rgb(90,90,90)',
    });
}