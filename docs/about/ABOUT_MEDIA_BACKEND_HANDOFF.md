# Superseded — About media backend handoff

This document described a previous plan for handling hardcoded About photos via Laravel media admin APIs.

**New product decision:** Zalina has two independent sources of content:
1. Dynamic content and media from Laravel (experiences, zones, gallery, booking, availability, prices), which remain owned by Laravel.
2. Static marketing images and copy, managed by a **native Mini CMS on the frontend VPS**, not by Laravel.

The earlier About media API contract is **not required** and should not be implemented by the backend team for static content.

Current implementation and VPS activation instructions:
- [Zalina Mini CMS](../static-cms/README.md)
- Editor: /ar/admin/content
- Image ownership: 17 static slots, including all ten About page slots
- Public API-connected data continues through its existing Laravel endpoints.

This note intentionally replaces the obsolete backend upload specification to avoid duplicate implementations.
