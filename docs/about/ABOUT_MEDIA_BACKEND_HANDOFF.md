# About page images — Backend integration specification

The frontend has been implemented on PR #20 with an editor at /ar/admin/about-images and /en/admin/about-images. Users can select real photos and preview them locally. **Publishing is not operational until Backend completes this contract**. The frontend never accepts anonymous uploads or stores user files in Next.js.

## The 10 supported slots
| ID | Location | Aspect recommendation |
| --- | --- | --- |
| hero | Hero background | 16:9 |
| story.primary | About story, large photo | 4:5 |
| story.secondary | About story, overlay photo | 4:5 |
| pillars.heritage | Heritage card | 3:4 |
| pillars.atmosphere | Atmosphere card | 3:4 |
| pillars.celebration | Celebration card | 3:4 |
| stories | Immersive stories | 4:5 |
| difference.night | Night image | 4:5 |
| difference.day | Day image | 4:5 |
| cta | Final full-width CTA | 16:9 |

All crop with object-cover and may be cropped differently on desktop/mobile. Avoid essential subjects near edges.

## Public endpoint
GET /api/v1/pages/about/media — no login, published assets only:
~~~json
{
  "success": true,
  "data": {
    "slots": {
      "hero": {
        "url": "https://api.zalinaarabianvillage.com/storage/about/hero-v1.webp",
        "alt_ar": "واجهة زالينا وقت الغروب",
        "alt_en": "Zalina at sunset"
      },
      "story.primary": {
        "url": "https://api.zalinaarabianvillage.com/storage/about/story-main-v1.webp",
        "alt_ar": "ساحات زالينا",
        "alt_en": "Zalina courtyards"
      }
    }
  }
}
~~~
Omit unset slots; frontend falls back to current assets. The frontend currently caches the public response for up to 60 seconds. Generate versioned URLs per replacement.

Allowed image URLs are same-site /assets/, /storage/, /media/, or HTTPS on api.zalinaarabianvillage.com. If a different CDN is needed, add its exact domain to Next image remotePatterns and the URL validator before publishing any URLs there.

## Admin endpoints
All endpoints below **must be authenticated, require manage_page_media permission, and validate CSRF server-side**. Unauthorized users should receive JSON 401 or 403, not an HTML redirect.

GET /api/v1/admin/pages/about/media
- 200 with same slots response as public endpoint, cache-control no-store
- 401/403 for non-admin/anonymous users

PUT /api/v1/admin/pages/about/media/{slot_id}
- multipart/form-data image (File), alt_ar (optional max 180), alt_en (optional max 180)
- uploads, transforms, atomically assigns and publishes a new image for the requested slot
- 200 JSON success envelope with updated slot info
- 422 invalid file/slot, 413 oversized, 401/403 permission errors
- Validate **actual file MIME and content** (JPEG, PNG, WebP, maximum 10 MiB), image pixel count/dimensions, image path, safe filename, no dangerous metadata
- Normalize orientation, strip EXIF/GPS, optimize encoding, generate unique versioned filenames, and record the admin identity and time
- Use a transactional swap: only mark a slot published after its processed file is safely stored; keep previous asset version for rollback
- Rate-limit uploads, reject CSRF failures, reject untrusted Origin, enforce permissions independently of frontend

DELETE /api/v1/admin/pages/about/media/{slot_id}
- same auth/CSRF requirements
- unassigns custom image and restores frontend fallback, does not delete media used elsewhere
- 200 success envelope with audit log

## Auth + frontend proxy
- Browser talks only to /api/about-media-admin (Next dedicated narrow proxy).
- Next relays session Cookie + X-XSRF-TOKEN/X-CSRF-TOKEN to the Laravel API only for GET, PUT, DELETE on allowed slot IDs.
- The proxy checks same-Origin on writes, blocks unexpected paths, limits request bytes to 11 MiB, and does NOT grant permissions.
- Backend must provide secure login/session: Secure, HttpOnly session cookie, suitable SameSite setting, domain scope that reaches the frontend origin. Admin API verifies CSRF tokens.
- Do not expose permanent admin tokens in frontend or use unsigned public cloud upload presets.
- Backend administrator login flow must be available before enabling publishing for actual users.

## Acceptance tests
1. Anonymous/non-admin -> admin GET/PUT/DELETE 401/403, public GET 200.
2. Admin uploads JPG, PNG, WebP to each of ten slots; correct images appear in /ar/about and /en/about.
3. Locale-specific ALT text saved and displayed, same image per locale.
4. Corrupted files, >10 MiB, invalid slots, invalid CSRF rejected without modifying published version.
5. Overwriting uses a versioned URL and avoids stale image cache.
6. Rollback via DELETE restores the old in-repo fallback for that slot only.
7. Session expiry disables frontend Publish button; no anonymous uploads.
8. Page and editor remain responsive with long Arabic/English ALT labels.

## Before Backend API is connected
Upload local files into the editor to preview the placements, but **Publish is disabled** until admin authentication and API exist. Alternatively share the photos in the project conversation so a developer can set them as local frontend assets now. Do not mistake local preview for publication.
