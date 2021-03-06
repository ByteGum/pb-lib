import { DefaultOptions as HashDefaultOptions, HashOptions, SCryptHash } from './scrypt-hash';

describe('SCryptHash', () => {
  const testPasswordCorrect = 'PaS$w0rD';
  const testPasswordIncorrect = 'PaS$w0rD_';

  const expectLength = (saltLen: number, hashLen: number) => {
    return (
      1 + // gluing dot symbol (.) length
      Buffer.from(' '.repeat(saltLen)).toString('base64').length +
      Buffer.from(' '.repeat(hashLen)).toString('base64').length
    );
  };

  it('hash should be generated from password with correct length', async () => {
    const hash = await SCryptHash.hash(testPasswordCorrect);

    const expectedLength = expectLength(
      HashDefaultOptions.saltLen,
      HashDefaultOptions.hashLen,
    );

    expect(hash).toContain('.');
    expect(hash.length).toEqual(expectedLength);
  });

  it('hash should be verifiable', async () => {
    const hash = await SCryptHash.hash(testPasswordCorrect);

    expect(await SCryptHash.verify(testPasswordCorrect, hash)).toBeTruthy();
    expect(await SCryptHash.verify(testPasswordIncorrect, hash)).toBeFalsy();
  });

  // Note: this test is performance-demanding due to hi-cost hashing options,
  // and could run for more than 5 seconds on slow machines, so 10s timeout is in place.
  it('should accept options', async () => {
    const saltLen = 32;
    const hashLen = 48;
    const cost = 2 ** 16;
    const blockSize = 16;
    const parallelize = 2;
    const maxmem = 256 * cost * blockSize;

    const customOptions: HashOptions = {
      N: cost,
      r: blockSize,
      p: parallelize,
      maxmem,
      saltLen,
      hashLen,
    };

    const hash = await SCryptHash.hash(testPasswordCorrect, customOptions);

    const expectedLength = expectLength(saltLen, hashLen);

    const checkDefaultOpts = await SCryptHash.verify(testPasswordCorrect, hash);
    const checkCustomOpts = await SCryptHash.verify(
      testPasswordCorrect,
      hash,
      customOptions,
    );
    const checkCustomOptsIncorrect = await SCryptHash.verify(
      testPasswordIncorrect,
      hash,
      customOptions,
    );

    expect(hash.length).toEqual(expectedLength);
    expect(checkDefaultOpts).toBeFalsy();
    expect(checkCustomOpts).toBeTruthy();
    expect(checkCustomOptsIncorrect).toBeFalsy();
  }, 10000);

  it('should ignore incorrect options', async () => {
    const saltLen = 32;
    const hashLen = 48;

    const wrongOptions = {
      blockSize: 0,
      parallelization: -1,
      something: 'WRONG',
      saltLen, // this option will pass
      hashLen, // this option will pass
    };

    // @ts-ignore
    const hash = await SCryptHash.hash(testPasswordCorrect, wrongOptions);

    const expectedLength = expectLength(saltLen, hashLen);

    const checkDefaultOpts = await SCryptHash.verify(testPasswordCorrect, hash);

    const checkCustomOpts = await SCryptHash.verify(testPasswordCorrect, hash, {
      saltLen,
      hashLen,
    });

    expect(hash.length).toEqual(expectedLength);
    expect(checkDefaultOpts).toBeFalsy();
    expect(checkCustomOpts).toBeTruthy();
  });
});
