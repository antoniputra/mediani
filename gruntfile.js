module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				banner: '<%= banner %>\n<%= jqueryCheck %>',
				stripBanners: false
			},
			mediani: {
				src: [
					'./src/mediani.js',
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			core: {
				src: '<%= concat.mediani.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
	});

	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

  	grunt.registerTask('dist', ['concat', 'uglify:core']);
};