import { NextResponse } from 'next/server';
import { readAssets, writeAssets, generateAssetId } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const department = searchParams.get('department') || '';
    const warrantyStatus = searchParams.get('warrantyStatus') || '';

    let assets = readAssets();

    if (search) {
      assets = assets.filter((a) =>
        a.assetId.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (type) {
      assets = assets.filter((a) => a.assetType === type);
    }
    if (department) {
      assets = assets.filter((a) => a.department === department);
    }
    if (warrantyStatus) {
      const today = new Date();
      assets = assets.filter((a) => {
        const end = new Date(a.warrantyEndDate);
        if (warrantyStatus === 'active') return end >= today;
        if (warrantyStatus === 'expired') return end < today;
        return true;
      });
    }

    return NextResponse.json({ success: true, data: assets });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const assets = readAssets();

    const assetId = generateAssetId(body.assetType, assets);

    // Auto-calculate warranty end date 3 years from warranty start
    const warrantyStart = new Date(body.warrantyStartDate);
    const warrantyEnd = new Date(warrantyStart);
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 3);

    const newAsset = {
      assetId,
          assetType: body.assetType,
          brand: body.brand,
          serialNumber: body.serialNumber,
          processor: body.processor,
          purchaseDate: body.purchaseDate,
          deliveryDate: body.deliveryDate,
          warrantyStartDate: body.warrantyStartDate,
          warrantyEndDate: warrantyEnd.toISOString().split('T')[0],
          department: body.department,
          createdAt: new Date().toISOString(),
    };

    assets.push(newAsset);
    writeAssets(assets);

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
