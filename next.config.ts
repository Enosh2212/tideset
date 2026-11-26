import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep isolated QA, CI and test builds from disrupting an already-running local dev server.
  distDir: process.env.TIDESET_BUILD_DIR || (process.env.NODE_ENV === "test" ? ".next-qa" : ".next"),
};

export default nextConfig;
