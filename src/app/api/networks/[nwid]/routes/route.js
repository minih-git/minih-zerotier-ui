import { NextResponse } from 'next/server';
import { updateRoutes } from '@/lib/zt';

export async function POST(request, { params }) {
    const { nwid } = await params;
    try {
        const { route, action } = await request.json(); // action: 'add' | 'delete'
        const network = await updateRoutes(nwid, route, action);
        return NextResponse.json(network);
    } catch (error) {
        console.error(`Error updating routes for ${nwid}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
