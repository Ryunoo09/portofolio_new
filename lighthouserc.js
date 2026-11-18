export default {
  ci: {
    collect: {
      startServerCommand: "pnpm start --port 3200",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60_000,
      url: ["http://localhost:3200/"],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
        // Same 250 KB ceiling as scripts/bundle-size.mjs, measured on the wire.
        "resource-summary:script:size": ["error", { maxNumericValue: 256_000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "lighthouse-results",
    },
  },
};
