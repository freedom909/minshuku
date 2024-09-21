import { setEx, get } from './cacheClient';

const setCache = async (key, data, maxAge) => {
    try {
        await setEx(key, maxAge, JSON.stringify(data));
    } catch (err) {
        console.error('Error setting cache:', err);
    }
};

const getCache = async (key) => {
    try {
        const cachedData = await get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (err) {
        console.error('Error getting cache:', err);
        return null;
    }
};

export default {
    setCache,
    getCache,
};
