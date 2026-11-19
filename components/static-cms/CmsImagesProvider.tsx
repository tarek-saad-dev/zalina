"use client";
import { createContext, useContext } from "react";
import type { CmsImageSlot, CmsImage, CmsLocale } from "@/lib/static-cms/schema";
const CmsImagesContext = createContext<Record<string,CmsImage>>({});
export function CmsImagesProvider({images,children}:{images:Record<string,CmsImage>;children:React.ReactNode}){
  return <CmsImagesContext.Provider value={images}>{children}</CmsImagesContext.Provider>;
}
export function useCmsImage(slot:CmsImageSlot,fallback:string):string {
  return useContext(CmsImagesContext)[slot]?.src || fallback;
}

export function useCmsAlt(slot:CmsImageSlot,locale:CmsLocale,fallback:string):string {
 const asset=useContext(CmsImagesContext)[slot];
 return (locale==="ar"?asset?.alt_ar:asset?.alt_en)?.trim() || fallback;
}
