import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/db/users';
import { serialize } from 'cookie';

export async function POST(request) {
    const body = await request.json();
    const { username, password } = body;

    const user = await authenticate(username, password);

    if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create a session cookie
    const cookie = serialize('session_user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        sameSite: 'strict',
    });

    return NextResponse.json({ success: true, user }, {
        headers: { 'Set-Cookie': cookie },
    });
}
