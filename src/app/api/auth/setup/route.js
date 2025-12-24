import { NextResponse } from 'next/server';
import { createUser, isSystemInitialized } from '@/lib/db/users';

export async function POST(request) {
    try {
        const initialized = await isSystemInitialized();
        if (initialized) {
            return NextResponse.json({ error: 'System already initialized' }, { status: 403 });
        }

        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        await createUser(username, password);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Setup error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
