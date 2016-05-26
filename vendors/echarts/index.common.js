/**
 * Export echarts as CommonJS module
 */
module.exports = require('./lib/echarts');

require('./lib/chart/line');
require('./lib/chart/bar');
require('./lib/chart/pie');
require('./lib/chart/scatter');
require('./lib/component/tooltip');
require('./lib/component/legend');

require('./lib/component/grid');
require('./lib/component/title');

require('./lib/component/markPoint');
require('./lib/component/markLine');
require('./lib/component/dataZoom');
require('./lib/component/toolbox');

require('zrender/lib/vml/vml');