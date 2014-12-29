/*jshint unused:false*/
var dojoConfig = {
	async: true,
	baseUrl: '/lib',
	tlmSiblingOfDojo: false,
	isDebug: true,
	packages: [
		'dojo',
		'dijit',
		'dojox',
		'put-selector',
		'xstyle',
		'dgrid',
		'deutsche',
    'gridx'
	],
	deps: [ 'deutsche' ],
	callback: function (deutsche) {
		deutsche.init();
	}
};
