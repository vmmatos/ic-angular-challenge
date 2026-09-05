import { truncate } from './truncate';

describe('truncate', () => {
  it('returns the text unchanged when within the limit', () => {
    expect(truncate('A short description.', 50)).toBe('A short description.');
  });

  it('returns the text unchanged when exactly at the limit', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });

  it('truncates long text at a word boundary and appends an ellipsis', () => {
    const text = 'This description is definitely long enough to be truncated in the UI';
    expect(truncate(text, 20)).toBe('This description is…');
  });

  it('falls back to a hard cut when there is no word boundary', () => {
    expect(truncate('Supercalifragilisticexpialidocious', 10)).toBe('Supercalif…');
  });
});
