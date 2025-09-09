import { NextRequest, NextResponse } from "next/server";

// This route is not implemented
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
