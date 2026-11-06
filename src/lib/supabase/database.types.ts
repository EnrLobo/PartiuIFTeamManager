/**
 * Tipos do banco de dados, GERADOS automaticamente a partir do Supabase.
 * Não edite à mão: após cada migração, gere novamente.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          status: Database["public"]["Enums"]["account_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_status: "pendente" | "ativo" | "bloqueado";
      user_role:
        | "admin"
        | "coordenador_gestao"
        | "coordenador_pedagogico"
        | "apoio_administrativo"
        | "apoio_secretaria";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** Atalhos úteis: Tables<"profiles"> é a linha da tabela de perfis. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
