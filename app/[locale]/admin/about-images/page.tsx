import { setRequestLocale } from "next-intl/server";
import { AboutMediaManager } from "@/components/admin/AboutMediaManager";
export const metadata = { robots: { index: false, follow: false }, title: "Zalina — About Images" };
type Props = { params: { locale: string } };
export default function AboutImagesAdmin({ params }: Props) {
  setRequestLocale(params.locale);
  return <AboutMediaManager locale={params.locale} />;
}
