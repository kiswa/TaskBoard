(function(global) {
    var map = {
        'app':          'build',

        'dragula':      'node_modules/dragula/dist/dragula.js',
        'ng2-dragula':  'node_modules/ng2-dragula',

        'rxjs':         'node_modules/rxjs',
        '@angular':     'node_modules/@angular',

        'chartist':     'node_modules/chartist/dist/chartist.js'
    };

    var packages = {
        'app':          { main: 'main.js',  defaultExtension: 'js' },
        'rxjs':         { defaultExtension: 'js' },
        'ng2-dragula':  { defaultExtension: 'js' }
    };

    var angularPackages = [
        'common',
        'compiler',
        'core',
        'forms',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router'
    ];

    angularPackages.forEach(function(pkgName) {
        packages['@angular/' + pkgName] = {
            main: 'bundles/' + pkgName + '.umd.js',
            defaultExtension: 'js'
        };
    });

    var config = {
        map,
        packages
    };

  System.config(config);
})(this);

