'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    // vars
    src_dir: 'src',
    test_dir: 'test',
    build_dir: 'bin',
    test_build_dir: 'testbin',

    // lint
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON('tslint.json')
      },
      src: {
        src: ['<%= src_dir %>/**/*.ts']
      },
      test: {
        src: ['<%= test_dir %>/**/*.ts']
      }
    },

    // build
    ts: {
      options: {
        module: 'commonjs',
        fast: 'never',
        target: 'es5',
        declaration: false,
        sourcemap: true,
        removeComments: true,
        noImplicitAny: false
      },
      src: {
        src: ['<%= src_dir %>/**/*.ts'],
        outDir: '<%= build_dir %>/lib'
      },
      test: {
        src: ['<%= test_dir %>/**/*.ts'],
        outDir: '<%= test_build_dir %>'
      }
    },

    // clean
    clean: {
      build: {
        src: ['<%= build_dir %>']
      },
      remove_src_baseDir: {
        src: ['<%= src_dir %>/.baseDir.ts'],
        dot: true
      },
      test_build: {
        src: ['<%= test_build_dir %>']
      },
      remove_test_baseDir: {
        src: ['<%= test_dir %>/.baseDir.ts'],
        dot: true
      }
    },
    ts_clean: {
      src: {
        src: ['<%= build_dir %>/lib/**/*'],
        dot: true
      },
      test: {
        src: ['<%= test_build_dir %>/**/*'],
        dot: true
      }
    },

    // test
    mochaTest: {
      all: {
        src:'<%= test_build_dir %>/test/**/*_test.js'
      }
    },

    // other
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: ['<%= src_dir %>', '<%= test_dir %>'],
        tasks: ['test']
      }
    },
    todo: {
      options: {},
      src: ['<%= src_dir %>/**/*']
    },
    run: {
      link: {
        exec: 'sudo npm link || true'
      },
      update_tsd: {
        cmd: 'tsd',
        args: [
          'update',
          '-so'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-ts-clean');
  grunt.loadNpmTasks('grunt-tsd');
  grunt.loadNpmTasks('grunt-todo');

  grunt.registerTask('make_cli_exe', 'Creates an executable script for running this project as a command line interface.', function() {
    var path = grunt.config('build_dir') + '/lambdacalc';
    grunt.log.writeln('Writing ' + path);
    grunt.file.write(path, '#!/usr/bin/env node\nrequire(\'./lib/cli\')(process.argv);\n');
  });

  grunt.registerTask('update', ['run:update_tsd']);

  grunt.registerTask('build:test', ['ts:test', 'clean:remove_test_baseDir']);
  grunt.registerTask('build:src', ['ts:src', 'clean:remove_src_baseDir', 'make_cli_exe', 'run:link']);

  grunt.registerTask('test_setup', ['tslint', 'clean:test_build', 'build:test']);
  grunt.registerTask('cli_setup', ['tslint', 'clean:build', 'build:src', 'ts_clean:src']);

  grunt.registerTask('test', ['test_setup', 'mochaTest']);
  grunt.registerTask('default', ['cli_setup', 'todo']);

};
