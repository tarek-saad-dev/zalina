import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { cmsDirectory } from "./store";

const COOKIE = "zalina_cms_session";
const LIFETIME_MS = 8 * 60 * 60 * 1000;
const failed = new Map<string,{count:number,until:number}>();

export function cmsConfigured(): boolean {
  const hash=process.env.ZALINA_CMS_PASSWORD_HASH || "";
  const secret=process.env.ZALINA_CMS_SESSION_SECRET || "";
  return !!cmsDirectory() && /^scrypt:[a-f0-9]{32,}:[a-f0-9]{128}$/.test(hash) && secret.length>=32;
}
export function verifyCmsPassword(input:string): boolean {
  if(!cmsConfigured()||typeof input!=="string"||input.length>256)return false;
  const [,salt,expectedHex]=(process.env.ZALINA_CMS_PASSWORD_HASH || "").split(":");
  const candidate=scryptSync(input,salt,64);
  const expected=Buffer.from(expectedHex,"hex");
  return candidate.length===expected.length && timingSafeEqual(candidate,expected);
}
function sign(part:string):string {
  return createHmac("sha256",process.env.ZALINA_CMS_SESSION_SECRET || "").update(part).digest("base64url");
}
export function makeSession(): string {
  if(!cmsConfigured())throw new Error("CMS not configured");
  const data=Buffer.from(JSON.stringify({exp:Date.now()+LIFETIME_MS,nonce:randomBytes(16).toString("hex")})).toString("base64url");
  return data+"."+sign(data);
}
function validSession(token:string|undefined):boolean {
  if(!cmsConfigured()||!token)return false;
  const [data,mac,...extra]=token.split(".");
  if(!data||!mac||extra.length)return false;
  const expected=Buffer.from(sign(data));
  const got=Buffer.from(mac);
  if(expected.length!==got.length||!timingSafeEqual(expected,got))return false;
  try{
    const parsed=JSON.parse(Buffer.from(data,"base64url").toString("utf8"));
    return Number.isFinite(parsed.exp)&&parsed.exp>Date.now()&&parsed.exp<Date.now()+LIFETIME_MS+1000;
  }catch{return false;}
}
export function isCmsAdmin(req:NextRequest): boolean {
  return validSession(req.cookies.get(COOKIE)?.value);
}
export const CMS_SESSION_COOKIE = COOKIE;
export const CMS_COOKIE_SECONDS = LIFETIME_MS/1000;
export function safeCmsOrigin(req:NextRequest):boolean {
  const origin=req.headers.get("origin");
  const expected=process.env.ZALINA_CMS_ORIGIN?.trim() || req.nextUrl.origin;
  return Boolean(origin && origin === expected);
}
export function cmsLoginAllowed(req:NextRequest):boolean {
  const key=(req.headers.get("x-real-ip")||"unknown").slice(0,120);
  const now=Date.now(),last=failed.get(key);
  if(last&&last.until>now&&last.count>=8)return false;
  return true;
}
export function cmsLoginAttempt(req:NextRequest,success:boolean):void {
  const key=(req.headers.get("x-real-ip")||req.ip||"unknown").slice(0,120);
  if(success){failed.delete(key);return;}
  const now=Date.now(),last=failed.get(key),counter=last&&last.until>now?last.count+1:1;
  failed.set(key,{count:counter,until:now+10*60*1000});
  if(failed.size>500)failed.clear();
}
