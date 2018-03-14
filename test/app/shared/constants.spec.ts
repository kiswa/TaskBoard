import { Injectable } from '@angular/core';

import { Constants } from '../../../src/app/shared/constants';

describe('Constants', () => {
  let constants;

  beforeEach(() => {
    constants = new Constants();
  });

  it('has a VERSION', () => {
    expect(constants.VERSION).toEqual('1.0.0');
  });

  it('has a TOKEN', () => {
    expect(constants.TOKEN).toEqual('taskboard.jwt');
  });
})

