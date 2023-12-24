// inspect in browser and change browser window size, see the torture.

import { sys, core, TComponent, TEventHandler } from "../lib/index.js";
import { styler, display, TPanel, TLabel, TButton, TImage, postRenderQueue, application } from "../ctl/index.js";
import { ToreUI } from "../styles/ToreUI.js";

ToreUI();
const brainImgUrl = '../src/ToreJs/tests/images/brain.jpg';
new TImage('istanbul', display, {
    src: { 
        xs: brainImgUrl,
        sm: brainImgUrl,
        md: brainImgUrl,
        df: '../src/ToreJs/tests/images/ist.png'
    },
    autoX: 'center', 
    autoW: {xs:'fit', df:'fit'},
    autoH: 'max'
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
    hndVpRes: function (sender, e) {
        var style = sender._computed;
        sender.text = "[Hello World!] [" + sender.styleSize + "] " + style.fontSize;
    },
    hndOnLoad: function (sender, e) {
        buildTorture();
        display.refresh();
    }
});

application.onLoad = new TEventHandler(pan, pan.hndOnLoad);

function buildTorture() {
    styler.addRule("PanExt", {
        padding: {xs: '5px', df: "10px"}
    });

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
            method: 'hndVpTtl',
            jobQueue: postRenderQueue 
        }
    });

    var labelProps = {
        wrap: true,
        onViewportResize: { _new_: TEventHandler, target: '.p.owner', method: 'hndVpRes', jobQueue: postRenderQueue }
    };

    new TLabel('l1', pan, { styleSize: 'Huge', ...labelProps });
    new TLabel('l2', pan, { styleSize: 'Large', ...labelProps });
    new TLabel('l3', pan, { styleSize: 'Big', ...labelProps });
    new TLabel('l4', pan, { styleSize: 'Medium', ...labelProps });
    new TLabel('l5', pan, { styleSize: 'Small', ...labelProps });
    new TLabel('l6', pan, { styleSize: 'Tiny', ...labelProps });

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
}
    

    

    





