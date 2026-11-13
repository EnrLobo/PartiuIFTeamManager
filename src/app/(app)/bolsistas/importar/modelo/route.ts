import { getSessionInfo } from "@/lib/auth";
import { templateCsv } from "@/lib/import/model";

/** Baixa a planilha-modelo (CSV). SOMENTE administrador ativo. */
export async function GET() {
  const { user, profile } = await getSessionInfo();
  if (
    !user ||
    !profile ||
    profile.status !== "ativo" ||
    profile.role !== "admin"
  ) {
    return new Response("Acesso negado.", { status: 403 });
  }

  return new Response(templateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="modelo-importacao-partiu-if.csv"',
      "Cache-Control": "no-store",
    },
  });
}
