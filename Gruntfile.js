module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	
	babel: {
      options: {
        sourceMap: false,
		presets: ['es2015']
      },
      dist: {
        files: {
          "dist/js/jquery.timesetter.js": "src/js/jquery.timesetter.js"
        }
      }
    },
	
	clean: {
      dist: 'dist'
    },
	
	exec: {
      'clean-css': {
        command: 'npm run clean-css'
      },
	  uglify: {
        command: 'npm run uglify'
      },
	},
	
    jshint: {
      files: ['Gruntfile.js', 'src/js/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
	
	sass: {
        options: {
            sourceMap: false
        },
        dist: {
            files: {
                'dist/css/jquery.timesetter.css': 'src/scss/jquery.timesetter.scss'
            }
        }
    },
	
	watch: {
      js: {
        files: 'src/js/*.js',
        tasks: ['babel']
      },
      sass: {
        files: 'src/scss/*.scss',
        tasks: ['dist-css']
      }
    }
  });
  
  require("load-grunt-tasks")(grunt);

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['clean:dist', 'test']);
  grunt.registerTask('dist-js', ['babel', 'exec:uglify']);
  grunt.registerTask('dist-css', ['sass', 'exec:clean-css']);
  grunt.registerTask('dist', ['clean:dist', 'dist-css', 'dist-js']);
  grunt.registerTask('prep-release', ['dist']);

};