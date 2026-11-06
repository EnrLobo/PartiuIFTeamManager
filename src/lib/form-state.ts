/**
 * Resultado devolvido pelas Server Actions dos formulários.
 * - error: mensagem de erro para mostrar ao usuário
 * - message: mensagem de sucesso
 * - values: valores digitados, para o formulário não "apagar" o que a pessoa escreveu
 */
export type FormState =
  | {
      error?: string;
      message?: string;
      values?: Record<string, string>;
    }
  | undefined;
