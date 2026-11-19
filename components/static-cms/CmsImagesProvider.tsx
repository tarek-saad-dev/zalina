"use client";
import { createContext, useContext } from "react";
import type { CmsImageSlot } from "@/lib/static-cms/schema";
const CmsImagesContext = createContext<Record<string,string>>({});
export function CmsImagesProvider({images,children}:{images:Record<string,string>;children:React.ReactNode}){
  return <CmsImagesContext.Provider value={images}>{children}</CmsImagesContext.Provider>;
}
export function useCmsImage(slot:CmsImageSlot,fallback:string):string {
  return useContext(CmsImagesContext)[slot] || fallback;
}
