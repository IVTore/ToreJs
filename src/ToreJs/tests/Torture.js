import { EventHandler } from "../lib/index.js";
import { styler, display, Panel, Label, Button } from "../ctl/index.js";
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
	onViewportResize: { _new_: EventHandler, target: '__p.owner', method: 'hndVpRes' }
};

var p1 = new Panel("p1", display, {
	layout: "vertical",
	contentAlign: 'center',
	autoX: "center",
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
		sender.text = "Viewport Width: " + document.documentElement.clientWidth + ", Viewport Size Name: " + styler.viewportSizeName;
	},
	lv: { _new_: Label, styleSize: 'Medium', height: 40, autoWidth: "fit", onViewportResize: { _new_: EventHandler, target: '__p.owner', method: 'hndVpTtl' } },
	l1: { _new_: Label, styleSize: 'Huge', ...labelProps },
	l2: { _new_: Label, styleSize: 'Large', ...labelProps },
	l3: { _new_: Label, styleSize: 'Big', ...labelProps },
	l4: { _new_: Label, styleSize: 'Medium', ...labelProps },
	l5: { _new_: Label, styleSize: 'Small', ...labelProps },
	l6: { _new_: Label, styleSize: 'Tiny', ...labelProps },
	b1: {
		_new_: Button,
		styleSize: 'Medium',
		autoWidth: "fit",
		autoHeight: 'fit',
		label: { _new_: Label, name: "label", styleSize: 'Medium', text: 'Align Right', autoWidth: "fit", autoHeight: "fit" },
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
		onHit: { _new_: EventHandler, target: '__p', method: 'hndHit' }
	}
});

p1.sequence = ["lv", "l1", "l2", "l3", "l4", "l5", "l6", "b1"];
display.doViewportResize();
