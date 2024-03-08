// inspect in browser and change browser window size, see the torture.

import { 
    sys, 
    core, 
    TComponent, 
    TEventHandler 
}                   from "../lib/index.js";
import { 
    styler, 
    display, 
    TPanel, 
    TLabel, 
    TButton, 
    TImage, 
    TInput, 
    TInputPassword, 
    TInputEmail,
    TTextArea,
    TPage,
    postRenderQueue, 
    application 
}                   from "../ctl/index.js";
import { ToreUI }   from "../styles/ToreUI.js";


ToreUI();

const brainImgUrl = '../src/ToreJs/tests/images/brain.jpg';

const labelProps = {
    wrap: true,
    onViewportResize: {
        _new_: TEventHandler,
        target: '.p.owner',
        method: 'handleViewportResize',
        jobQueue: postRenderQueue 
    }
};

styler.addRule("PanExt", {
    padding: {xs: '5px', df: "10px"}
});


var mainPageData = {

    imgBackground: {
        _new_: TImage,
        src: { 
            xs: brainImgUrl,
            sm: brainImgUrl,
            md: brainImgUrl,
            df: '../src/ToreJs/tests/images/ist.png'
        },
        autoX: 'center', 
        autoW: 'fit',
        autoH: 'max'
    },

    btnSwitch: {
        _new_: TButton,
        styleSize: 'Medium',
        lblSwitch: {
            _new_: TLabel, 
            name: "lblSwitch", 
            styleSize: 'Medium', 
            text: 'Hide Panel', 
            autoW: 'fit', 
            autoH: 'max'
        },
        handleHit: function (sender) {
            var pnl = this.owner.pnlTest;
            switch (pnl.visible) {
            case false :
                pnl.visible = true;
                this.lblSwitch.text = "Hide Panel";
                break;
            case true:
                pnl.visible = false;
                this.lblSwitch.text = "Show Panel";
                break;
            } 
        },
        onHit: { 
            _new_: TEventHandler, 
            target: '.p.', 
            method: 'handleHit' 
        }
    },

    lblViewportInfo: {
        _new_: TLabel,
        styleSize: 'Medium',
        y: 90,
        autoX: 'center',  
        wrap: true,
        handleViewportInfo: function (sender) {
            sender.text = 
                "Viewport Width: " +
                 document.documentElement.clientWidth + 
                 ", Viewport Size Name: " + 
                 display.viewportName;
        },
        onViewportResize: { 
            _new_: TEventHandler, 
            target: '.p', 
            method: 'handleViewportInfo',
            jobQueue: postRenderQueue 
        }
    },

    pnlTest: {
        _new_: TPanel,
        layout: 'vertical',
        wrap: false,
        autoX: 'center', 
        autoY: 'center', 
        autoW: 'fit', 
        autoH: 'fit', 
        splitX: 5,
        splitY: 5,
        styleExtra: 'PanExt',
        tabsLoop: true,
        handleViewportResize: function (sender, e) {
            var style = sender._computed;
            sender.text = "[Hello World!] [" + sender.styleSize + "] " + style.fontSize;
        },

        lbl1: {_new_: TLabel, styleSize: 'Huge', ...labelProps},
        lbl2: {_new_: TLabel, styleSize: 'Large', ...labelProps},
        lbl3: {_new_: TLabel, styleSize: 'Big', ...labelProps},
        lbl4: {_new_: TLabel, styleSize: 'Medium', ...labelProps},
        lbl5: {_new_: TLabel, styleSize: 'Small', ...labelProps},
        lbl6: {_new_: TLabel, styleSize: 'Tiny', ...labelProps},

        btn128: {
            _new_: TButton,
            styleSize: 'Medium',
            autoW: null,
            autoH: null,
            w: 128,
            h: 32
        },

        inpText: {
            _new_: TInput,
            styleSize: 'Medium',
            placeholder: 'Input text'
        },

        inpPass: {
            _new_: TInputPassword,
            styleSize: 'Medium',
            placeholder: 'Input password'
        },

        inpMail: {
            _new_: TInputEmail,
            styleSize: 'Medium',
            placeholder: 'Input mail'
        },

        inpArea: {
            _new_: TTextArea,
            styleSize: 'Medium',
            placeholder: 'Input area'
        },

        btnAlign: {
            _new_: TButton,
            styleSize: 'Medium',
            label: { 
                _new_: TLabel,
                name: "lblAlign",
                styleSize: 'Medium',
                text: 'Align Center',
                wrap: true, 
                textAlign: 'center'
            },
            hndHit: function (sender) {
                var pnl = this.owner;
                switch (pnl.contentAlign) {
                case 'left' :
                    pnl.contentAlign = 'center';
                    this.lblAlign.text = "Align Right";
                    break;
                case 'center':
                    pnl.contentAlign = 'right';
                    this.lblAlign.text = "Align Left";
                    break;
                case 'right':    
                    pnl.contentAlign = 'left';
                    this.lblAlign.text = "Align Center";
                }        
                console.log(pnl.contentAlign);
            },
            onHit: { 
                _new_: TEventHandler, 
                target: '.p.', 
                method: 'hndHit' 
            }
        },

        sequence: ['lbl1','lbl2','lbl3','lbl4','lbl5','lbl6','btn128', 'inpText', 'inpPass', 'inpMail', 'inpArea', 'btnAlign']
    },
    
}


var mainPage = new TPage('mainPage', mainPageData);



application.onLoad = new TEventHandler(pan, pan.hndOnLoad);

// for console debugging
window.core = core;
 

    





