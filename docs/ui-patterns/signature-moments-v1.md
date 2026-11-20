# Signature Moments v1

**PRESERVED: do not delete even when current Signature Moments section is redesigned**

This spare pattern preserves the production portrait coverflow at commit `bd65ba21562f9876dcf0599240f136c13cf35a9c`. It is not mounted on the homepage. The reference sources are `sections/home/SignatureMoments.tsx`, `sections/home/signatureMomentsLayout.ts`, `sections/home/__tests__/signatureMomentsLayout.test.ts`, the Signature Moments rules in `app/globals.css`, `messages/ar.json` and `messages/en.json` (`home.signatureMoments`), and `app/[locale]/page.tsx` (experiences API data).

## Usage

```tsx
import { SignatureMomentsV1 } from "@/components/patterns/signature-moments-v1/SignatureMomentsV1";

<SignatureMomentsV1
  cards={cards} // CatalogMediaCard[]: id, title, image, alt; optional subtitle and href
  fallback={{ id: "empty", title: "Welcome", image: "/image.jpg", alt: "Welcome" }}
  locale="en" // use "ar" for Arabic and RTL navigation
  defaultHref="/experiences"
  labels={{
    title: "Our moments", carouselAria: "Moments", navigateHint: "Use arrow keys",
    discover: "Discover", cardAria: title => `Discover ${title}`,
    showMomentAria: title => `Show ${title}`,
  }}
/>
```

Supply localized copy and fallback for each locale; item links override `defaultHref`. Invalid cards are filtered, at most nine are shown, and the fallback is used when none are valid. The pattern uses the existing locale-aware `Link`, `CmsImage`, Tailwind utilities, and site-wide `lux-container`, `lux-heading-lg`, `lux-section-compact`, `--lux-surface`, font variables and `--zalina-nav-height` (80px fallback). Keep those dependencies available when reusing it; the versioned stylesheet owns its coverflow rules and keyframes. The image component and locale-aware links retain their existing application configuration requirements.

## Contract

A centered portrait, recessed tilted cards, gold aura and ground, card CTA, and glass description panel form the composition. Desktop height follows the viewport below the navigation; short windows and tall desktop windows have separate sizing. Below 768px the stage and cards scale with viewport width and only adjacent cards show; widths 768–1449px show up to two neighbors on each side, wider screens up to three. The first three description words are highlighted and words animate in the reading direction.

The stage supports arrow keys, horizontal touch swipes and mouse dragging, plus side-card selection. Arabic reverses direction and uses Arabic typography. Autoplay advances every 3.5 seconds only while the stage is in view, the document is visible, motion is allowed, and there is no hover or focus; manual navigation permanently stops it for that mount. Reduced motion removes transitions and typing animation. The stage has carousel semantics, a focus hint and slide labels; manual changes are announced via the description panel. Vertical touch scrolling remains available. Multiple instances receive distinct accessibility IDs.
