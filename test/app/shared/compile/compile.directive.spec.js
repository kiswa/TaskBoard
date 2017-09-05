/* global expect RxJs */
var path = '../../../../build/shared/compile/',
    CompileDirective = require(path + 'compile.directive.js').CompileDirective;

describe('CompileDirective', () => {
    var compile,
        vcRef = {
            clear: () => {},
            createComponent: () => {}
        },
        compiler = {
            compileModuleAndAllComponentsAsync: () => {
                return RxJs.Observable.of({ componentFactories: [] }).toPromise();
            }
        };

    beforeEach(() => {
        compile = new CompileDirective(vcRef, compiler);
        compile.compile = '<div></div>';
    });

    it('implements OnChanges', () => {
        compile.ngOnChanges();

        expect(compile.compRef).to.equal(null);
    });
});

