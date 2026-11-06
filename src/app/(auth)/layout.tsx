/** Moldura simples das telas de entrada (login, cadastro, aguardando aprovação). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-3xl font-bold tracking-tight">
          <span className="bg-brand text-ink rounded-md px-2 py-1">Partiu</span>{" "}
          IF
        </p>
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </section>
        <p className="mt-6 text-center text-sm text-black/70">
          Sistema de gestão de equipe e bolsistas
        </p>
      </div>
    </main>
  );
}
