import { NextResponse } from 'next/server';
import { updateMember, deleteMember } from '@/lib/zt';
import { setItem, removeItem } from '@/lib/db/storage';

export async function PATCH(request, { params }) {
    const { nwid, memberId } = await params;
    try {
        const body = await request.json();

        // Handle specialized IP operations
        if (body.addIP) {
            const member = await import('@/lib/zt').then(m => m.addMemberIP(nwid, memberId, body.addIP));
            return NextResponse.json(member);
        }

        if (body.removeIP) {
            const member = await import('@/lib/zt').then(m => m.deleteMemberIP(nwid, memberId, body.removeIP));
            return NextResponse.json(member);
        }

        // Handle name update separately (stored in local storage, not ZT)
        if ('name' in body) {
            await setItem(memberId, body.name);
            delete body.name;
        }

        // If there are still fields to update in ZT
        if (Object.keys(body).length > 0) {
            const member = await updateMember(nwid, memberId, body);
            return NextResponse.json(member);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error updating member ${memberId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { nwid, memberId } = params;
    try {
        const result = await deleteMember(nwid, memberId);
        await removeItem(memberId);
        return NextResponse.json(result);
    } catch (error) {
        console.error(`Error deleting member ${memberId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
