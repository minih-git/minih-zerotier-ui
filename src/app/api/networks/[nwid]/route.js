import { NextResponse } from 'next/server';
import { getNetwork, getMembers, updateNetwork, getPeers, deleteNetwork } from '@/lib/zt';
import { getItem } from '@/lib/db/storage';

export async function GET(request, { params }) {
    const { nwid } = await params;

    try {
        const [network, membersData, peers] = await Promise.all([
            getNetwork(nwid),
            getMembers(nwid),
            getPeers()
        ]);

        if (!network) {
            return NextResponse.json({ error: 'Network not found' }, { status: 404 });
        }

        // Transform members data and attach names from storage + peer info
        const members = await Promise.all(Object.keys(membersData).map(async (memberId) => {
            const [memberDetail, name] = await Promise.all([
                import('@/lib/zt').then(m => m.getMember(nwid, memberId)),
                getItem(memberId)
            ]);

            const peer = peers.find(p => p.address === memberId);

            return {
                id: memberId,
                name: name || '',
                authorized: memberDetail.authorized,
                activeBridge: memberDetail.activeBridge,
                ipAssignments: memberDetail.ipAssignments,
                online: peer ? (peer.paths && peer.paths.length > 0) : false,
                version: peer ? peer.version : 'unknown',
                latency: peer ? (peer.latency !== -1 ? `${peer.latency}ms` : 'relay') : 'unknown',
                physicalAddress: peer && peer.paths && peer.paths.length > 0 ? peer.paths[0].address : 'unknown'
            };
        }));

        return NextResponse.json({
            network,
            members
        });
    } catch (error) {
        console.error(`Error fetching network ${nwid}:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { nwid } = await params;
    try {
        const body = await request.json();
        const network = await updateNetwork(nwid, body);
        return NextResponse.json(network);
    } catch (error) {
        console.error(`Error updating network ${nwid}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { nwid } = await params;
    try {
        await deleteNetwork(nwid);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting network ${nwid}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
