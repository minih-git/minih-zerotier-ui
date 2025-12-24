import { NextResponse } from 'next/server';
import { getDetailedNetworks, createNetwork } from '@/lib/zt';

export async function GET() {
    try {
        const networks = await getDetailedNetworks();
        return NextResponse.json(networks);
    } catch (error) {
        console.error("Error fetching networks:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name } = await request.json();
        const network = await createNetwork(name);
        return NextResponse.json(network);
    } catch (error) {
        console.error("Error creating network:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
