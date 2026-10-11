/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output only for Docker deploys (Netlify uses its own runtime).
  ...(process.env.DOCKER_BUILD ? { output: "standalone" } : {}),
};
export default nextConfig;
