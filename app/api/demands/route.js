import { NextResponse } from 'next/server';
import { readDemands, writeDemands } from '@/lib/db';

export async function GET() {
  try {
    const demands = readDemands();
    return NextResponse.json({ success: true, data: demands });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    writeDemands(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
