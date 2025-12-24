import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    const cookie = serialize('session_user', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/',
        sameSite: 'strict',
    });

    return NextResponse.json({ success: true }, {
        headers: { 'Set-Cookie': cookie },
    });
}
