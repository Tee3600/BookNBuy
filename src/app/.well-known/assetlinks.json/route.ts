import { NextResponse } from "next/server";

// Digital Asset Links for Trusted Web Activity (TWA) verification.
// Replace PASTE_SHA256_HERE with the SHA-256 from PWABuilder/Bubblewrap
// (they show it after generating the keystore), redeploy, then build the APK.
export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "app.booknbuy.twa",
          sha256_cert_fingerprints: ["PASTE_SHA256_HERE"],
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } }
  );
}
