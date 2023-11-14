import {TCtl, styler} from "../ctl/index.js";

const c = console;
c.log('\n———————————————————————————————————————————————————');
c.log('CtlTest.js: Beginning testing library. /ToreJs/ctl.');
c.log('');
c.log('TCtl viewport info tests.');
c.log('');
c.log('TCtl.vpInfo = { md: 992, sm: 768, xs: 576, lg: 1200, xl: 1400, xxl: null};')
TCtl.vpInfo = { md: 992, sm: 768, xs: 576, lg: 1200, xl: 1400, xxl: null};
c.log('Result:');
c.table(TCtl.vpInfo);
c.log('TCtl.vpSizes = ', TCtl.vpSizes);
c.log('TCtl.vpNames = ', TCtl.vpNames);
c.log('');
c.log('styler:');
c.log(styler);
c.log('');
c.log('CtlTest.js: Completed testing library. /ToreJs/ctl.');
c.log('———————————————————————————————————————————————————');
