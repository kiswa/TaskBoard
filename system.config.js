(function(global) {
    var map = {
        'app':          'build',
        'dragula':      'node_modules/dragula/dist/dragula.js',
        'ng2-dragula':  'node_modules/ng2-dragula',
        'rxjs':         'node_modules/rxjs',
        '@angular':     'node_modules/@angular'
    };

    var packages = {
        'app':          { main: 'main.js',  defaultExtension: 'js' },
        'rxjs':         { defaultExtension: 'js' },
        'ng2-dragula':  { defaultExtension: 'js' }
    };

    var angularPackages = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/forms',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router'
    ];

    angularPackages.forEach(function(pkgName) {
        packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
    });

    var config = {
        map: map,
        packages: packages
    };

  System.config(config);

})(this);

