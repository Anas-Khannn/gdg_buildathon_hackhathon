import { NextRequest, NextResponse } from "next/server";

// 8 core Peshawar municipal areas with bounding coordinates for instant offline fallback
const PESHAWAR_AREAS = [
  { id: 1, name: "Hayatabad", nameUr: "حیات آباد", namePs: "حیات آباد", lat: 33.9850, lng: 71.4420 },
  { id: 2, name: "University Town", nameUr: "یونیورسٹی ٹاؤن", namePs: "د پوهنتون ښارګوټی", lat: 34.0040, lng: 71.5030 },
  { id: 3, name: "Saddar Bazar", nameUr: "صدر بازار", namePs: "صدر بازار", lat: 34.0080, lng: 71.5450 },
  { id: 4, name: "Kohati Gate", nameUr: "کوہاٹی گیٹ", namePs: "کوہاټی دروازه", lat: 34.0090, lng: 71.5720 },
  { id: 5, name: "Hashtnagri", nameUr: "ہشتنگری", namePs: "هشتنگري", lat: 34.0150, lng: 71.5830 },
  { id: 6, name: "Gulbahar", nameUr: "گلبہار", namePs: "ګلبہار", lat: 34.0160, lng: 71.5950 },
  { id: 7, name: "Charsadda Road", nameUr: "چارسدہ روڈ", namePs: "چارسدہ سړک", lat: 34.0380, lng: 71.5850 },
  { id: 8, name: "Ring Road", nameUr: "رنگ روڈ", namePs: "رینګ روډ", lat: 33.9890, lng: 71.5650 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // 'reverse' | 'search' | 'ip' | 'areas'
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const query = searchParams.get("q");

  // 1. Return predefined Peshawar areas
  if (action === "areas") {
    return NextResponse.json({ areas: PESHAWAR_AREAS });
  }

  // 2. Free IP-based Geolocation fallback (when browser GPS is blocked/denied)
  if (action === "ip") {
    try {
      const ipRes = await fetch("http://ip-api.com/json/?fields=status,city,regionName,lat,lon,query", {
        headers: { "User-Agent": "NaaliWatch-Peshawar/1.0" },
        cache: "no-store",
      });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.status === "success") {
          return NextResponse.json({
            success: true,
            lat: ipData.lat || 34.0151,
            lng: ipData.lon || 71.5249,
            city: ipData.city || "Peshawar",
            source: "free_ip_geolocation",
          });
        }
      }
    } catch (e) {
      console.warn("IP Geolocation fallback failed:", e);
    }

    // Default to central Peshawar
    return NextResponse.json({
      success: true,
      lat: 34.0125,
      lng: 71.5540,
      city: "Peshawar",
      source: "peshawar_default",
    });
  }

  // 3. Free Forward Search via OpenStreetMap Nominatim
  if (action === "search" && query) {
    try {
      const cleanQuery = encodeURIComponent(`${query.trim()} Peshawar`);
      const searchRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${cleanQuery}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "NaaliWatch-Peshawar/1.0 (contact: info@naaliwatch.pk)",
            "Accept-Language": "en,ur,ps",
          },
        }
      );

      if (searchRes.ok) {
        const results = await searchRes.json();
        const formatted = results.map((r: any) => ({
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          road: r.address?.road || r.address?.suburb || r.address?.neighbourhood || query,
          suburb: r.address?.suburb || r.address?.city_district || "Peshawar",
        }));

        return NextResponse.json({ results: formatted });
      }
    } catch (e) {
      console.warn("Nominatim search failed:", e);
    }

    // Fallback search against predefined Peshawar areas
    const localMatch = PESHAWAR_AREAS.filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase())
    ).map((a) => ({
      displayName: `${a.name}, Peshawar, Khyber Pakhtunkhwa`,
      lat: a.lat,
      lng: a.lng,
      road: a.name,
      suburb: a.name,
    }));

    return NextResponse.json({ results: localMatch });
  }

  // 4. Free Reverse Geocoding via OpenStreetMap Nominatim
  if (action === "reverse" && latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    try {
      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "NaaliWatch-Peshawar/1.0 (contact: info@naaliwatch.pk)",
            "Accept-Language": "en,ur,ps",
          },
        }
      );

      if (nominatimRes.ok) {
        const data = await nominatimRes.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.quarter;
        const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.county || "Peshawar";

        const title = road ? `${road}, ${district}` : data.display_name?.split(",").slice(0, 2).join(",") || "Peshawar Urban Area";

        return NextResponse.json({
          success: true,
          displayName: data.display_name,
          shortTitle: title,
          road,
          district,
          city: addr.city || "Peshawar",
          country: "Pakistan",
        });
      }
    } catch (e) {
      console.warn("Nominatim reverse geocode failed:", e);
    }

    // Fallback: Calculate nearest Peshawar area by Haversine
    let nearest = PESHAWAR_AREAS[0];
    let minDist = Infinity;

    for (const a of PESHAWAR_AREAS) {
      const dLat = (a.lat - lat) * (Math.PI / 180);
      const dLng = (a.lng - lng) * (Math.PI / 180);
      const dist = Math.sin(dLat / 2) ** 2 + Math.cos(lat * (Math.PI / 180)) * Math.cos(a.lat * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
      if (dist < minDist) {
        minDist = dist;
        nearest = a;
      }
    }

    return NextResponse.json({
      success: true,
      displayName: `${nearest.name}, Peshawar, Khyber Pakhtunkhwa, Pakistan`,
      shortTitle: `${nearest.name}, Peshawar`,
      road: nearest.name,
      district: nearest.name,
      city: "Peshawar",
      country: "Pakistan",
    });
  }

  return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });
}
