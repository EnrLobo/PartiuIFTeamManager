import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "Cache Components" fica desligado: o sistema é interno e todas as telas
  // ficam atrás de login, então não há páginas públicas para cachear.
  // Isso também deixa o código de autenticação mais simples.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
