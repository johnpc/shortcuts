# Action Button Shortcut

iPhone Action Button shortcut that provides quick access to Camera and Home Assistant scripts.

## Setup

```bash
npm install
```

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

Edit `build-shortcut.ts` to add/remove scripts or change the API endpoint.

## Development

- `npm run build` - Build shortcut locally
- `npm run deploy` - Build, sign, and deploy to S3
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

Pre-commit hooks automatically lint and format code.
