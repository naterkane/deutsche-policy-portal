/*jshint node:true*/
module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt, [ 'grunt-*', 'intern-geezer' ]);
	var path = require('path');

	var stripComments = /<\!--.*?-->/g,
		collapseWhiteSpace = /\s+/g;

	grunt.initConfig({
		dojo: {
			dist: {
				options: {
					dojo: path.join('src', 'lib', 'dojo', 'dojo.js'),
					dojoConfig: path.join('src', 'dojoConfig.js'),
					profile: path.join('profiles', 'deutsche.profile.js'),
					releaseDir: path.join('..', 'dist'),
					basePath: path.join(__dirname, 'src'),
          package: './'

				}
			}
		},
		copy: {
			config: {
				options: {
					processContent: function (content) {
						return content.replace(/isDebug:\s+(true|1),?\s+/, '');
					}
				},
				files: [{
					src: path.join('src', 'dojoConfig.js'),
					dest: path.join('dist', 'dojoConfig.js')
				}]
			},
			index: {
				options: {
					processContent: function (content) {
						return content
							.replace(stripComments, '')
							.replace(collapseWhiteSpace, ' ')
						;
					}
				},
				files: [{
					src: path.join('src', 'index.html'),
					dest: path.join('dist', 'index.html')
				},
          {
            expand: true,
            cwd: 'src/',
            src: '**',
            dest: 'dist/'
          },
        ]
			}
		},
		connect: {
			options: {
				port: 8888,
				hostname: 'localhost'
			},
			test: {
				options: {
					base: 'src'
				}
			},
			dist: {
				options: {
					base: 'dist'
				}
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'dist'
					]
				}]
			}
		},
		intern: {
			local: {
				options: {
					runType: 'client',
					config: 'src/deutsche/tests/intern'
				}
			},
			remote: {
				options: {
					runType: 'runner',
					config: 'src/deutsche/tests/intern'
				}
			}
		}
	});

	grunt.registerTask('default', ['server:dist']);
	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run([
				'build',
				'connect:dist:keepalive'
			]);
		}

		grunt.task.run([
			'connect:test:keepalive'
		]);
	});
	grunt.registerTask('build', [ 'clean', 'dojo:dist', 'copy' ]);
};
