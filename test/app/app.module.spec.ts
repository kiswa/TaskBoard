import { AppModule } from '../../src/app/app.module';

describe('Module', () => {
  it('provides an AppModule class', () => {
    let appModule = new AppModule();
    expect(appModule).toEqual(jasmine.any(Object));
  });
})

