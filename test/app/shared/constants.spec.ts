import { Constants } from 'src/app/shared/constants';

describe('Constants', () => {
  let constants: any;

  beforeEach(() => {
    constants = new Constants();
  });

  it('has a VERSION', () => {
    expect(constants.VERSION).toEqual('1.0.2');
  });

  it('has a TOKEN', () => {
    expect(constants.TOKEN).toEqual('taskboard.jwt');
  });
})

