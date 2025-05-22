import AccountLockService from './accountLockService.js';

// Mock Redis implementation for testing
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const store = new Map();
    const ttls = new Map();
    
    return {
      get: jest.fn(key => Promise.resolve(store.get(key))),
      set: jest.fn((key, value) => {
        store.set(key, value);
        return Promise.resolve('OK');
      }),
      incr: jest.fn(key => {
        const currentValue = parseInt(store.get(key) || '0', 10);
        const newValue = currentValue + 1;
        store.set(key, newValue.toString());
        return Promise.resolve(newValue);
      }),
      expire: jest.fn((key, seconds) => {
        ttls.set(key, seconds);
        return Promise.resolve(1);
      }),
      ttl: jest.fn(key => Promise.resolve(ttls.get(key) || -2)),
      del: jest.fn(key => {
        const existed = store.has(key);
        store.delete(key);
        ttls.delete(key);
        return Promise.resolve(existed ? 1 : 0);
      }),
      quit: jest.fn(() => Promise.resolve())
    };
  });
});

describe('AccountLockService', () => {
  let lockService;
  const testEmail = 'test@example.com';
  
  beforeEach(() => {
    lockService = new AccountLockService({
      maxAttempts: 5,
      lockDuration: 900 // 15 minutes
    });
    
    // Clear mocks between tests
    jest.clearAllMocks();
  });
  
  afterEach(async () => {
    await lockService.close();
  });
  
  test('should not lock account on first failed attempt', async () => {
    const result = await lockService.recordFailedAttempt(testEmail);
    
    expect(result.locked).toBe(false);
    expect(result.attempts).toBe(1);
    expect(result.remainingAttempts).toBe(4);
    
    const isLocked = await lockService.isAccountLocked(testEmail);
    expect(isLocked).toBe(false);
  });
  
  test('should lock account after max attempts', async () => {
    // Record 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await lockService.recordFailedAttempt(testEmail);
    }
    
    const isLocked = await lockService.isAccountLocked(testEmail);
    expect(isLocked).toBe(true);
    
    const details = await lockService.getLockDetails(testEmail);
    expect(details.isLocked).toBe(true);
    expect(details.attempts).toBe(5);
  });
  
  test('should clear lock when requested', async () => {
    // Record 5 failed attempts to lock account
    for (let i = 0; i < 5; i++) {
      await lockService.recordFailedAttempt(testEmail);
    }
    
    // Verify account is locked
    let isLocked = await lockService.isAccountLocked(testEmail);
    expect(isLocked).toBe(true);
    
    // Clear lock
    await lockService.clearLock(testEmail);
    
    // Verify account is unlocked
    isLocked = await lockService.isAccountLocked(testEmail);
    expect(isLocked).toBe(false);
  });
  
  test('should return correct lock details', async () => {
    // Record 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await lockService.recordFailedAttempt(testEmail);
    }
    
    const details = await lockService.getLockDetails(testEmail);
    expect(details.isLocked).toBe(false);
    expect(details.attempts).toBe(3);
    expect(details.remainingAttempts).toBe(2);
    expect(details.remainingTime).toBeGreaterThan(0);
  });
  
  test('should handle Redis errors gracefully', async () => {
    // Mock Redis error
    lockService.redis.get.mockImplementationOnce(() => 
      Promise.reject(new Error('Redis connection error'))
    );
    
    const isLocked = await lockService.isAccountLocked(testEmail);
    expect(isLocked).toBe(false); // Should fail open
  });
});