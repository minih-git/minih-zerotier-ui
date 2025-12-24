import { NextResponse } from 'next/server';
import { updateIPAssignmentPools } from '@/lib/zt';

export async function POST(request, { params }) {
    const { nwid } = await params;
    try {
        const { pool, action } = await request.json(); // action: 'add' | 'delete'
        const network = await updateIPAssignmentPools(nwid, pool, action);
        return NextResponse.json(network);
    } catch (error) {
        console.error(`Error updating IP pools for ${nwid}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
