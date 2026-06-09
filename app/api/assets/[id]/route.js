import { NextResponse } from 'next/server';
import { readAssets, writeAssets } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const assets = readAssets();
    const index = assets.findIndex((a) => a.assetId === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    // Recalculate warranty end date if start date changed
    const warrantyStart = new Date(body.warrantyStartDate);
    const warrantyEnd = new Date(warrantyStart);
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 3);

    assets[index] = {
      ...assets[index],
          assetType: body.assetType,
          brand: body.brand,
          serialNumber: body.serialNumber,
          processor: body.processor,
          purchaseDate: body.purchaseDate,
          deliveryDate: body.deliveryDate,
          warrantyStartDate: body.warrantyStartDate,
          warrantyEndDate: warrantyEnd.toISOString().split('T')[0],
          department: body.department,
          updatedAt: new Date().toISOString(),
    };


    writeAssets(assets);
    return NextResponse.json({ success: true, data: assets[index] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const assets = readAssets();
    const filtered = assets.filter((a) => a.assetId !== id);

    if (filtered.length === assets.length) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    writeAssets(filtered);
    return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
