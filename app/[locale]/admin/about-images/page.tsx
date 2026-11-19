import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
export default async function LegacyAboutImages(){
 const locale=await getLocale();
 redirect({href:"/admin/content?tab=images&page=about",locale});
}
