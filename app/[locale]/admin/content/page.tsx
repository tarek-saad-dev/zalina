import { setRequestLocale } from "next-intl/server";
import { StaticCmsAdmin } from "@/components/static-cms/StaticCmsAdmin";
export const metadata = { title:"Zalina Mini CMS", robots:{index:false,follow:false} };
export default function ContentEditor({params}:{params:{locale:string}}){
 setRequestLocale(params.locale);
 return <StaticCmsAdmin uiLocale={params.locale}/>;
}
