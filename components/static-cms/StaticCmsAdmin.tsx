"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CMS_PAGES, CMS_IMAGE_SLOTS, type CmsLocale, type CmsPage, type CmsPublished, type CmsImageSlot, emptyCms } from "@/lib/static-cms/schema";
import { LockKeyhole, ImagePlus, FileText, Search, RefreshCcw, LogOut, Check, UploadCloud } from "lucide-react";

const PAGE_LABELS:Record<CmsPage,{ar:string;en:string}>={
  home:{ar:"الرئيسية",en:"Home"}, about:{ar:"عن زالينا",en:"About"},
  experiences:{ar:"التجارب",en:"Experiences"},zones:{ar:"المناطق",en:"Zones"},
  gallery:{ar:"المعرض",en:"Gallery"},weddings:{ar:"حفلات الزفاف",en:"Weddings"},
};
type View="texts"|"images";
type AuthState="loading"|"login"|"ready"|"disabled";
function cssButton(active:boolean){
  return "rounded-lg border px-4 py-2.5 text-sm transition "+(active?"border-[#D4AF37] bg-[#D4AF37]/15 text-[#F8E6B7]":"border-white/15 text-white/65 hover:border-[#D4AF37]/40");
}
export function StaticCmsAdmin({uiLocale}:{uiLocale:string}){
 const arabic=uiLocale==="ar";
 const [auth,setAuth]=useState<AuthState>("loading");
 const [password,setPassword]=useState("");
 const [page,setPage]=useState<CmsPage>("home");
 const [locale,setLocale]=useState<CmsLocale>("ar");
 const [view,setView]=useState<View>("texts");
 const [defaults,setDefaults]=useState<Record<string,string>>({});
 const [published,setPublished]=useState<CmsPublished>(emptyCms());
 const [inputs,setInputs]=useState<Record<string,string>>({});
 const [alts,setAlts]=useState<Record<string,{ar:string;en:string}>>({});
 const [imagePreviews,setImagePreviews]=useState<Record<string,string>>({});
 const [selectedFiles,setSelectedFiles]=useState<Record<string,File>>({});
 const previewRef=useRef<Record<string,string>>({});
 const [busy,setBusy]=useState("");
 const [notice,setNotice]=useState("");
 const [search,setSearch]=useState("");
 const [limit,setLimit]=useState(35);
 const t=(a:string,e:string)=>arabic?a:e;

 useEffect(()=>{void fetch("/api/cms/auth",{cache:"no-store"}).then(x=>x.json()).then(x=>
   setAuth(x.authenticated?"ready":x.configured?"login":"disabled")
 ).catch(()=>setAuth("disabled"));return ()=>{Object.values(previewRef.current).forEach(URL.revokeObjectURL);};},[]);

 const load=useCallback(async()=>{
   const res=await fetch("/api/cms/manage?locale="+locale+"&page="+page,{credentials:"same-origin",cache:"no-store"});
   if(res.status===401){setAuth("login");return;}
   if(!res.ok)throw new Error(t("تعذر تحميل المحتوى","Could not load CMS content"));
   const data=await res.json();
   setDefaults(data.defaults||{});
   setPublished(data.published||emptyCms());
   const merged:Record<string,string>={};
   for(const [key,val] of Object.entries(data.defaults||{}) as [string,string][])
     merged[page+"."+key]=data.published?.texts?.[locale]?.[page+"."+key]||val;
   setInputs(merged);
   setAlts(Object.fromEntries(Object.entries(data.published?.images||{}).map(([k,v])=>{
      const img=v as {alt_ar?:string;alt_en?:string};
      return [k,{ar:img.alt_ar||"",en:img.alt_en||""}];
   })));
 },[page,locale,arabic]);
 useEffect(()=>{if(auth==="ready")void load().catch(err=>setNotice(err.message));},[auth,load]);

 async function login(event:FormEvent){
   event.preventDefault();setBusy("login");setNotice("");
   try{
     const res=await fetch("/api/cms/auth",{method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
     const body=await res.json().catch(()=>({}));
     if(!res.ok)throw new Error(body.message||t("بيانات الدخول غير صحيحة","Sign-in failed"));
     setPassword("");setAuth("ready");
   }catch(err){setNotice(err instanceof Error?err.message:String(err));}finally{setBusy("");}
 }
 async function logout(){
   await fetch("/api/cms/auth",{method:"DELETE",credentials:"same-origin"});
   setAuth("login");setPublished(emptyCms());setNotice("");
 }
 async function saveText(key:string){
   setBusy(key);setNotice("");
   try{
    const res=await fetch("/api/cms/manage",{
      method:"PATCH",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({locale,key,value:inputs[key]||""}),
    });
    if(!res.ok)throw new Error((await res.json().catch(()=>({}))).message||"Request failed");
    await load();
    setNotice(t("تم نشر التعديل بنجاح","Content published successfully"));
   }catch(err){setNotice(err instanceof Error?err.message:String(err));}finally{setBusy("");}
 }
 function selectImage(slot:CmsImageSlot,file:File|undefined){
   if(!file)return;
   if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10*1024*1024){
     setNotice(t("استخدم JPG أو PNG أو WebP بحجم أقل من 10 ميجا","Use JPG, PNG or WebP under 10 MB"));return;
   }
   if(previewRef.current[slot])URL.revokeObjectURL(previewRef.current[slot]);
   const url=URL.createObjectURL(file);previewRef.current[slot]=url;
   setSelectedFiles(current=>({...current,[slot]:file}));
   setImagePreviews(current=>({...current,[slot]:url}));
   setNotice(t("تمت معاينة الصورة على جهازك، اضغط نشر لحفظها","Local preview ready; select Publish to save"));
 }
 function clearPreview(slot:string){
   if(previewRef.current[slot])URL.revokeObjectURL(previewRef.current[slot]);
   delete previewRef.current[slot];
   setSelectedFiles(current=>{const v={...current};delete v[slot];return v;});
   setImagePreviews(current=>{const v={...current};delete v[slot];return v;});
 }
 async function saveImage(slot:CmsImageSlot,restore=false){
   const file=selectedFiles[slot];
   if(!restore&&!file)return;
   setBusy(slot);setNotice("");
   try{
    const form=new FormData();
    if(!restore){
     if(!file)return;
     form.set("slot",slot);form.set("image",file);
     form.set("alt_ar",alts[slot]?.ar||"");form.set("alt_en",alts[slot]?.en||"");
    }
    const res=await fetch("/api/cms/manage"+(restore?"?slot="+encodeURIComponent(slot):""),{
      method:restore?"DELETE":"PUT",credentials:"same-origin",body:restore?undefined:form,
    });
    if(res.status===401){setAuth("login");throw new Error(t("انتهت الجلسة، سجل الدخول","Session expired"));}
    if(!res.ok)throw new Error((await res.json().catch(()=>({}))).message||"Upload failed");
    clearPreview(slot);
    await load();setNotice(t("تم نشر صورة الموقع","Site image published"));
   }catch(err){setNotice(err instanceof Error?err.message:String(err));}finally{setBusy("");}
 }
 const entries=useMemo(()=>Object.entries(defaults).map(([key,fallback])=>{
   const full=page+"."+key;return {key:full,label:key,original:fallback,now:inputs[full]??fallback,modified:published.texts?.[locale]?.[full]};
 }).filter(x=>(x.key+" "+x.now+" "+x.original).toLocaleLowerCase().includes(search.toLocaleLowerCase())),[page,defaults,inputs,published,locale,search]);
 const slots=CMS_IMAGE_SLOTS.filter(x=>x.page===page);
 const fieldClass="w-full rounded-lg border border-[#D4AF37]/20 bg-[#100E0B] px-3 py-2.5 text-[14px] leading-7 text-[#F4ECDD] outline-none focus:border-[#D4AF37]/70";
 return <main dir={arabic?"rtl":"ltr"} className="min-h-screen bg-[#090807] px-4 pb-20 pt-32 text-[#F5EDDE] sm:px-8">
  <div className="mx-auto max-w-6xl">
   <div className="mb-8 border-b border-[#D4AF37]/20 pb-6">
    <div className="mb-2 text-xs tracking-[0.2em] text-[#D4AF37]">ZALINA / MINI CMS</div>
    <h1 className="text-3xl font-semibold sm:text-4xl" style={{fontFamily:arabic?"var(--font-body-ar),sans-serif":"var(--font-display),serif"}}>
     {t("إدارة محتوى الموقع","Website content manager")}
    </h1>
    <p className="mt-3 text-sm leading-7 text-white/55">{t(
      "عدّل الصور والنصوص الثابتة من هنا. أسعار وتوافر وحجوزات الـ Backend مش بتتعدل من الصفحة دي.",
      "Edit static photos and marketing copy. Booking, availability and backend catalog content stay separate."
    )}</p>
   </div>
   {notice&&<div role="status" className="mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#201A12] p-3 text-sm">{notice}</div>}
   {auth==="loading"&&<p>{t("جاري التحميل…","Loading…")}</p>}
   {auth==="disabled"&&<div className="rounded-xl border border-[#D4AF37]/30 p-6 leading-8">
    {t("الـ CMS جاهز للربط، لكن إعدادات الحفظ وكلمة مرور المدير مش موجودة على السيرفر. تفعيلها موضح في مستند إعداد الـ VPS.",
      "CMS preview is installed, but the persistent storage and admin secrets are not configured on this server. See deployment instructions.")}
   </div>}
   {auth==="login"&&<form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-[#D4AF37]/25 bg-[#17130E] p-7">
    <LockKeyhole className="mb-5 text-[#D4AF37]" size={30}/>
    <h2 className="mb-5 text-xl">{t("دخول المدير","Administrator sign-in")}</h2>
    <input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)}
      required placeholder={t("كلمة مرور الـ CMS","CMS password")} className={fieldClass}/>
    <button type="submit" disabled={busy==="login"} className="mt-4 w-full rounded-lg bg-[#D4AF37] px-5 py-3 font-semibold text-black disabled:opacity-50">
     {t("دخول","Sign in")}
    </button>
   </form>}
   {auth==="ready"&&<>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
       {CMS_PAGES.map(p=><button key={p} onClick={()=>{setPage(p);setLimit(35);setSearch("");}} className={cssButton(page===p)}>
        {PAGE_LABELS[p][arabic?"ar":"en"]}</button>)}
      </div>
      <button type="button" onClick={()=>void logout()} className="flex items-center gap-2 text-xs text-[#E9C98C]"><LogOut size={15}/>{t("خروج","Logout")}</button>
    </div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
     <div className="flex gap-2">
      <button onClick={()=>setView("texts")} className={cssButton(view==="texts")}><span className="inline-flex items-center gap-2"><FileText size={15}/>{t("النصوص","Text")}</span></button>
      <button onClick={()=>setView("images")} className={cssButton(view==="images")}><span className="inline-flex items-center gap-2"><ImagePlus size={15}/>{t("الصور","Images")}</span></button>
     </div>
     <div className="flex gap-2">
      <button className={cssButton(locale==="ar")} onClick={()=>setLocale("ar")}>العربي</button>
      <button className={cssButton(locale==="en")} onClick={()=>setLocale("en")}>English</button>
     </div>
    </div>
    {view==="texts"&&<>
     <label className="mb-6 flex items-center gap-2 rounded-xl border border-white/15 px-4"><Search size={18} className="text-white/40"/>
      <input value={search} onChange={e=>{setSearch(e.target.value);setLimit(35);}} placeholder={t("ابحث عن عنوان أو نص","Search by text or field")}
       className="w-full bg-transparent py-3 text-sm outline-none"/>
     </label>
     <div className="grid gap-4 md:grid-cols-2">
      {entries.slice(0,limit).map(item=>{
       const changed=(inputs[item.key]??item.original)!==item.original;
       const needsSave=(inputs[item.key]??item.original)!==(item.modified??item.original);
       return <section key={item.key} className="rounded-xl border border-[#D4AF37]/15 bg-[#17130F] p-5">
        <div className="mb-2 break-all font-mono text-xs text-[#D4AF37]/80">{item.label}</div>
        <label className="mb-2 block text-xs text-white/45">{t("النص المنشور","Editable published copy")}</label>
        <textarea dir={locale==="ar"?"rtl":"ltr"} rows={item.now.length>100?4:2} maxLength={1200}
          value={inputs[item.key]??item.original}
          onChange={e=>setInputs(v=>({...v,[item.key]:e.target.value}))} className={fieldClass}/>
        <div className="mt-3 flex flex-wrap gap-2">
         <button disabled={!needsSave||!!busy} onClick={()=>void saveText(item.key)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-35"><Check size={15}/>{t("نشر التعديل","Publish")}</button>
         <button disabled={!changed||!!busy} onClick={()=>void restoreText(item.key)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/75 disabled:opacity-35"><RefreshCcw size={15}/>{t("الأصل","Restore")}</button>
        </div>
       </section>;
      })}
     </div>
     {entries.length>limit&&<button className="mt-6 rounded-lg border border-[#D4AF37]/30 px-6 py-3 text-sm" onClick={()=>setLimit(v=>v+35)}>
       {t("عرض المزيد","Load more")} ({entries.length-limit})
     </button>}
     {entries.length===0&&<p className="py-10 text-center text-white/45">{t("مفيش نتائج","No matches")}</p>}
    </>}
    {view==="images"&&<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {slots.length===0&&<div className="rounded-xl border border-white/15 p-6 text-sm text-white/60">
       {t("الصفحة دي نصوصها ثابتة، وصورها بتتحدد من الـ Backend أو لسه مفيهاش صور ثابتة مخصصة.", "This page has no independent static photo slots; catalog images remain backend-managed.")}
      </div>}
      {slots.map(slot=>{
       const id=slot.id,preview=imagePreviews[id],asset=published.images[id],picture=preview||asset?.src||slot.fallback;
       return <section key={id} className="overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#17130F]">
        <div className="relative aspect-[4/3] bg-black">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img alt={slot[arabic?"ar":"en"]} src={picture} className="h-full w-full object-cover"/>
         {preview&&<span className="absolute bottom-3 start-3 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold text-black">{t("معاينة محلية","Local preview")}</span>}
        </div>
        <div className="space-y-3 p-4">
         <h2 className="font-semibold">{slot[arabic?"ar":"en"]}</h2>
         <p className="font-mono text-[11px] text-[#D4AF37]/70">{id}</p>
         <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>selectImage(id,e.target.files?.[0])}
          className="w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs file:me-3 file:rounded-md file:border-0 file:bg-[#D4AF37]/20 file:px-3 file:py-1.5 file:text-[#F4ECDD]"/>
         <input className={fieldClass} dir="rtl" maxLength={180} placeholder="وصف الصورة بالعربي" value={alts[id]?.ar||""}
          onChange={e=>setAlts(x=>({...x,[id]:{...(x[id]||{ar:"",en:""}),ar:e.target.value}}))}/>
         <input className={fieldClass} dir="ltr" maxLength={180} placeholder="English alt text" value={alts[id]?.en||""}
          onChange={e=>setAlts(x=>({...x,[id]:{...(x[id]||{ar:"",en:""}),en:e.target.value}}))}/>
         <div className="flex gap-2">
          <button disabled={!selectedFiles[id]||!!busy} onClick={()=>void saveImage(id)}
           className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] text-sm font-semibold text-black disabled:opacity-35">
           <UploadCloud size={16}/>{t("نشر الصورة","Publish image")}</button>
          <button disabled={!asset||!!busy} onClick={()=>void saveImage(id,true)}
           className="min-h-11 rounded-lg border border-white/20 px-3 text-xs text-white/70 disabled:opacity-35">{t("الأصل","Restore")}</button>
         </div>
        </div>
       </section>;
      })}
    </div>}
    <p className="mt-8 text-xs leading-7 text-white/35">{t(
     "أي تعديل منشور بيظهر في الموقع مباشرة عند فتح الصفحة من جديد. محتوى الحجوزات والأسعار والصور المرتبطة بالـ API خارج الـ CMS ده.",
     "Published changes appear on the next page request. Booking and API-connected catalog media are not edited here."
    )}</p>
   </>}
  </div>
 </main>;

 async function restoreText(key:string){
   setBusy(key);setNotice("");
   try{
     const url="/api/cms/manage?locale="+encodeURIComponent(locale)+"&key="+encodeURIComponent(key);
     const res=await fetch(url,{method:"DELETE",credentials:"same-origin"});
     if(!res.ok)throw new Error((await res.json().catch(()=>({}))).message||"Could not restore");
     await load();setNotice(t("تم استرجاع النص الأصلي","Original text restored"));
   }catch(err){setNotice(err instanceof Error?err.message:String(err));}finally{setBusy("");}
 }
}
