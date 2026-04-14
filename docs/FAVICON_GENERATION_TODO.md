# Favicon Generation Requirements

## Current Issue
The current favicon configuration uses WebP format which is not universally supported by all browsers for favicons.

## Required Files

Generate the following files from `/public/brand/logo-icon.webp`:

### 1. ICO Format (Multi-resolution)
**File:** `/public/favicon.ico`
- Contains: 16x16, 32x32, 48x48 px
- Tool: Use online converter or ImageMagick

### 2. PNG Formats
**File:** `/public/brand/favicon-16x16.png`
- Size: 16x16 px
- Format: PNG

**File:** `/public/brand/favicon-32x32.png`
- Size: 32x32 px  
- Format: PNG

**File:** `/public/brand/favicon-48x48.png`
- Size: 48x48 px
- Format: PNG

### 3. Apple Touch Icon
**File:** `/public/brand/apple-touch-icon.png`
- Size: 180x180 px
- Format: PNG
- Required for iOS home screen

### 4. Android Chrome Icon
**File:** `/public/brand/android-chrome-192x192.png`
- Size: 192x192 px
- Format: PNG

**File:** `/public/brand/android-chrome-512x512.png`
- Size: 512x512 px
- Format: PNG

## Conversion Commands

### Using ImageMagick (if available):
```bash
# Convert to ICO
magick logo-icon.webp -define icon:auto-resize=16,32,48 favicon.ico

# Convert to PNG sizes
magick logo-icon.webp -resize 16x16 favicon-16x16.png
magick logo-icon.webp -resize 32x32 favicon-32x32.png
magick logo-icon.webp -resize 48x48 favicon-48x48.png
magick logo-icon.webp -resize 180x180 apple-touch-icon.png
magick logo-icon.webp -resize 192x192 android-chrome-192x192.png
magick logo-icon.webp -resize 512x512 android-chrome-512x512.png
```

### Using Online Tools:
- https://favicon.io/favicon-converter/
- https://realfavicongenerator.net/

## Next Steps
1. Generate all required favicon files
2. Place them in correct directories
3. Metadata configuration already updated in `src/app/layout.tsx`
