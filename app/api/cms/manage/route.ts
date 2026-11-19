import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
 CMS_PAGES, CMS_IMAGE_SLOTS, staticCopyEntries,
 isEditableText, isCmsImageSlot,
 type CmsLocale, type CmsPage, type CmsImageSlot
} from "@/lib/static-cms/schema";
import { cmsConfigured, isCmsAdmin, safeCmsOrigin } from "@/lib/static-cms/auth";
import { readCms, updateCms, persistCmsImage } from "@/lib/static-cms/store";
import { revalidatePath } from "next/cache";
export const runtime="nodejs";
export const dynamic="force-dynamic";

function deny(req:NextRequest,write=false):NextResponse|null {
 if(!cmsConfigured())return NextResponse.json({message:"CMS not configured"},{status:503});
 if(!isCmsAdmin(req))return NextResponse.json({message:"CMS sign-in required"},{status:401});
 if(write&&!safeCmsOrigin(req))return NextResponse.json({message:"Invalid origin"},{status:403});
 return null;
}
function refresh():void {
 for(const lang of ["ar","en"]){
   revalidatePath("/"+lang);
   for(const p of CMS_PAGES) revalidatePath("/"+lang+"/"+p);
 }
}
export async function GET(req:NextRequest){
 const error=deny(req);if(error)return error;
 const locale=req.nextUrl.searchParams.get("locale")==="en"?"en":"ar";
 const pageParam=req.nextUrl.searchParams.get("page")||"home";
 const page=(CMS_PAGES as readonly string[]).includes(pageParam)?pageParam as CmsPage:"home";
 return NextResponse.json({
  published:readCms(),
  defaults:Object.fromEntries(staticCopyEntries(locale,page).map(item=>[item.key.slice(page.length+1),item.value])),
  slots:CMS_IMAGE_SLOTS,
  page,locale
 },{headers:{"Cache-Control":"no-store"}});
}
export async function PATCH(req:NextRequest){
 const error=deny(req,true);if(error)return error;
 const input=await req.json().catch(()=>null);
 const locale=input?.locale as CmsLocale;
 const key=input?.key as string;
 const value=input?.value;
 if(!["ar","en"].includes(locale)||typeof key!=="string"||!isEditableText(locale,key)||
    typeof value!=="string"||value.length>1200||/[<>{}]/.test(value))
   return NextResponse.json({message:"Invalid static text key/value"},{status:422});
 const updated=updateCms(cms=>{
  if(!value.trim())delete cms.texts[locale][key];
  else cms.texts[locale][key]=value.trim();
 });
 refresh();
 return NextResponse.json({success:true,updatedAt:updated.updatedAt},{headers:{"Cache-Control":"no-store"}});
}
const MAX_UPLOAD_BODY=11*1024*1024;
/** Refuse chunked/forged oversized bodies before multipart parsing allocates them. */
async function parseLimitedForm(req:NextRequest):Promise<FormData> {
  const contentType=req.headers.get("content-type")||"";
  if(!contentType.startsWith("multipart/form-data;")||!req.body)throw new Error("Invalid multipart request");
  const reader=req.body.getReader();
  const parts:Uint8Array[]=[];
  let total=0;
  while(true){
    const result=await reader.read();
    if(result.done)break;
    total+=result.value.byteLength;
    if(total>MAX_UPLOAD_BODY){
      await reader.cancel().catch(()=>undefined);
      throw new Error("File too large");
    }
    parts.push(result.value);
  }
  const response=new Request("http://local.invalid",{
    method:"POST",headers:{"Content-Type":contentType},body:new Uint8Array(Buffer.concat(parts))
  });
  return response.formData();
}

export async function PUT(req:NextRequest){
 const error=deny(req,true);if(error)return error;
 const size=Number(req.headers.get("content-length")||0);
 if(size>MAX_UPLOAD_BODY)return NextResponse.json({message:"File too large"},{status:413});
 const data=await parseLimitedForm(req).catch(()=>null);
 const slot=data?.get("slot");
 const file=data?.get("image");
 const alt_ar=data?.get("alt_ar"),alt_en=data?.get("alt_en");
 if(typeof slot!=="string"||!isCmsImageSlot(slot)||
   !(file instanceof Blob) || file.size===0||file.size>10*1024*1024 ||
   !["image/jpeg","image/png","image/webp"].includes(file.type)||
   (typeof alt_ar!=="string" && alt_ar!==null)||(typeof alt_en!=="string"&&alt_en!==null)||
   String(alt_ar||"").length>180||String(alt_en||"").length>180)
   return NextResponse.json({message:"Invalid image or slot"},{status:422});
 try{
   const bytes=Buffer.from(await file.arrayBuffer());
   const photo=sharp(bytes,{limitInputPixels:40_000_000,failOn:"error"});
   const meta=await photo.metadata();
   if(!meta.width||!meta.height||meta.width<320||meta.height<240||
      !["jpeg","png","webp"].includes(meta.format||""))
     return NextResponse.json({message:"Invalid image content or dimensions"},{status:422});
   // Strip EXIF/GPS, normalize orientation, downsample to safe maximum dimensions.
   const output=await photo.rotate().resize(2400,1600,{fit:"inside",withoutEnlargement:true})
     .webp({quality:86,effort:4}).toBuffer();
   const url=persistCmsImage(slot,output);
   updateCms(cms=>{cms.images[slot]={src:url,alt_ar:String(alt_ar||"").trim(),alt_en:String(alt_en||"").trim()};});
   refresh();
   return NextResponse.json({success:true,url},{headers:{"Cache-Control":"no-store"}});
 }catch{
   return NextResponse.json({message:"Unable to process image"},{status:422});
 }
}
export async function POST(req:NextRequest){
 const error=deny(req,true);if(error)return error;
 const input=await req.json().catch(()=>null);
 const slot=input?.slot,alt_ar=input?.alt_ar,alt_en=input?.alt_en;
 if(typeof slot!=="string"||!isCmsImageSlot(slot)||
   typeof alt_ar!=="string"||typeof alt_en!=="string"||
   alt_ar.length>180||alt_en.length>180||/[<>]/.test(alt_ar+alt_en))
   return NextResponse.json({message:"Invalid alt description"},{status:422});
 if(!readCms().images[slot])return NextResponse.json({message:"Publish image first"},{status:404});
 updateCms(cms=>{
   if(!cms.images[slot])throw new Error("Image changed");
   cms.images[slot]={...cms.images[slot],alt_ar:alt_ar.trim(),alt_en:alt_en.trim()};
 });
 refresh();
 return NextResponse.json({success:true},{headers:{"Cache-Control":"no-store"}});
}

export async function DELETE(req:NextRequest){
 const error=deny(req,true);if(error)return error;
 const slot=req.nextUrl.searchParams.get("slot");
 const locale=req.nextUrl.searchParams.get("locale");
 const key=req.nextUrl.searchParams.get("key");
 if(slot&&isCmsImageSlot(slot)){
   updateCms(cms=>{delete cms.images[slot];});
 }else if((locale==="ar"||locale==="en")&&key&&isEditableText(locale,key)){
   updateCms(cms=>{delete cms.texts[locale][key];});
 }else return NextResponse.json({message:"Unknown CMS item"},{status:422});
 refresh();
 return NextResponse.json({success:true},{headers:{"Cache-Control":"no-store"}});
}
