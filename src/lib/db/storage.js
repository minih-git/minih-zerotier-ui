import storage from 'node-persist';
import path from 'path';

const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'storage');

let initialized = false;

async function init() {
    if (!initialized) {
        await storage.init({ dir: STORAGE_DIR });
        initialized = true;
    }
}

export async function getItem(key) {
    await init();
    return await storage.getItem(key);
}

export async function setItem(key, value) {
    await init();
    return await storage.setItem(key, value);
}

export async function removeItem(key) {
    await init();
    return await storage.removeItem(key);
}
