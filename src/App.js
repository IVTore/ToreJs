import { TObject, EventHandler, Component, Language, i18n, sys, core} from "./ToreJs/lib/index.js";
import { ctl, styler, display, Control, Panel, Label, Button } from "./ToreJs/ctl/index.js";
import { ToreUI } from "./ToreJs/styles/ToreUI.js";

ToreUI();

styler.addRule("P1Ext", {
	backgroundColor: "Turquoise"
});

var p1 = new Panel("p1", display, {
	layout: "vertical",
	contentAlign: 'center',
	autoWidth: 1,
	autoHeight: "content",
	styleExtra: "P1Ext",
	hndVpRes: function(sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "[Hello World!]... " + style.fontSize + " st: ["+ sender._styleSize + "]";
	},
	hndVpTtl: function(sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "Viewport Width: " + document.documentElement.clientWidth +  ", Viewport Size Name: " + styler.viewportSizeName;
	}
});

var prop = {
	autoWidth: "content",
	autoHeight: "content",
	wrap: true,
	onViewportResize: new EventHandler(p1,"hndVpRes")
};

new Label("lv", p1, {
	styleSize: 'Medium',
	height: 40, 
	autoWidth: "content",
	onViewportResize: new EventHandler(p1,"hndVpTtl")
});

new Label("l1", p1, {styleSize: 'Huge',...prop});
new Label("l2", p1, {styleSize: 'Large', ...prop});
new Label("l3", p1, {styleSize: 'Big', ...prop});
new Label("l4", p1, {styleSize: 'Medium', ...prop});
new Label("l5", p1, {styleSize: 'Small', ...prop});
new Label("l6", p1, {styleSize: 'Tiny', ...prop});
var b1 = new Button("b1", p1, {
	styleSize: 'Medium', 
	autoWidth:'content',
	autoHeight: 'content',
	label: {
		_new_:"Label",
		name: "label",
		styleSize: 'Medium', 
		text:'Align Right',
		autoWidth: "content",
		autoHeight: "content"
	}
});

b1.hndHit = function(sender){
	if (p1.contentAlign === 'center'){
		p1.contentAlign = 'right';
		this.label.text = "Align Center";
	} else {
		p1.contentAlign = 'center';
		this.label.text = "Align Right";
	}
	console.log(this.contentAlign, this._computed.paddingLeft, this.label.x, this.label.y);
}

b1.onHit = new EventHandler(b1, "hndHit");

p1.sequence = ["lv","l1","l2","l3","l4","l5","l6","b1"];
console.log("sequence assigned");
display.doViewportResize();



