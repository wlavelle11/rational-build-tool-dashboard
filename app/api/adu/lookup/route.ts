import { NextResponse } from 'next/server'

// Step 1: Census Bureau geocoder — free, no key, public
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=2020&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const match = data?.result?.addressMatches?.[0]
  if (!match) return null
  return { lat: match.coordinates.y, lon: match.coordinates.x }
}

// Step 2: SD County parcel service — public, no auth required (allowOthersToQuery: true)
async function fetchParcel(lat: number, lon: number) {
  const geometry = JSON.stringify({ x: lon, y: lat })
  const params = new URLSearchParams({
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ACREAGE,NUCLEUS_ZONE_CD,TOTAL_LVG_AREA,APN,SITUS_ADDRESS,SITUS_STREET,SITUS_COMMUNITY',
    returnGeometry: 'false',
    f: 'json',
  })
  const url = `https://webmaps.sandiego.gov/arcgis/rest/services/GeocoderMerged/MapServer/1/query?${params}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data?.features?.[0]?.attributes ?? null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'address is required' }, { status: 400 })

  try {
    const coords = await geocodeAddress(address)
    if (!coords) return NextResponse.json({ error: 'Address not found. Try entering a more specific address.' }, { status: 404 })

    const parcel = await fetchParcel(coords.lat, coords.lon)
    if (!parcel) return NextResponse.json({ error: 'No parcel found at this address. Enter values manually.' }, { status: 404 })

    return NextResponse.json({
      apn: parcel.APN ?? null,
      lotSizeSqft: parcel.ACREAGE ? Math.round(parcel.ACREAGE * 43560) : null,
      zoningCode: parcel.NUCLEUS_ZONE_CD ?? null,
      existingCoverageSqft: parcel.TOTAL_LVG_AREA ?? null,
      matchedAddress: [parcel.SITUS_ADDRESS, parcel.SITUS_STREET, parcel.SITUS_COMMUNITY].filter(Boolean).join(' '),
    })
  } catch {
    return NextResponse.json({ error: 'Lookup failed. Enter values manually.' }, { status: 500 })
  }
}
