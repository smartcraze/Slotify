import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-pg"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "**.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "fonts.gstatic.com",
			},
		],
	},
};

export default nextConfig;
