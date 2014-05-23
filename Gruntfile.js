module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// tasks
		jscs: grunt.file.readJSON('./grunt/tasks/jscs.json'),
		jshint: grunt.file.readJSON('./grunt/tasks/jshint.json'),
		uglify: grunt.file.readJSON('./grunt/tasks/uglify.json')
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jscs-checker');

	grunt.registerTask(
		'default',
		[
			'jscs',
			'jshint:src',
			'uglify'
		]
	);

};
