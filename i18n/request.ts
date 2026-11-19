import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { unstable_noStore as noStore } from "next/cache";
import { readCms } from "@/lib/static-cms/store";
import { mergeCmsMessages, type CmsLocale } from "@/lib/static-cms/schema";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  noStore();
  return {
    locale,
    messages: mergeCmsMessages(locale as CmsLocale, readCms().texts[locale as CmsLocale]),
  };
});
