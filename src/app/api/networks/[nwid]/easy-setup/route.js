import { NextResponse } from 'next/server';
import { easySetup } from '@/lib/zt';

export async function POST(request, { params }) {
    const { nwid } = await params;
    try {
        const { routes, ipAssignmentPools, v4AssignMode } = await request.json();
        const network = await easySetup(nwid, routes, ipAssignmentPools, v4AssignMode);
        return NextResponse.json(network);
    } catch (error) {
        console.error(`Error in easy setup for ${nwid}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
