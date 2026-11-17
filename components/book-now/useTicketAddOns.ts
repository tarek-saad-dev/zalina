"use client";
import { useEffect, useState } from "react";
import { getBookableTicketAddOns, type BookableTicketAddOn } from "@/lib/api";

export function useTicketAddOns(locale: "en" | "ar") {
  const [data, setData] = useState<{status: "loading" | "ready" | "error"; items: BookableTicketAddOn[]}>({status:"loading",items:[]});
  useEffect(() => {
    let cancelled = false;
    setData({status:"loading",items:[]});
    void getBookableTicketAddOns(locale).then((items) => {
      if (!cancelled) setData({status:"ready",items});
    }).catch(() => {
      if (!cancelled) setData({status:"error",items:[]});
    });
    return () => { cancelled = true; };
  }, [locale]);
  return data;
}
