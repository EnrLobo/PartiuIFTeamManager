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
      assignment_notes: {
        Row: {
          assignment_id: string;
          notes: string;
          updated_at: string;
        };
        Insert: {
          assignment_id: string;
          notes?: string;
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          notes?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_notes_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: true;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
        ];
      };
      assignment_status_history: {
        Row: {
          assignment_id: string;
          changed_at: string;
          changed_by: string | null;
          from_status: Database["public"]["Enums"]["assignment_status"] | null;
          id: number;
          to_status: Database["public"]["Enums"]["assignment_status"];
        };
        Insert: {
          assignment_id: string;
          changed_at?: string;
          changed_by?: string | null;
          from_status?: Database["public"]["Enums"]["assignment_status"] | null;
          id?: never;
          to_status: Database["public"]["Enums"]["assignment_status"];
        };
        Update: {
          assignment_id?: string;
          changed_at?: string;
          changed_by?: string | null;
          from_status?: Database["public"]["Enums"]["assignment_status"] | null;
          id?: never;
          to_status?: Database["public"]["Enums"]["assignment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "assignment_status_history_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assignments: {
        Row: {
          called_by: string | null;
          campus_id: string | null;
          created_at: string;
          edital_id: string;
          email_sent_at: string | null;
          id: string;
          institution_id: string;
          position_type_id: string;
          response_deadline: string | null;
          scholar_id: string;
          status: Database["public"]["Enums"]["assignment_status"];
          term_end: string | null;
          term_start: string | null;
          updated_at: string;
          vacancy_title: string;
        };
        Insert: {
          called_by?: string | null;
          campus_id?: string | null;
          created_at?: string;
          edital_id: string;
          email_sent_at?: string | null;
          id?: string;
          institution_id: string;
          position_type_id: string;
          response_deadline?: string | null;
          scholar_id: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          term_end?: string | null;
          term_start?: string | null;
          updated_at?: string;
          vacancy_title: string;
        };
        Update: {
          called_by?: string | null;
          campus_id?: string | null;
          created_at?: string;
          edital_id?: string;
          email_sent_at?: string | null;
          id?: string;
          institution_id?: string;
          position_type_id?: string;
          response_deadline?: string | null;
          scholar_id?: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          term_end?: string | null;
          term_start?: string | null;
          updated_at?: string;
          vacancy_title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_called_by_fkey";
            columns: ["called_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_edital_id_fkey";
            columns: ["edital_id"];
            isOneToOne: false;
            referencedRelation: "editais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_position_type_id_fkey";
            columns: ["position_type_id"];
            isOneToOne: false;
            referencedRelation: "position_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_scholar_id_fkey";
            columns: ["scholar_id"];
            isOneToOne: false;
            referencedRelation: "scholars";
            referencedColumns: ["id"];
          },
        ];
      };
      campuses: {
        Row: {
          created_at: string;
          id: string;
          institution_id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          institution_id: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          institution_id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campuses_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      editais: {
        Row: {
          code: string;
          created_at: string;
          id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      institutions: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      position_types: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
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
      scholar_sensitive: {
        Row: {
          account_number: string | null;
          account_type: string | null;
          agency: string | null;
          bank_name: string | null;
          cpf: string;
          created_at: string;
          email: string | null;
          phone: string | null;
          pix_key: string | null;
          pix_key_type: string | null;
          scholar_id: string;
          updated_at: string;
        };
        Insert: {
          account_number?: string | null;
          account_type?: string | null;
          agency?: string | null;
          bank_name?: string | null;
          cpf: string;
          created_at?: string;
          email?: string | null;
          phone?: string | null;
          pix_key?: string | null;
          pix_key_type?: string | null;
          scholar_id: string;
          updated_at?: string;
        };
        Update: {
          account_number?: string | null;
          account_type?: string | null;
          agency?: string | null;
          bank_name?: string | null;
          cpf?: string;
          created_at?: string;
          email?: string | null;
          phone?: string | null;
          pix_key?: string | null;
          pix_key_type?: string | null;
          scholar_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scholar_sensitive_scholar_id_fkey";
            columns: ["scholar_id"];
            isOneToOne: true;
            referencedRelation: "scholars";
            referencedColumns: ["id"];
          },
        ];
      };
      scholars: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
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
      assignment_status:
        | "convocado_aguardando_manifestacao"
        | "convocacao_pendente"
        | "manifestou_interesse_enviar_termo"
        | "termo_assinado"
        | "solicitou_desligamento"
        | "aguardando_indicacao_campus"
        | "aguardando_assinatura_termo"
        | "nao_manifestou_interesse_convocar_proximo";
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
