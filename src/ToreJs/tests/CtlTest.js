import {cts, styler} from "../ctl/index.js";

console.log('\n———————————————————————————————————————————————————');
console.log('CtlTest.js: Beginning testing library. /ToreJs/ctl.');

cts.viewportInfo = { md: 992, sm: 768, xs: 576, lg: 1200, xl: 1400, xxl: null};
console.table(cts.viewportInfo);
console.log(cts.viewportSizes, cts.viewportNames);

console.log('CtlTest.js: Completed testing library. /ToreJs/ctl.');
console.log('———————————————————————————————————————————————————');
