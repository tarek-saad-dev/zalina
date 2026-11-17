import { describe, expect, it } from "vitest";
import { normalizeDayUseProduct, buildDayUseBookingPayload } from "@/lib/api/adapters";
import { normalizeBookableTicketAddOns } from "@/lib/api/ticket-add-ons";
import { productsForTicketChoice, observatoryIsBookable } from "../ticketProducts";
import { PRODUCT_OPTIONS } from "../bookingSteps";
import { createInitialBookingState } from "../bookingStateFactory";
import { getDayUseBookingInput } from "../bookingSelectors";

const original = {id:7,slug:"day-use",name_en:"Day Use",name_ar:"استخدام يومي",price_per_guest:"150",currency:"EGP",is_active:true};
const obs = {id:8,slug:"observatory",name_en:"Observatory Experience",name_ar:"تجربة المرصد",price_per_guest:"250",currency:"EGP",is_active:true,ticket_category:"observatory_experience" as const};

describe("new ticket options, V2-compatible", () => {
  it("presents Day Use, Observatory Experience and disabled Cabin Stay", () => {
    expect(PRODUCT_OPTIONS.map((o)=>o.id)).toEqual(["day_use","observatory_experience","cabin_stay"]);
    expect(PRODUCT_OPTIONS.find((o)=>o.id==="cabin_stay")?.comingSoon).toBe(true);
  });
  it("treats old API products as Day Use; Observatory must be explicitly categorized", () => {
    const day=normalizeDayUseProduct(original);
    expect(day.ticket_category).toBe("day_use");
    expect(productsForTicketChoice([day],"observatory_experience")).toEqual([]);
    expect(observatoryIsBookable([day])).toBe(false);
  });
  it("does not double-charge Day Use when an Observatory package exists", () => {
    const products=[normalizeDayUseProduct(original),normalizeDayUseProduct(obs)];
    expect(productsForTicketChoice(products,"day_use").map((p)=>p.id)).toEqual([7]);
    expect(productsForTicketChoice(products,"observatory_experience").map((p)=>p.id)).toEqual([8]);
    expect(observatoryIsBookable(products)).toBe(true);
  });
  it("does not expose invalid Observatory options when another valid one enables the card", () => {
    const valid=normalizeDayUseProduct(obs);
    const invalidPrice={...valid,id:9,price_per_guest:"NaN"};
    const blankCurrency={...valid,id:10,currency:" "};
    const emptyPrice={...valid,id:11,price_per_guest:""};
    const negativePrice={...valid,id:12,price_per_guest:"-1"};
    const disabled={...valid,id:13,is_active:false};
    const invalidId={...valid,id:-1};
    const catalog=[valid,invalidPrice,blankCurrency,emptyPrice,negativePrice,disabled,invalidId];
    expect(observatoryIsBookable(catalog)).toBe(true);
    expect(productsForTicketChoice(catalog,"observatory_experience").map((p)=>p.id)).toEqual([8]);
    expect(observatoryIsBookable(catalog.slice(1))).toBe(false);
  });
  it("requires explicit is_active true on Observatory rows without changing old Day Use defaults", () => {
    expect(normalizeDayUseProduct({...original,is_active:undefined}).is_active).toBe(true);
    for (const flag of [undefined, null, false, "true", 1]) {
      const candidate=normalizeDayUseProduct({...obs,is_active:flag as boolean | undefined});
      expect(candidate.is_active).toBe(false);
      expect(observatoryIsBookable([candidate])).toBe(false);
    }
    expect(observatoryIsBookable([normalizeDayUseProduct(obs)])).toBe(true);
  });
  it("fails closed on unsupported / non-bookable Lantern catalog", () => {
    const lantern={id:21,code:"lantern",name_en:"Lantern",name_ar:"فانوس",price_per_guest:"25",currency:"EGP",is_active:true,checkout_enabled:true,supported_tickets:["day_use","observatory_experience"]};
    expect(normalizeBookableTicketAddOns({data:[lantern]})).toHaveLength(1);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,checkout_enabled:false}]})).toHaveLength(0);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,price_per_guest:"NaN"}]})).toHaveLength(0);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,price_per_guest:""}]})).toHaveLength(0);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,price_per_guest:"   "}]})).toHaveLength(0);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,supported_tickets:[]}]})).toHaveLength(0);
    expect(normalizeBookableTicketAddOns({data:[{...lantern,code:"other"}]})).toHaveLength(0);
  });
  it("leaves all existing Day Use payloads byte-shape compatible without Lantern", () => {
    const input={day_use_product_id:7,visit_date:"2099-12-12",guests:3,guest_name:"Guest",guest_email:"g@example.com",guest_phone:"2012345678"};
    expect(buildDayUseBookingPayload(input)).toEqual({product_type:"day_use",...input});
    expect(buildDayUseBookingPayload({...input,ticket_add_ons:[{id:21,quantity:3}]})).toEqual({product_type:"day_use",...input,ticket_add_ons:[{id:21,quantity:3}]});
    const state=createInitialBookingState();
    state.productType="day_use";state.ticketChoice="observatory_experience";state.lanternAddOnId=21;
    state.dayUse={productId:8,visitDate:"2099-12-12",guests:4};
    state.guest={name:"Guest",email:"g@example.com",phone:"2012345678"};
    const payload=getDayUseBookingInput(state);
    expect(payload?.day_use_product_id).toBe(8);
    expect(payload?.ticket_add_ons).toEqual([{id:21,quantity:4}]);
    expect(payload).not.toHaveProperty("add_ons");
  });
});
