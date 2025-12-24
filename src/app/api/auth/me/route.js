import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get('session_user');

    if (!sessionUser) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        user: { name: sessionUser.value }
    });
}
