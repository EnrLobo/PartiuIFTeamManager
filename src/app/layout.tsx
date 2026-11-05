import type { Metadata } from "next";
// Fontes autohospedadas (pacote "geist"): não dependem de rede externa no build.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Partiu IF - Gestão de Equipe",
  description: "Sistema de gestão de equipe e bolsistas do projeto Partiu IF.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
