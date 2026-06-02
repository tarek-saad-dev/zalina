# Image Assets

Place the following images in this `/public/images/` folder:

## Required Images for Hero Section

### 1. zalina-hero-bg.png
**Main hero background image**
- A luxurious Arabian village/resort at night
- Symmetrical composition with central architectural gate/building
- Water reflecting pool in foreground
- Illuminated palm trees on both sides
- Warm golden lantern lighting
- Rich dark night sky with subtle stars
- Highly atmospheric and premium quality
- Recommended: 1920x1080px minimum, 16:9 aspect ratio

### 2. zalina-logo-full.png
**Logo for navbar**
- The Zalina Arabian Village logo lockup
- PNG with transparency preferred
- Should include the emblem + wordmark
- Size: At least 200x200px for retina displays
- Appears in the top-left of the navbar

### 3. zalina-watermark.png
**Large decorative watermark**
- The same emblem/logo but designed for background use
- Large size: at least 800x800px
- Works well with transparency/blending
- This appears as a subtle, atmospheric branding layer behind the architecture
- Should be the main brand emblem (the arched illustration)

## Visual Treatment

The watermark is displayed with:
- Very low opacity (12%)
- `mix-blend-soft-light` blend mode
- Centered in the composition
- Large scale (90vw, max 1200px)
- Creates an integrated, mural-like background effect

## Asset Placement

```
public/
  images/
    zalina-hero-bg.png      ← Night scene background
    zalina-logo-full.png    ← Navbar logo
    zalina-watermark.png    ← Background watermark
```
