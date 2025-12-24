import { NextResponse } from 'next/server';
import { getDetailedNetworks, getStatus } from '@/lib/zt';
import { listUsers } from '@/lib/db/users';

export async function GET() {
    try {
        const [networks, status, users] = await Promise.all([
            getDetailedNetworks(),
            getStatus(),
            listUsers()
        ]);

        const totalMembers = networks.reduce((acc, n) => acc + n.memberCount, 0);
        const onlineMembers = networks.reduce((acc, n) => acc + n.onlineCount, 0);

        return NextResponse.json({
            networksCount: networks.length,
            totalMembers,
            onlineMembers,
            totalUsers: users.length,
            version: status.version,
            address: status.address
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
