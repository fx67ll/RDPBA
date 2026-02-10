import { isUrl } from './utils';

describe('isUrl tests', (): void => {
  it('should return false for invalid and corner case inputs', (): void => {
    expect(isUrl([] as any)).toBeFalsy();
    expect(isUrl({} as any)).toBeFalsy();
    expect(isUrl(false as any)).toBeFalsy();
    expect(isUrl(true as any)).toBeFalsy();
    expect(isUrl(NaN as any)).toBeFalsy();
    expect(isUrl(null as any)).toBeFalsy();
    expect(isUrl(undefined as any)).toBeFalsy();
    expect(isUrl('')).toBeFalsy();
  });

  it('should return false for invalid URLs', (): void => {
    expect(isUrl('foo')).toBeFalsy();
    expect(isUrl('bar')).toBeFalsy();
    expect(isUrl('bar/test')).toBeFalsy();
    expect(isUrl('http:/fx67ll.com/')).toBeFalsy();
    expect(isUrl('ttp://fx67ll.com/')).toBeFalsy();
  });

  it('should return true for valid URLs', (): void => {
    expect(isUrl('http://fx67ll.com/')).toBeTruthy();
    expect(isUrl('https://fx67ll.com/')).toBeTruthy();
    expect(isUrl('http://fx67ll.com/test/123')).toBeTruthy();
    expect(isUrl('https://fx67ll.com/test/123')).toBeTruthy();
    expect(isUrl('http://fx67ll.com/test/123?foo=bar')).toBeTruthy();
    expect(isUrl('https://fx67ll.com/test/123?foo=bar')).toBeTruthy();
    expect(isUrl('http://www.fx67ll.com/')).toBeTruthy();
    expect(isUrl('https://www.fx67ll.com/')).toBeTruthy();
    expect(isUrl('http://www.fx67ll.com/test/123')).toBeTruthy();
    expect(isUrl('https://www.fx67ll.com/test/123')).toBeTruthy();
    expect(isUrl('http://www.fx67ll.com/test/123?foo=bar')).toBeTruthy();
    expect(isUrl('https://www.fx67ll.com/test/123?foo=bar')).toBeTruthy();
  });
});
