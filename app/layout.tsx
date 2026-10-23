import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sistema de Chamados de Manutenção",
    template: "%s · Chamados de Manutenção",
  },
  description: "Sistema didático para registrar chamados e ordens de manutenção de equipamentos (dados fictícios).",
};

// Fontes do sistema operacional: o build funciona mesmo sem internet no laboratório.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
