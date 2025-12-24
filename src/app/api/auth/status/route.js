import { NextResponse } from 'next/server';
import { isSystemInitialized } from '@/lib/db/users';

export async function GET() {
    try {
        const initialized = await isSystemInitialized();
        return NextResponse.json({ initialized });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
