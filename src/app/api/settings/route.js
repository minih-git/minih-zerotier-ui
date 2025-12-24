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

        // Return config, falling back to env vars for display if not set in DB
        // (But we only return what is explicitly overriden or safe defaults)
        const displayConfig = {
            ztAddr: config.ztAddr || process.env.ZT_ADDR || 'http://localhost:9993',
            // Don't return full token for security if possible, but for edit we might need it.
            // Or we just return placeholder if set.
            ztToken: config.ztToken ? '******' : ''
        };

        return NextResponse.json(displayConfig);
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
        const { ztAddr, ztToken } = body;

        const currentConfig = await getItem('zt_config') || {};

        const newConfig = {
            ...currentConfig,
            ztAddr: ztAddr || currentConfig.ztAddr,
        };

        // Only update token if provided (not empty string)
        if (ztToken && ztToken !== '******') {
            newConfig.ztToken = ztToken;
        }

        await setItem('zt_config', newConfig);

        return NextResponse.json({ success: true, config: newConfig });
    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
