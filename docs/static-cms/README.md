# Zalina Mini CMS — static site content

A lightweight native editor for marketing text and hardcoded photos. Laravel-powered experiences, galleries, ticket pricing, availability, payments and booking data remain separate and untouched.

## Editor
- AR: /ar/admin/content
- EN: /en/admin/content
- Static copy: Home, About, Experiences, Zones, Gallery, Navigation, Footer and general UI translation namespaces; keys containing ICU variables are not editable.
- Static images: 17 named image slots. Images sourced from the Laravel API are never replaced.
- Select page, language, Text or Images, edit one item, Publish, or Restore original.
- Real JPG, PNG and WebP photos up to 10 MiB, optimized using Sharp to WebP; Arabic and English alt text.
- Public data is overridden on the next request. The original repository files are never changed by CMS edits.
- In Vercel Preview the editor shows a read-only/local image preview without saving. Native publishing works only after the VPS variables below are configured.

## Persistent data
- Environment variable ZALINA_STATIC_CMS_DIR must point to an absolute writable path outside the code, e.g. /var/lib/zalina-cms.
- Storage: published.json, previous version published.previous.json, and media/*.webp files.
- CMS files do not live inside the git checkout and survive ordinary deployments.
- Use one frontend instance/worker with local disk. For multi-instance deployment, introduce shared persistent object storage and cross-process transactional locking.

## VPS activation
1. Locate the actual frontend service on VPS; do not assume its name:
   systemctl list-units '*zalina*' --all
2. Create a persistent folder with owner of the Next.js service:
   sudo install -d -m 700 -o zalina -g zalina /var/lib/zalina-cms
3. Generate a random admin password and hash without putting password plaintext in command history:
   read -rsp 'New CMS password: ' CMS_PASS; echo
   CMS_HASH="$(printf %s "$CMS_PASS" | node -e 'const c=require("node:crypto"); let p="";process.stdin.on("data",x=>p+=x);process.stdin.on("end",()=>{const s=c.randomBytes(16).toString("hex");console.log("scrypt:"+s+":"+c.scryptSync(p,s,64).toString("hex"));})')"
   unset CMS_PASS
   CMS_SECRET="$(openssl rand -hex 32)"
4. Create a private systemd environment file such as /etc/zalina/cms.env, root owned with mode 600. Include:
   ZALINA_STATIC_CMS_DIR=/var/lib/zalina-cms
   ZALINA_CMS_PASSWORD_HASH= [replace with actual CMS_HASH value]
   ZALINA_CMS_SESSION_SECRET= [replace with actual CMS_SECRET value]
   ZALINA_CMS_ORIGIN=https://zalinaarabianvillage.com
5. Set an EnvironmentFile override on the *actual* Zalina frontend systemd service, then daemon-reload and restart. The running service user requires read/write permissions on /var/lib/zalina-cms. Do not put secrets in GitHub or Vercel Preview.
6. Open /ar/admin/content, sign in using admin password, choose an image/text item, publish and verify its public page.
7. Back up the whole directory regularly; include media files and last-version JSON. A new deployment must not remove this path.

## Security
- Password stored as scrypt salt+hash, never in git or client.
- Signed HMAC SHA-256 session with HttpOnly, Secure production, SameSite Strict, 8-hour expiration.
- Login throttled after repeated failures, admin API requires cookie and same-site Origin on modifications.
- Only explicit static text keys and slots are editable. Static copy cannot contain tags or ICU braces.
- Images limited to 10 MiB and JPEG/PNG/WebP, with decoded pixel limits, EXIF/GPS stripped, generated versioned filenames.
- Image reads are public; modifications require admin authentication.
- CMS is disabled when filesystem path or secrets are missing. No publicly writable upload API.
- Test login failure, CSRF/Origin, image validation, backup and restore, persistence after deployment, AR/EN copy isolation, and unchanged booking API.

## Scope
CMS image slots currently include Home hero/day/night; all ten About placements; Experiences hero; Zones hero; Gallery hero/CTA. More literal image locations can be added to the registry as needed. Content retrieved from Laravel should remain owned by Laravel and never be mixed with this static CMS.
