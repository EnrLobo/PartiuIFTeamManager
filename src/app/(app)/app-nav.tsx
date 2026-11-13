"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../(auth)/actions";

type Props = {
  items: { href: string; label: string }[];
  userName: string;
  roleLabel: string;
};

/**
 * Menu lateral (telas grandes) e barra superior com botão "Menu" (celular).
 * Os itens já chegam filtrados pelo perfil do usuário.
 * Visual claro: a logo tem fundo branco, então o menu fica sobre branco.
 */
export function AppNav({ items, userName, roleLabel }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="border-brand flex items-center justify-between border-b-4 bg-white px-4 py-2 md:hidden">
        <Image
          src="/logo-partiu-if-horizontal.png"
          alt="Partiu IF"
          width={720}
          height={201}
          priority
          className="h-9 w-auto"
        />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen(!open)}
          className="bg-brand-strong hover:bg-brand-dark rounded-md px-3 py-2 font-semibold text-white"
        >
          {open ? "Fechar menu" : "Menu"}
        </button>
      </header>

      <aside
        id="menu-principal"
        className={`${open ? "block" : "hidden"} md:border-t-brand border-b border-black/10 bg-white md:block md:min-h-screen md:w-64 md:shrink-0 md:border-t-4 md:border-r md:border-b-0`}
      >
        <div className="hidden px-6 py-6 md:block">
          <Image
            src="/logo-partiu-if.png"
            alt="Partiu IF"
            width={960}
            height={376}
            priority
            className="h-auto w-full"
          />
        </div>

        <nav aria-label="Menu principal" className="px-3 py-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md border-l-4 px-3 py-2 font-medium ${
                      active
                        ? "border-brand bg-brand-soft font-semibold"
                        : "border-transparent hover:bg-black/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4 border-t border-black/10 p-4 text-sm">
          <p className="font-semibold">{userName}</p>
          <p className="text-black/70">{roleLabel}</p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-md border border-black/50 px-3 py-2 font-semibold hover:bg-black/5"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
