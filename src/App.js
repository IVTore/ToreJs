import { TObject, Language, is, core, EventHandler } from "./ToreJs/lib/index.js";
import { ctl, display, Control, Panel, Label, styler } from "./ToreJs/ctl/index.js";
import { ToreUI } from "./ToreJs/styles/ToreUI.js";

ToreUI();


var p1 = new Panel("p1", display, {
	//anchorRight: true, 
	//anchorBottom: true, 
	//width: display.width, 
	//height: display.height, 
	layout: "vertical",
	autosize: true,
	hndVpRes: function(sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "[Hello World!]... " + style.fontSize + " st: ["+ sender._styleSize + "]";
	},
	hndVpTtl: function(sender) {
		var style = getComputedStyle(sender._element);
		sender.text = "Viewport Width: " + document.documentElement.clientWidth +  "\nViewport Size : " + styler.viewportSizeName;
	}
});

var lv = new Label("lv", p1, {styleSize: 'Medium', onViewportResize: new EventHandler(p1,"hndVpTtl")});
var l1 = new Label("l1", p1, {wrapEnabled: true, alignX: 'center', styleSize: 'Huge', onViewportResize: new EventHandler(p1,"hndVpRes")});
var l2 = new Label("l2", p1, {alignX: 'center', styleSize: 'Large', onViewportResize: new EventHandler(p1,"hndVpRes")});
var l3 = new Label("l3", p1, {alignX: 'center', styleSize: 'Big', onViewportResize: new EventHandler(p1,"hndVpRes")});
var l4 = new Label("l4", p1, {alignX: 'center', styleSize: 'Medium', onViewportResize: new EventHandler(p1,"hndVpRes")});
var l5 = new Label("l5", p1, {alignX: 'center', styleSize: 'Small', onViewportResize: new EventHandler(p1,"hndVpRes")});
var l6 = new Label("l6", p1, {alignX: 'center', styleSize: 'Tiny', onViewportResize: new EventHandler(p1,"hndVpRes")});

display.doViewportResize();



