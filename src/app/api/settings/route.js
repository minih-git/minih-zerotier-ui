import { NextResponse } from 'next/server';
import { getItem, setItem } from '@/lib/db/storage';
import { isSystemInitialized } from '@/lib/db/users';

export async function GET() {
    try {
        const initialized = await isSystemInitialized();
        if (!initialized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const config = await getItem('zt_config') || {};
        const defaultAddr = process.env.ZT_ADDR || 'http://localhost:9333';

        let backends = [];
        let activeId = config.activeId;

        // Check availability of new structure
        if (config.backends && Array.isArray(config.backends)) {
            backends = config.backends;
        } else {
            // Migration / Default
            // If legacy config exists, use it. Otherwise default.
            const initialAddr = config.ztAddr || defaultAddr;
            const initialId = 'default';
            backends = [{
                id: initialId,
                name: 'Default',
                ztAddr: initialAddr,
                ztToken: config.ztToken || '' // This will be masked below
            }];
            activeId = initialId;
        }

        // Mask tokens for display
        const displayBackends = backends.map(b => ({
            ...b,
            ztToken: b.ztToken ? '******' : ''
        }));

        return NextResponse.json({
            activeId,
            backends: displayBackends
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const initialized = await isSystemInitialized();
        if (!initialized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { activeId, backends } = body;

        if (!Array.isArray(backends)) {
            return NextResponse.json({ error: 'Invalid configuration format' }, { status: 400 });
        }

        const currentConfig = await getItem('zt_config') || {};
        let currentBackends = [];
        if (currentConfig.backends && Array.isArray(currentConfig.backends)) {
            currentBackends = currentConfig.backends;
        } else {
            // Legacy fallback lookup map
            currentBackends = [{
                id: 'default',
                ztToken: currentConfig.ztToken
            }];
        }

        // Process backends to handle masked tokens
        const newBackends = backends.map(newBackend => {
            // If token is masked, try to find original token
            if (newBackend.ztToken === '******') {
                const existing = currentBackends.find(b => b.id === newBackend.id);
                if (existing && existing.ztToken) {
                    return { ...newBackend, ztToken: existing.ztToken };
                }
                // If we can't find it, well, it remains starred which will break things if it was meant to be functional.
                // But usually this means "no change".
                // If it's a new backend with stars, that's invalid input from user, but we'll allow it (it just won't work).
                return { ...newBackend, ztToken: '' };
            }
            return newBackend;
        });

        // Save new structure
        const newConfig = {
            activeId,
            backends: newBackends
        };

        await setItem('zt_config', newConfig);

        return NextResponse.json({ success: true, config: newConfig });
    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
