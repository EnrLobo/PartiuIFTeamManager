import { redirect } from "next/navigation";

/** A raiz do site leva ao painel; quem não está logado é desviado para /login pelo proxy. */
export default function Home() {
  redirect("/painel");
}
