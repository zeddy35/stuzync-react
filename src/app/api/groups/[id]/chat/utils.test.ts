import { parseLimit, ensureMember } from './utils';

describe('parseLimit', () => {
  it('returns default when NaN', () => {
    const sp = new URLSearchParams();
    expect(parseLimit(sp, 30)).toBe(30);
  });

  it('clamps below min to min', () => {
    const sp = new URLSearchParams([['limit', '0']]);
    expect(parseLimit(sp, 30, 1, 100)).toBe(1);
  });

  it('clamps above max to max', () => {
    const sp = new URLSearchParams([['limit', '1000']]);
    expect(parseLimit(sp, 30, 1, 100)).toBe(100);
  });

  it('floors decimals', () => {
    const sp = new URLSearchParams([['limit', '9.8']]);
    expect(parseLimit(sp, 30, 1, 100)).toBe(9);
  });
});

describe('ensureMember', () => {
  it('returns false when no user/group', async () => {
    await expect(ensureMember('', 'g', async()=>false)).resolves.toBe(false);
    await expect(ensureMember('u', '', async()=>false)).resolves.toBe(false);
  });

  it('uses exists() predicate', async () => {
    const exists = jest.fn(async () => true);
    await expect(ensureMember('U1', 'G1', exists)).resolves.toBe(true);
    expect(exists).toHaveBeenCalledWith({ group: 'G1', user: 'U1' });
  });
});

