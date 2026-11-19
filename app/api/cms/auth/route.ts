import { NextRequest, NextResponse } from "next/server";
import {
 cmsConfigured, cmsLoginAllowed, cmsLoginAttempt, verifyCmsPassword,
 makeSession, isCmsAdmin, safeCmsOrigin, CMS_SESSION_COOKIE, CMS_COOKIE_SECONDS,
} from "@/lib/static-cms/auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
 return NextResponse.json({configured:cmsConfigured(),authenticated:isCmsAdmin(req)},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){
 if(!cmsConfigured())return NextResponse.json({message:"CMS is not configured on this server"},{status:503});
 if(!safeCmsOrigin(req))return NextResponse.json({message:"Invalid origin"},{status:403});
 if(!cmsLoginAllowed(req))return NextResponse.json({message:"Too many login attempts"},{status:429});
 const data=await req.json().catch(()=>null);
 const valid=verifyCmsPassword(data?.password);
 cmsLoginAttempt(req,valid);
 if(!valid)return NextResponse.json({message:"Incorrect CMS password"},{status:401,headers:{"Cache-Control":"no-store"}});
 const result=NextResponse.json({authenticated:true},{headers:{"Cache-Control":"no-store"}});
 result.cookies.set(CMS_SESSION_COOKIE,makeSession(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:CMS_COOKIE_SECONDS});
 return result;
}
export async function DELETE(req:NextRequest){
 if(!safeCmsOrigin(req))return NextResponse.json({message:"Invalid origin"},{status:403});
 const result=NextResponse.json({authenticated:false},{headers:{"Cache-Control":"no-store"}});
 result.cookies.set(CMS_SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});
 return result;
}
