// inspect in browser and change browser window size, see the torture.

import { TEventHandler } from "../lib/index.js";
import { styler, display, TPanel, TLabel, TButton, TImage } from "../ctl/index.js";
import { ToreUI } from "../styles/ToreUI.js";

ToreUI();

styler.addRule("PanExt", {
	padding: "10px"
});

new TImage('istanbul', display, {
    src: '../src/ToreJs/tests/images/ist.png', 
    aspectRatio: 0.2,
    autoX: 'center', 
    autoW: 'fit', 
    autoH: 'fit'});

new TLabel('lblVpTitle', display, { 
    styleSize: 'Medium',
    y: 90,
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
    autoW: 'fit', 
    autoH: 'fit', 
    splitX: 5,
    splitY: 5,
    styleExtra: 'PanExt',
    hndVpRes: function (sender) {
        var style = sender._computed;
        sender.text = "[Hello World!] [" + sender.styleSize + "] " + style.fontSize;
    }
});

var labelProps = {
	wrap: true,
    onViewportResize: { _new_: TEventHandler, target: '.p.owner', method: 'hndVpRes' }
};


new TLabel('l1',pan,{ styleSize: 'Huge', ...labelProps });
new TLabel('l2',pan,{ styleSize: 'Large', ...labelProps });
new TLabel('l3',pan,{ styleSize: 'Big', ...labelProps });
new TLabel('l4',pan,{ styleSize: 'Medium', ...labelProps });
new TLabel('l5',pan,{ styleSize: 'Small', ...labelProps });
new TLabel('l6',pan,{ styleSize: 'Tiny', ...labelProps });

new TButton('btnAlign', pan, {
    styleSize: 'Medium',
    label: { _new_: TLabel, name: "lblAlign", styleSize: 'Medium', text: 'Align Center', wrap: true, textAlign: 'center'},
    hndHit: function (sender) {
        switch (pan.contentAlign) {
        case 'left' :
            pan.contentAlign = 'center';
            this.lblAlign.text = "Align Right";
            break;
        case 'center':
            pan.contentAlign = 'right';
            this.lblAlign.text = "Align Left";
            break;
        case 'right':    
            pan.contentAlign = 'left';
            this.lblAlign.text = "Align Center";
        }        
        console.log(pan.contentAlign);
    },
    onHit: { _new_: TEventHandler, target: '.p.', method: 'hndHit' }
});

pan.sequence = ['l1','l2','l3','l4','l5','l6', 'btnAlign'];

new TButton('btnSwitch', display, {
    styleSize: 'Medium',
    label: { _new_: TLabel, name: "lblSwitch", styleSize: 'Medium', text: 'Hide Panel', autoW: 'fit', autoH: 'max'},
    handleHit: function (sender) {
        switch (pan.visible) {
        case false :
            pan.visible = true;
            this.lblSwitch.text = "Hide Panel";
            break;
        case true:
            pan.visible = false;
            this.lblSwitch.text = "Show Panel";
            break;
        } 
    },
    onHit: { _new_: TEventHandler, target: '.p.', method: 'handleHit' }
});



display.refresh();
display.istanbul.load();







