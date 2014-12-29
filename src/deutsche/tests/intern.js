// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
	// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
	// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
	// automatically
	capabilities: {
		'selenium-version': '2.41.0'
	},

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
		{ browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
		{ browserName: 'firefox', version: '23', platform: [ 'Linux', 'Windows 7' ] },
		{ browserName: 'firefox', version: '21', platform: 'Mac 10.6' },
		{ browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 7' ] },
		{ browserName: 'safari', version: '6', platform: 'Mac 10.8' }
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	// Name of the tunnel class to use for WebDriver tests
	tunnel: 'SauceLabsTunnel',

	// The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
	// loader
	useLoader: {
		'host-node': 'dojo/dojo',
		'host-browser': 'node_modules/dojo/dojo.js'
	},

	// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
	// used here
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [
			{ name: 'dojo', location: 'src/dojo' },
			{ name: 'dijit', location: 'src/dijit' },
			{ name: 'dojox', location: 'src/dojox' },
			{ name: 'put-selector', location: 'src/put-selector' },
			{ name: 'xstyle', location: 'src/xstyle' },
			{ name: 'dgrid', location: 'src/dgrid' },
			{ name: 'deutsche', location: 'src/deutsche' }
		]
	},

	// Non-functional test suite(s) to run in each browser
	suites: [ 'deutsche/tests/unit' ],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [ 'deutsche/tests/functional' ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:node_modules|src\/(?:dojo|dijit|dojox|put-selector|xstyle|dgrid|deutsche\/tests))\//
});
