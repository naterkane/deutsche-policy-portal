/*jshint unused:false*/
var dojoConfig = {
	async: true,
	baseUrl: location.pathname.replace(/\/deutsche\/.*$/, '/'),
	tlmSiblingOfDojo: false,
	isDebug: true,
	packages: [
		'dojo',
		'dijit',
		'dojox',
		'put-selector',
		'xstyle',
		'dgrid',
		'deutsche'
	],
	deps: [ 'deutsche/tests/ready' ]
};
