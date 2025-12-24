import fs from 'fs/promises';
import { constants } from 'fs';
import argon2 from 'argon2';
import path from 'path';

const PASSWD_FILE = process.env.PASSWD_FILE || path.join(process.cwd(), 'data', 'passwd'); // Adjust path for Docker/Next.js root
const MIN_PASS_LEN = 10;

let _users = null;

async function getUsers() {
    if (_users) return _users;
    try {
        const data = await fs.readFile(PASSWD_FILE, 'utf8');
        _users = JSON.parse(data);
        return _users;
    } catch (error) {
        // If file doesn't exist, return empty or default
        return {};
    }
}

async function saveUsers(users) {
    // Ensure directory exists
    const dir = path.dirname(PASSWD_FILE);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (e) { }

    await fs.writeFile(PASSWD_FILE, JSON.stringify(users), 'utf8');
    try {
        await fs.chmod(PASSWD_FILE, 0o600);
    } catch (e) { }
    _users = users;
}

export async function authenticate(username, password) {
    const users = await getUsers();
    const user = users[username];
    if (!user) return null;

    try {
        if (await argon2.verify(user.hash, password)) {
            // Return user without hash
            const { hash, ...safeUser } = user;
            return safeUser;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export async function createUser(username, password) {
    const users = await getUsers();
    if (users[username]) throw new Error('User already exists');

    const hash = await argon2.hash(password);
    users[username] = {
        name: username,
        hash,
        pass_set: true
    };

    await saveUsers(users);
    await writeLockFile();
    return users[username];
}

export async function deleteUser(username) {
    const users = await getUsers();
    if (!users[username]) throw new Error('User not found');

    // Prevent deleting the last user or a specific admin if needed, 
    // but for now just allow deleting. 
    // Maybe prevent deleting self? That's hard to check here without context.

    delete users[username];
    await saveUsers(users);
    return true;
}

export async function changePassword(username, newPassword) {
    const users = await getUsers();
    if (!users[username]) throw new Error('User not found');

    const hash = await argon2.hash(newPassword);
    users[username].hash = hash;
    users[username].pass_set = true;

    await saveUsers(users);
    return true;
}

export async function listUsers() {
    const users = await getUsers();
    return Object.values(users).map(u => {
        const { hash, ...safe } = u;
        return safe;
    });
}

export async function hasAnyUser() {
    const users = await getUsers();
    return Object.keys(users).length > 0;
}

export async function isSystemInitialized() {
    if (await hasAnyUser()) return true;
    try {
        const lockFile = path.join(path.dirname(PASSWD_FILE), 'setup.lock');
        await fs.access(lockFile);
        return true;
    } catch {
        return false;
    }
}

async function writeLockFile() {
    const dir = path.dirname(PASSWD_FILE);
    try {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, 'setup.lock'), 'LOCKED', 'utf8');
    } catch (e) {
        console.error('Failed to write lock file', e);
    }
}
