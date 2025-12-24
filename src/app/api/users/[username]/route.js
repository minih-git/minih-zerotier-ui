import { NextResponse } from 'next/server';
import { deleteUser, changePassword } from '@/lib/db/users';

export async function DELETE(request, { params }) {
    try {
        const { username } = await params;
        await deleteUser(username);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { username } = await params;
        const { password } = await request.json();
        if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

        await changePassword(username, password);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
