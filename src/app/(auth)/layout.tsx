import Image from "next/image";

/** Moldura simples das telas de entrada (login, cadastro, aguardando aprovação). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* A logo tem fundo branco: fica dentro do cartão branco, não sobre o fundo da página. */}
        <section className="border-t-brand overflow-hidden rounded-2xl border border-t-4 border-black/10 bg-white shadow-sm">
          <div className="px-6 pt-6 sm:px-8">
            <Image
              src="/logo-partiu-if.png"
              alt="Partiu IF"
              width={960}
              height={376}
              priority
              className="mx-auto h-auto w-56"
            />
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </section>
        <p className="mt-6 text-center text-sm text-black/70">
          Sistema de gestão de equipe e bolsistas
        </p>
      </div>
    </main>
  );
}
