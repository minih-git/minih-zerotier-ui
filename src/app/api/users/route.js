import { NextResponse } from 'next/server';
import { listUsers, createUser } from '@/lib/db/users';

export async function GET() {
    try {
        const users = await listUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }
        await createUser(username, password);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
