import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('dispatchEvent', vi.fn());
vi.stubGlobal('CustomEvent', class {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail;
  }
});
