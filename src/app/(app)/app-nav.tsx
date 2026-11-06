"use client";

import { useState } from "react";
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
 */
export function AppNav({ items, userName, roleLabel }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between bg-black px-4 py-3 text-white md:hidden">
        <span className="text-lg font-bold">
          <span className="text-brand">Partiu</span> IF
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen(!open)}
          className="bg-brand text-ink rounded-md px-3 py-2 font-semibold"
        >
          {open ? "Fechar menu" : "Menu"}
        </button>
      </header>

      <aside
        id="menu-principal"
        className={`${open ? "block" : "hidden"} bg-black text-white md:block md:min-h-screen md:w-64 md:shrink-0`}
      >
        <p className="hidden px-6 py-6 text-2xl font-bold md:block">
          <span className="text-brand">Partiu</span> IF
        </p>

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
                    className={`block rounded-md px-3 py-2 font-medium ${
                      active
                        ? "bg-brand text-ink"
                        : "text-white hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4 border-t border-white/25 p-4 text-sm">
          <p className="font-semibold">{userName}</p>
          <p className="text-white/80">{roleLabel}</p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-md border border-white/60 px-3 py-2 font-semibold hover:bg-white/15"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
