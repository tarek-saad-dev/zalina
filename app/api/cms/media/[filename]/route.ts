import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { cmsImagePath } from "@/lib/static-cms/store";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_req:NextRequest,{params}:{params:{filename:string}}){
 const target=cmsImagePath(params.filename);
 if(!target)return new NextResponse(null,{status:404});
 try{
   const bytes=await fs.readFile(target);
   return new NextResponse(new Uint8Array(bytes),{
     headers:{"Content-Type":"image/webp","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}
   });
 }catch{return new NextResponse(null,{status:404});}
}
