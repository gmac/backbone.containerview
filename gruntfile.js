module.exports = function( grunt ) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '// Backbone.ViewKit <%= pkg.version %>\n// (c) 2014 Greg MacWilliam\n// Freely distributed under the MIT license\n',
				sourceMapRoot: './',
				sourceMap: '<%= pkg.name %>.min.map',
				sourceMapUrl: '<%= pkg.name %>.min.map'
			},
			target: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js'
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.registerTask("default", ["uglify"]);
};