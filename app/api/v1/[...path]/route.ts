import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function upstreamBase(): string {
  return getApiBaseUrl();
}

async function proxy(req: NextRequest, pathParts: string[]) {
  const target = new URL(
    `/api/v1/${pathParts.map(encodeURIComponent).join("/")}`,
    `${upstreamBase()}/`
  );
  target.search = req.nextUrl.search;

  const headers = new Headers();
  const accept = req.headers.get("accept");
  const acceptLanguage = req.headers.get("accept-language");
  const contentType = req.headers.get("content-type");
  if (accept) headers.set("Accept", accept);
  else headers.set("Accept", "application/json");
  if (acceptLanguage) headers.set("Accept-Language", acceptLanguage);
  if (contentType) headers.set("Content-Type", contentType);

  // Do not forward Origin / Cookie — upstream currently 500s on
  // Origin: http://localhost:3000 for POST /bookings.
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target.toString(), init);
  const body = await upstream.arrayBuffer();

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) responseHeaders.set("Content-Type", upstreamType);
  const requestId =
    upstream.headers.get("X-Request-Id") ??
    upstream.headers.get("x-request-id");
  if (requestId) responseHeaders.set("X-Request-Id", requestId);

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path ?? []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path ?? []);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path ?? []);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path ?? []);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path ?? []);
}
