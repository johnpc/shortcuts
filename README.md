# Action Button Shortcut

iPhone Action Button shortcut that provides quick access to Camera and Home Assistant scripts.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `HOME_ASSISTANT_API_URL` - Your Home Assistant scripts API endpoint
- `LIGHTS_API_URL` - Your lights control API endpoint
- `S3_BUCKET`, `S3_REGION`, `S3_KEY_PREFIX` - AWS S3 configuration for deployment
- `FILE_HOST_URL` - Public URL for accessing uploaded shortcuts
- `TEXTBELT_API_KEY`, `TEXTBELT_PHONE` - (Optional) SMS notifications

## Build

```bash
npm run build
```

Creates `action-button-raw.shortcut` locally.

## Deploy

```bash
npm run deploy
```

Builds, signs, and uploads to S3, then outputs the download URL.

## Customization

Edit files in `shortcuts/action-button/` to modify functionality:
- `config.ts` - Script order and constants
- `lights.ts` - Light themes and controls
- `scripts.ts` - Home Assistant script actions
- `camera.ts` - Camera action

## Development

- `npm run build` - Build shortcut locally
- `npm run deploy` - Build, sign, and deploy to S3
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

Pre-commit hooks automatically lint and format code.
