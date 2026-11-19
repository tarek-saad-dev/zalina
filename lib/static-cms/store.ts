import "server-only";
import path from "node:path";
import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { emptyCms, type CmsPublished, type CmsImageSlot } from "./schema";

const FILE_NAME = "published.json";

export function cmsDirectory(): string | null {
  const dir = process.env.ZALINA_STATIC_CMS_DIR?.trim();
  // Never write content inside git source, /tmp, or a serverless ephemeral directory.
  if (!dir || !path.isAbsolute(dir) || dir === "/" || dir.startsWith("/tmp/") || dir.startsWith(process.cwd()+path.sep)) return null;
  return dir;
}
export function readCms(): CmsPublished {
  const dir = cmsDirectory();
  if (!dir) return emptyCms();
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir,FILE_NAME),"utf8")) as CmsPublished;
    if (raw.version !== 1 || typeof raw.texts?.ar !== "object" || typeof raw.texts?.en !== "object" || typeof raw.images !== "object")
      throw new Error("Invalid CMS file schema");
    return raw;
  } catch(error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyCms();
    throw error;
  }
}
export function updateCms(mutate: (data: CmsPublished) => void): CmsPublished {
  const dir = cmsDirectory();
  if (!dir) throw new Error("CMS persistent directory is not configured");
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  const data = readCms();
  mutate(data);
  data.version=1;
  data.updatedAt=new Date().toISOString();
  const tmp=path.join(dir, "."+FILE_NAME+"."+randomBytes(8).toString("hex")+".tmp");
  try {
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+"\n",{encoding:"utf8",mode:0o600,flag:"wx"});
    fs.renameSync(tmp,path.join(dir,FILE_NAME));
  } finally {
    if(fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
  return data;
}
export function cmsImagePath(filename: string) {
  const dir=cmsDirectory();
  if(!dir || !/^[a-z0-9-]{3,80}-[a-f0-9]{16}\.webp$/.test(filename)) return null;
  return path.join(dir,"media",filename);
}
export function persistCmsImage(slot: CmsImageSlot, bytes: Buffer): string {
  const dir=cmsDirectory();
  if(!dir) throw new Error("CMS storage unavailable");
  const folder=path.join(dir,"media");
  fs.mkdirSync(folder,{recursive:true,mode:0o700});
  const filename=slot.replace(/\./g,"-")+"-"+randomBytes(8).toString("hex")+".webp";
  fs.writeFileSync(path.join(folder,filename),bytes,{flag:"wx",mode:0o600});
  return "/api/cms/media/"+filename;
}
export function cmsImageUrls(): Record<string,string> {
  const result: Record<string,string> = {};
  for(const [key, image] of Object.entries(readCms().images)) {
    if(image?.src?.startsWith("/api/cms/media/")) result[key]=image.src;
  }
  return result;
}
