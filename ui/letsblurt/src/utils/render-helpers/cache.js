import LRU from 'lru-cache';

const cache = new LRU(60);

export const setCacheSize = (size) => {
  cache.max = size;
};

export const cacheGet = (key) => cache.get(key);


export const cacheSet = (key, val) => {
  cache.set(key, val);
};
