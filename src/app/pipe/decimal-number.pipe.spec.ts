import { DecimalNumberPipe } from './decimal-number.pipe';

describe('DecimalNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new DecimalNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
