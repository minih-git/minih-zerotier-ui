import { NextResponse } from 'next/server';
import { getDetailedNetworks, createNetwork } from '@/lib/zt';

export async function GET() {
    try {
        const networks = await getDetailedNetworks();
        return NextResponse.json(networks);
    } catch (error) {
        console.error("Error fetching networks:", error.message);
        if (error.message === "ZeroTier Controller Unreachable") {
            return NextResponse.json({ error: "ZeroTier Controller Unreachable. Please check your settings." }, { status: 503 });
        }
        if (error.message === "Invalid ZeroTier API Token") {
            return NextResponse.json({ error: "Invalid ZeroTier API Token. Please check your settings." }, { status: 401 });
        }
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
