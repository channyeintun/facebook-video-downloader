# ESLint Baseline Configuration

This document explains the ESLint baseline configuration for the Facebook Video Downloader project.

## What is eslint-plugin-baseline-js?

`eslint-plugin-baseline-js` is an ESLint plugin that helps enforce JavaScript baseline compatibility by checking if your code uses features that are widely supported across browsers. It helps you write more compatible JavaScript code that works across different environments.

## Configuration

The plugin is configured in `eslint.config.mjs`:

```javascript
{
  plugins: {
    "baseline-js": baselinePlugin,
  },
  rules: {
    "baseline-js/use-baseline": [
      "warn",
      {
        baseline: "widely", // Use widely supported features
        includeWebApis: true, // Also check Web APIs
        includeJsBuiltins: true, // Check JavaScript built-ins
        ignoreFeatures: ["atomics-wait-async"], // We handle this with runtime detection
      },
    ],
  },
}
```

## Baseline Setting: "widely"

We use the `"widely"` baseline, which enforces features that are:
- Supported in all major browsers
- Part of the Baseline Widely Available specification
- Generally safe to use without polyfills in production

## Ignored Features

### Atomics.waitAsync

We explicitly ignore the `atomics-wait-async` feature because:
1. We use it for multi-threaded FFmpeg processing with SharedArrayBuffer
2. We have runtime detection via `checkSharedArrayBufferSupport()`
3. We provide automatic fallback to single-threaded mode when not supported
4. This allows us to use cutting-edge features while maintaining compatibility

```typescript
// lib/ffmpeg.ts
export const checkSharedArrayBufferSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof SharedArrayBuffer === 'undefined') return false;
  if (!crossOriginIsolated) return false;
  if (typeof Atomics === 'undefined' || typeof Atomics.waitAsync === 'undefined') {
    return false;
  }
  return true;
};
```

## NPM Scripts

### `npm run lint`
Runs ESLint on the entire codebase with the baseline plugin enabled:
```bash
npm run lint
```

### `npm run lint:baseline`
Runs ESLint with auto-fix for fixable issues:
```bash
npm run lint:baseline
```

### `npm run baseline:generate`
Generates or updates the baseline for your project:
```bash
npm run baseline:generate
```

### `npm run baseline:update`
Updates the existing baseline (alias for generate):
```bash
npm run baseline:update
```

## Current Lint Status

✅ **0 errors, 0 warnings**

All TypeScript strict mode checks pass, and the code follows best practices for browser compatibility.

## Benefits

1. **Browser Compatibility**: Ensures features used are widely supported
2. **Type Safety**: Combined with TypeScript for full type checking
3. **Future-proof**: Allows intentional use of modern features with proper detection
4. **Documentation**: Self-documenting code - ignored features are explicitly listed
5. **CI/CD Ready**: Can be integrated into build pipelines to prevent compatibility regressions

## Customization

You can customize the baseline level:

- `"widely"`: Features supported across all major browsers (default, recommended)
- `"newly"`: Recently standardized features (less conservative)
- `2020`: Specific ECMAScript year (e.g., ES2020)

Example:
```javascript
"baseline-js/use-baseline": [
  "warn",
  {
    baseline: "newly", // Use more modern features
    includeWebApis: false, // Don't check Web APIs
  },
]
```

## Integration with Next.js ESLint

The baseline plugin works alongside Next.js's built-in ESLint rules:
- Next.js rules enforce Next.js best practices
- Baseline rules enforce browser compatibility
- Together they ensure both framework and platform compatibility

## Troubleshooting

### False Positives

If the baseline plugin warns about a feature you intentionally use with proper detection/polyfilling:

1. Add it to `ignoreFeatures`:
   ```javascript
   ignoreFeatures: ["feature-name", "another-feature"]
   ```

2. Or disable for specific lines:
   ```javascript
   // eslint-disable-next-line baseline-js/use-baseline
   const result = await someModernAPI();
   ```

### Finding Feature Names

When the plugin warns about a feature, it will show the feature identifier in the error message:
```
warning: Feature 'atomics-wait-async' (atomics-wait-async) is not a widely available Baseline feature
```

Use this identifier in `ignoreFeatures`.

## Resources

- [eslint-plugin-baseline-js on npm](https://www.npmjs.com/package/eslint-plugin-baseline-js)
- [Web Platform Baseline](https://web.dev/baseline/)
- [Browser Compatibility Data](https://github.com/mdn/browser-compat-data)

---

**Last Updated**: December 3, 2025
