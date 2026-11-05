/**
 * Página inicial provisória.
 * Será substituída pela tela de login e pelo painel nas próximas etapas.
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <span className="bg-brand text-ink inline-block rounded-full px-3 py-1 text-sm font-semibold">
          Em construção
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Partiu IF - Gestão de Equipe
        </h1>

        <p className="mt-3 text-lg text-black/70">
          A fundação do projeto está pronta. Nas próximas etapas entram o login,
          os perfis de acesso e o cadastro de bolsistas.
        </p>

        {/* Amostra das cores oficiais, útil para conferir a paleta. Será removida depois. */}
        <ul className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
          <li className="bg-brand text-ink rounded-md px-3 py-2">Principal</li>
          <li className="bg-success text-ink rounded-md px-3 py-2">Sucesso</li>
          <li className="bg-danger rounded-md px-3 py-2 text-white">Alerta</li>
          <li className="bg-ink rounded-md px-3 py-2 text-white">Texto</li>
        </ul>
      </section>
    </main>
  );
}
