import fs from 'fs/promises';
import path from 'path';

let _token = process.env.ZT_TOKEN;

export async function getToken() {
    if (_token) {
        return _token.trim();
    } else {
        // Probing common paths
        const paths = [
            'C:\\ProgramData\\ZeroTier\\One\\authtoken.secret',
            '/var/lib/zerotier-one/authtoken.secret',
            path.join(process.env.HOME || process.env.USERPROFILE || '', 'Library/Application Support/ZeroTier/One/authtoken.secret')
        ];

        for (const p of paths) {
            try {
                const content = await fs.readFile(p, 'utf8');
                _token = content.trim();
                return _token;
            } catch (e) {
                // Continue to next path
            }
        }

        // If we're here, we couldn't find the token
        // In dev mode, maybe we can mock it or just throw
        throw new Error(`Could not find authtoken.secret in ${paths.join(', ')}`);
    }
}
