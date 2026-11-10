/** Deixa só os números do CPF (aceita "123.456.789-09", espaços etc.). */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Confere se o CPF é válido pelos dois dígitos verificadores.
 * Recebe só números (use normalizeCpf antes).
 */
export function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;
  // CPFs com todos os dígitos iguais (111.111.111-11...) passam na conta, mas não existem.
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/** 12345678909 -> 123.456.789-09 */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
