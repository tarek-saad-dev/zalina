import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { isAboutImageSlot } from "@/lib/about/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 11 * 1024 * 1024;

type Ctx = { params: { path?: string[] } };
function failure(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Narrow About-image proxy; Laravel MUST validate admin role, CSRF and files. */
async function handler(req: NextRequest, ctx: Ctx) {
  const path = ctx.params.path ?? [];
  const isListing = path.length === 0 && req.method === "GET";
  const isSlotMutation = path.length === 1 && isAboutImageSlot(path[0]) &&
    (req.method === "PUT" || req.method === "DELETE");
  if (!isListing && !isSlotMutation) return failure(404, "Unknown About media operation");
  if (isSlotMutation) {
    const origin = req.headers.get("origin");
    if (!origin || origin !== req.nextUrl.origin) return failure(403, "Invalid request origin");
  }
  const size = Number(req.headers.get("content-length") || "0");
  if (size > MAX_BODY_BYTES) return failure(413, "Upload exceeds 10 MB");
  const target = new URL(
    "/api/v1/admin/pages/about/media" + (path.length ? "/" + encodeURIComponent(path[0]) : ""),
    getApiBaseUrl() + "/"
  );
  const headers = new Headers({ Accept: "application/json" });
  for (const name of ["cookie", "content-type", "x-xsrf-token", "x-csrf-token", "accept-language"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const body = req.method === "PUT" ? await req.arrayBuffer() : undefined;
    if (body && body.byteLength > MAX_BODY_BYTES) return failure(413, "Upload exceeds 10 MB");
    const upstream = await fetch(target, {
      method: req.method, headers, body, cache: "no-store", redirect: "manual",
    });
    if (upstream.status >= 300 && upstream.status < 400) return failure(502, "Unexpected authentication redirect");
    const data = await upstream.arrayBuffer();
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    if (contentType) responseHeaders.set("Content-Type", contentType);
    return new NextResponse(data, { status: upstream.status, headers: responseHeaders });
  } catch {
    return failure(502, "About media API is not yet connected");
  }
}
export async function GET(req: NextRequest, ctx: Ctx) { return handler(req, ctx); }
export async function PUT(req: NextRequest, ctx: Ctx) { return handler(req, ctx); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handler(req, ctx); }
