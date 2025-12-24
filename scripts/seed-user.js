
const argon2 = require('argon2');
const fs = require('fs');
const path = require('path');

const PASSWD_FILE = path.join(__dirname, '..', '..', 'etc', 'passwd');

async function createDefaultUser() {
    const defaultUser = 'admin';
    const defaultPass = 'password';

    console.log(`Creating default user: ${defaultUser} / ${defaultPass}`);

    try {
        const hash = await argon2.hash(defaultPass);
        const users = {
            [defaultUser]: {
                name: defaultUser,
                hash: hash,
                pass_set: true
            }
        };

        // Ensure directory exists
        const dir = path.dirname(PASSWD_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(PASSWD_FILE, JSON.stringify(users), 'utf8');
        console.log(`Successfully wrote to ${PASSWD_FILE}`);

        // Also ensure storage dir exists while we are at it
        const STORAGE_DIR = path.join(__dirname, '..', '..', 'etc', 'storage');
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }

    } catch (err) {
        console.error('Error creating default user:', err);
    }
}

createDefaultUser();
