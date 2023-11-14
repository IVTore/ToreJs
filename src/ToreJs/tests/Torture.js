// inspect in browser and change browser window size, see the torture.

import { TEventHandler } from "../lib/index.js";
import { styler, display, TPanel, TLabel, TButton } from "../ctl/index.js";
import { ToreUI } from "../styles/ToreUI.js";

ToreUI();

styler.addRule("PanExt", {
	padding: "10px"
});

new TLabel('lblVpTitle', display, { 
    styleSize: 'Medium',
    y: 10,
    autoX: 'center',  
    wrap: true,
    hndVpTtl: function (sender) {
        var style = getComputedStyle(sender._element);
        sender.text = "Viewport Width: " + document.documentElement.clientWidth + ", Viewport Size Name: " + display.viewportName;
    },
    onViewportResize: { 
        _new_: TEventHandler, 
        target: '.p', 
        method: 'hndVpTtl' 
    }
});

var pan = new TPanel('pan', display, {
    layout: 'vertical',
    wrap: false,
    autoX: 'center', 
    autoY: 'center', 
    autoW: 0.5, 
    autoH: 0.5, 
    splitX: 5,
    splitY: 5,
    styleExtra: 'PanExt',
    hndVpRes: function (sender) {
        var style = getComputedStyle(sender._element);
        sender.text = "[Hello World!] [" + sender._styleSize + "] " + style.fontSize;
    }
});

var labelProps = {
	wrap: true,
    canFocus: true,
    onViewportResize: { _new_: TEventHandler, target: '.p.owner', method: 'hndVpRes' }
};

new TLabel('l1',pan,{ styleSize: 'Huge', ...labelProps });
/*
new TLabel('l2',pan,{ styleSize: 'Large', ...labelProps });
new TLabel('l3',pan,{ styleSize: 'Big', ...labelProps });
new TLabel('l4',pan,{ styleSize: 'Medium', ...labelProps });
new TLabel('l5',pan,{ styleSize: 'Small', ...labelProps });
new TLabel('l6',pan,{ styleSize: 'Tiny', ...labelProps });

new TButton('b1', pan, {
    styleSize: 'Medium',
    label: { _new_: TLabel, name: "label", styleSize: 'Medium', text: 'Align Center'},
    hndHit: function (sender) {
        switch (pan.contentAlign) {
        case 'left' :
            pan.contentAlign = 'center';
            this.label.text = "Align Right";
            break;
        case 'center':
            pan.contentAlign = 'right';
            this.label.text = "Align Left";
            break;
        case 'right':    
            pan.contentAlign = 'left';
            this.label.text = "Align Center";
        }        
        console.log(pan.contentAlign);
    },
    onHit: { _new_: TEventHandler, target: '.p.', method: 'hndHit' }
});
*/	
pan.sequence = ['l1','l2','l3','l4','l5','l6', 'b1'];

display.refresh();



