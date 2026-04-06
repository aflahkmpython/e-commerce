import authReducer, { logout, updateTokens } from '../authSlice';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    role: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    // Mocking localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
  });

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: { name: 'Test' },
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
      role: 'customer',
      loading: false,
      error: null,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBe(null);
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
  });

  it('should handle updateTokens', () => {
    const action = { payload: { access: 'new-access', refresh: 'new-refresh' } };
    const actual = authReducer(initialState, updateTokens(action.payload));
    expect(actual.accessToken).toBe('new-access');
    expect(actual.refreshToken).toBe('new-refresh');
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access');
  });
});
