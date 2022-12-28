import { TEventHandler } from "../lib/index.js";
import { styler, display, TPanel, TLabel, TButton } from "../ctl/index.js";
import { ToreUI } from "../styles/ToreUI.js";

ToreUI();

styler.addRule("P1Ext", {
	backgroundColor: "Turquoise",
	padding: "5px"
});


var labelProps = {
	autoWidth: "fit",
	autoHeight: "fit",
	wrap: true,
	onViewportResize: { _new_: TEventHandler, target: '__p.owner', method: 'hndVpRes' }
};

var p1 = new TPanel("p1", display, {
	layout: "vertical",
	contentAlign: 'center',
	autoX: "center",
	autoY: "center",
	autoWidth: "fit",
	autoHeight: "fit",
	splitX: 1,
	splitY: 1,
	styleExtra: "P1Ext",
	hndVpRes: function (sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "[Hello World!]... " + style.fontSize + " st: [" + sender._styleSize + "]";
	},
	hndVpTtl: function (sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "Viewport Width: " + document.documentElement.clientWidth + ", Viewport Size Name: " + display.viewportName;
	},
	lv: { _new_: TLabel, styleSize: 'Medium', height: 40, autoWidth: "fit", onViewportResize: { _new_: TEventHandler, target: '__p.owner', method: 'hndVpTtl' } },
	l1: { _new_: TLabel, styleSize: 'Huge', ...labelProps },
	l2: { _new_: TLabel, styleSize: 'Large', ...labelProps },
	l3: { _new_: TLabel, styleSize: 'Big', ...labelProps },
	l4: { _new_: TLabel, styleSize: 'Medium', ...labelProps },
	l5: { _new_: TLabel, styleSize: 'Small', ...labelProps },
	l6: { _new_: TLabel, styleSize: 'Tiny', ...labelProps },
	b1: {
		_new_: TButton,
		styleSize: 'Medium',
		autoWidth: "fit",
		autoHeight: 'fit',
		label: { _new_: TLabel, name: "label", styleSize: 'Medium', text: 'Align Right', autoWidth: "fit", autoHeight: "fit" },
		hndHit: function (sender) {
			if (p1.contentAlign === 'center') {
				p1.contentAlign = 'right';
				this.label.text = "Align Center";
			} else {
				p1.contentAlign = 'center';
				this.label.text = "Align Right";
			}
			console.log(this.contentAlign, this._computed.paddingLeft, this.label.x, this.label.y);
		},
		onHit: { _new_: TEventHandler, target: '__p', method: 'hndHit' }
	}
});

p1.sequence = ["lv", "l1", "l2", "l3", "l4", "l5", "l6", "b1"];

display.doViewportResize();


