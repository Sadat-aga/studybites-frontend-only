export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      flashcard_attempts: {
        Row: {
          attempt_order: number
          attempted_at: string
          flashcard_id: string
          id: string
          result: string
          session_id: string
          user_id: string
        }
        Insert: {
          attempt_order?: number
          attempted_at?: string
          flashcard_id: string
          id?: string
          result: string
          session_id: string
          user_id: string
        }
        Update: {
          attempt_order?: number
          attempted_at?: string
          flashcard_id?: string
          id?: string
          result?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_attempts_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_index: number
          folder_id: string
          id: string
          mastered_count: number
          started_at: string
          status: string
          still_learning_count: number
          study_set_id: string
          total_cards: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_index?: number
          folder_id: string
          id?: string
          mastered_count?: number
          started_at?: string
          status?: string
          still_learning_count?: number
          study_set_id: string
          total_cards?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_index?: number
          folder_id?: string
          id?: string
          mastered_count?: number
          started_at?: string
          status?: string
          still_learning_count?: number
          study_set_id?: string
          total_cards?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_sessions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_sessions_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back_text: string
          content: string | null
          created_at: string
          difficulty: string | null
          explanation: string | null
          folder_id: string
          front_text: string
          heading: string | null
          id: string
          metadata: Json
          owner_user_id: string
          sort_order: number
          source_excerpt: string | null
          study_set_id: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          back_text: string
          content?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          folder_id: string
          front_text: string
          heading?: string | null
          id?: string
          metadata?: Json
          owner_user_id: string
          sort_order?: number
          source_excerpt?: string | null
          study_set_id: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          back_text?: string
          content?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          folder_id?: string
          front_text?: string
          heading?: string | null
          id?: string
          metadata?: Json
          owner_user_id?: string
          sort_order?: number
          source_excerpt?: string | null
          study_set_id?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          extracted_text: string | null
          id: string
          metadata: Json
          mime_type: string | null
          owner_user_id: string
          page_count: number
          processed_html: string | null
          processing_status: string
          source_filename: string | null
          source_url: string | null
          storage_bucket: string
          storage_path: string | null
          study_set_id: string
          summary_status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          extracted_text?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          owner_user_id: string
          page_count?: number
          processed_html?: string | null
          processing_status?: string
          source_filename?: string | null
          source_url?: string | null
          storage_bucket?: string
          storage_path?: string | null
          study_set_id: string
          summary_status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          extracted_text?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          owner_user_id?: string
          page_count?: number
          processed_html?: string | null
          processing_status?: string
          source_filename?: string | null
          source_url?: string | null
          storage_bucket?: string
          storage_path?: string | null
          study_set_id?: string
          summary_status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_attempts: {
        Row: {
          attempted_at: string
          flagged_bad: boolean
          id: string
          is_correct: boolean
          question_id: string
          queue_position: number
          round_number: number
          selected_choice_id: string | null
          session_id: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          attempted_at?: string
          flagged_bad?: boolean
          id?: string
          is_correct: boolean
          question_id: string
          queue_position?: number
          round_number?: number
          selected_choice_id?: string | null
          session_id: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          attempted_at?: string
          flagged_bad?: boolean
          id?: string
          is_correct?: boolean
          question_id?: string
          queue_position?: number
          round_number?: number
          selected_choice_id?: string | null
          session_id?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcq_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mcq_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_questions: {
        Row: {
          choices: Json
          correct_choice_id: string
          created_at: string
          difficulty: string
          explanation: string | null
          folder_id: string
          id: string
          owner_user_id: string
          prompt: string
          question_text: string | null
          sort_order: number
          source_excerpt: string | null
          study_set_id: string
          topic: string | null
          updated_at: string
          xp_reward: number
        }
        Insert: {
          choices?: Json
          correct_choice_id: string
          created_at?: string
          difficulty?: string
          explanation?: string | null
          folder_id: string
          id?: string
          owner_user_id: string
          prompt: string
          question_text?: string | null
          sort_order?: number
          source_excerpt?: string | null
          study_set_id: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          choices?: Json
          correct_choice_id?: string
          created_at?: string
          difficulty?: string
          explanation?: string | null
          folder_id?: string
          id?: string
          owner_user_id?: string
          prompt?: string
          question_text?: string | null
          sort_order?: number
          source_excerpt?: string | null
          study_set_id?: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcq_questions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_questions_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_questions_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_sessions: {
        Row: {
          answered_questions: number
          best_streak: number
          completed_at: string | null
          created_at: string
          current_index: number
          current_round: number
          current_streak: number
          flagged_count: number
          folder_id: string
          id: string
          queue: Json
          round_summary: Json
          score: number
          status: string
          study_set_id: string
          total_questions: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          answered_questions?: number
          best_streak?: number
          completed_at?: string | null
          created_at?: string
          current_index?: number
          current_round?: number
          current_streak?: number
          flagged_count?: number
          folder_id: string
          id?: string
          queue?: Json
          round_summary?: Json
          score?: number
          status?: string
          study_set_id: string
          total_questions?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          answered_questions?: number
          best_streak?: number
          completed_at?: string | null
          created_at?: string
          current_index?: number
          current_round?: number
          current_streak?: number
          flagged_count?: number
          folder_id?: string
          id?: string
          queue?: Json
          round_summary?: Json
          score?: number
          status?: string
          study_set_id?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcq_sessions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_sessions_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sets: {
        Row: {
          created_at: string
          description: string | null
          emoji: string
          flashcards_progress_percent: number
          id: string
          last_opened_at: string | null
          mcq_progress_percent: number
          owner_user_id: string
          share_token: string | null
          slug: string | null
          source: string
          status: string
          summary_count: number
          title: string
          total_pages: number
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string
          flashcards_progress_percent?: number
          id?: string
          last_opened_at?: string | null
          mcq_progress_percent?: number
          owner_user_id: string
          share_token?: string | null
          slug?: string | null
          source?: string
          status?: string
          summary_count?: number
          title: string
          total_pages?: number
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string
          flashcards_progress_percent?: number
          id?: string
          last_opened_at?: string | null
          mcq_progress_percent?: number
          owner_user_id?: string
          share_token?: string | null
          slug?: string | null
          source?: string
          status?: string
          summary_count?: number
          title?: string
          total_pages?: number
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sets_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string | null
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          plan_code: string
          plan_name: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          quota_chat_messages_per_day: number
          quota_documents_per_day: number
          quota_explanations_per_day: number
          quota_pages: number
          quota_translations_per_day: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan_code?: string
          plan_name?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          quota_chat_messages_per_day?: number
          quota_documents_per_day?: number
          quota_explanations_per_day?: number
          quota_pages?: number
          quota_translations_per_day?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan_code?: string
          plan_name?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          quota_chat_messages_per_day?: number
          quota_documents_per_day?: number
          quota_explanations_per_day?: number
          quota_pages?: number
          quota_translations_per_day?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          ai_model: string | null
          content_html: string | null
          content_text: string | null
          created_at: string
          folder_id: string
          format: string
          html_storage_path: string | null
          id: string
          language: string
          status: string
          storage_url: string | null
          study_set_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          folder_id: string
          format?: string
          html_storage_path?: string | null
          id?: string
          language?: string
          status?: string
          storage_url?: string | null
          study_set_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string | null
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          folder_id?: string
          format?: string
          html_storage_path?: string | null
          id?: string
          language?: string
          status?: string
          storage_url?: string | null
          study_set_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summaries_study_set_id_fkey"
            columns: ["study_set_id"]
            isOneToOne: false
            referencedRelation: "study_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string
          id: string
          last_activity_at: string | null
          locale: string
          onboarding_dob_completed: boolean
          streak_count: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          id: string
          last_activity_at?: string | null
          locale?: string
          onboarding_dob_completed?: boolean
          streak_count?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          id?: string
          last_activity_at?: string | null
          locale?: string
          onboarding_dob_completed?: boolean
          streak_count?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_folder_owner: { Args: { target_folder_id: string }; Returns: boolean }
      is_study_set_owner: {
        Args: { target_study_set_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
