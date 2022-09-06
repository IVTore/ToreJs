import { TObject, Language, is, core } from "./ToreJs/lib/index.js";
import { ctl, display, Control, Panel, Label } from "./ToreJs/ctl/index.js";
import { ToreUI } from "./ToreJs/styles/ToreUI.js";

ToreUI();
var p1 = new Panel("p1", display, {anchorRight: true, width: display.width, layout: "vertical", autosize: false});
var l1 = new Label("l1", p1, {alignX: 'center', styleSize: 'Huge', text: "Hello World"});
var l2 = new Label("l2", p1, {alignX: 'center', styleSize: 'Large', text: "Hello World"});
var l3 = new Label("l3", p1, {alignX: 'center', styleSize: 'Big', text: "Hello World"});
var l4 = new Label("l4", p1, {alignX: 'center', styleSize: 'Medium', text: "Hello World"});
var l5 = new Label("l5", p1, {alignX: 'center', styleSize: 'Small', text: "Hello World"});
var l6 = new Label("l6", p1, {alignX: 'center', styleSize: 'Tiny', text: "Hello World"});

