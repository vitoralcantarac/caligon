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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_reasoning: string | null
          approved: boolean
          assignee_id: string | null
          causal_tree: Json | null
          chaos_score: number | null
          client_id: string
          created_at: string
          documents_extracted_text: string | null
          documents_summary: Json | null
          estimated_loss: number | null
          estimated_savings: number | null
          executive_summary: string | null
          financial_gate: string | null
          id: string
          loss_display_mode: string | null
          loss_range_max: number | null
          loss_range_min: number | null
          process: string
          progress: number
          qualification_answers: Json | null
          qualification_level: string | null
          qualification_report: Json | null
          qualification_score: number | null
          status: Database["public"]["Enums"]["analysis_status"]
          updated_at: string
          validation_result: Json | null
          version: number
        }
        Insert: {
          ai_reasoning?: string | null
          approved?: boolean
          assignee_id?: string | null
          causal_tree?: Json | null
          chaos_score?: number | null
          client_id: string
          created_at?: string
          documents_extracted_text?: string | null
          documents_summary?: Json | null
          estimated_loss?: number | null
          estimated_savings?: number | null
          executive_summary?: string | null
          financial_gate?: string | null
          id?: string
          loss_display_mode?: string | null
          loss_range_max?: number | null
          loss_range_min?: number | null
          process: string
          progress?: number
          qualification_answers?: Json | null
          qualification_level?: string | null
          qualification_report?: Json | null
          qualification_score?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          validation_result?: Json | null
          version?: number
        }
        Update: {
          ai_reasoning?: string | null
          approved?: boolean
          assignee_id?: string | null
          causal_tree?: Json | null
          chaos_score?: number | null
          client_id?: string
          created_at?: string
          documents_extracted_text?: string | null
          documents_summary?: Json | null
          estimated_loss?: number | null
          estimated_savings?: number | null
          executive_summary?: string | null
          financial_gate?: string | null
          id?: string
          loss_display_mode?: string | null
          loss_range_max?: number | null
          loss_range_min?: number | null
          process?: string
          progress?: number
          qualification_answers?: Json | null
          qualification_level?: string | null
          qualification_report?: Json | null
          qualification_score?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          validation_result?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "analyses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_scores: {
        Row: {
          analysis_id: string
          basis: string | null
          confidence: string | null
          created_at: string
          description: string | null
          factors: Json | null
          id: string
          is_heuristic: boolean | null
          label: string
          max_value: number
          missing_data: string | null
          percentile: number | null
          sector_benchmark: number | null
          value: number
        }
        Insert: {
          analysis_id: string
          basis?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          factors?: Json | null
          id?: string
          is_heuristic?: boolean | null
          label: string
          max_value?: number
          missing_data?: string | null
          percentile?: number | null
          sector_benchmark?: number | null
          value: number
        }
        Update: {
          analysis_id?: string
          basis?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          factors?: Json | null
          id?: string
          is_heuristic?: boolean | null
          label?: string
          max_value?: number
          missing_data?: string | null
          percentile?: number | null
          sector_benchmark?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "analysis_scores_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          analysis_id: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          reference_id: string
          requested_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["approval_type"]
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reference_id: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          subtitle?: string | null
          title: string
          type: Database["public"]["Enums"]["approval_type"]
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reference_id?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          subtitle?: string | null
          title?: string
          type?: Database["public"]["Enums"]["approval_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bottlenecks: {
        Row: {
          analysis_id: string
          annual_loss: number | null
          behavior_description: string | null
          calculation_formula: string | null
          calculation_premises: Json | null
          calculation_type: string | null
          category: string
          causal_layer: string | null
          causal_order: number | null
          causal_parent_id: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          description: string | null
          estimated_loss: number | null
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          evidences: Json | null
          id: string
          is_dominant: boolean | null
          layer: string
          loss_display_mode: string | null
          loss_range_max: number | null
          loss_range_min: number | null
          severity: Database["public"]["Enums"]["severity_level"]
          source: string | null
          title: string
        }
        Insert: {
          analysis_id: string
          annual_loss?: number | null
          behavior_description?: string | null
          calculation_formula?: string | null
          calculation_premises?: Json | null
          calculation_type?: string | null
          category: string
          causal_layer?: string | null
          causal_order?: number | null
          causal_parent_id?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          description?: string | null
          estimated_loss?: number | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          evidences?: Json | null
          id?: string
          is_dominant?: boolean | null
          layer: string
          loss_display_mode?: string | null
          loss_range_max?: number | null
          loss_range_min?: number | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source?: string | null
          title: string
        }
        Update: {
          analysis_id?: string
          annual_loss?: number | null
          behavior_description?: string | null
          calculation_formula?: string | null
          calculation_premises?: Json | null
          calculation_type?: string | null
          category?: string
          causal_layer?: string | null
          causal_order?: number | null
          causal_parent_id?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          description?: string | null
          estimated_loss?: number | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          evidences?: Json | null
          id?: string
          is_dominant?: boolean | null
          layer?: string
          loss_display_mode?: string | null
          loss_range_max?: number | null
          loss_range_min?: number | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bottlenecks_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bottlenecks_causal_parent_id_fkey"
            columns: ["causal_parent_id"]
            isOneToOne: false
            referencedRelation: "bottlenecks"
            referencedColumns: ["id"]
          },
        ]
      }
      client_metrics: {
        Row: {
          calculation_inputs: Json | null
          client_id: string
          created_at: string
          formula_used: string | null
          id: string
          metric_group: string
          metric_key: string
          metric_level: string
          observation: string | null
          origin: string | null
          status: string
          unit: string | null
          updated_at: string
          updated_by: string | null
          value: number | null
        }
        Insert: {
          calculation_inputs?: Json | null
          client_id: string
          created_at?: string
          formula_used?: string | null
          id?: string
          metric_group: string
          metric_key: string
          metric_level?: string
          observation?: string | null
          origin?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Update: {
          calculation_inputs?: Json | null
          client_id?: string
          created_at?: string
          formula_used?: string | null
          id?: string
          metric_group?: string
          metric_key?: string
          metric_level?: string
          observation?: string | null
          origin?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact: string | null
          context: string | null
          created_at: string
          created_by: string | null
          email: string | null
          employees: number | null
          id: string
          name: string
          niche: string
          phone: string | null
          revenue: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          name: string
          niche: string
          phone?: string | null
          revenue?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employees?: number | null
          id?: string
          name?: string
          niche?: string
          phone?: string | null
          revenue?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          analysis_id: string
          created_at: string
          file_path: string | null
          file_size: number | null
          generated_at: string | null
          id: string
          label: string
          status: string
          type: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          id?: string
          label: string
          status?: string
          type: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          id?: string
          label?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      diagnosis_ratings: {
        Row: {
          analysis_id: string
          comment: string | null
          created_at: string | null
          helpful_recommendations: boolean | null
          id: string
          rating: number
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          analysis_id: string
          comment?: string | null
          created_at?: string | null
          helpful_recommendations?: boolean | null
          id?: string
          rating: number
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          analysis_id?: string
          comment?: string | null
          created_at?: string | null
          helpful_recommendations?: boolean | null
          id?: string
          rating?: number
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnosis_ratings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          analysis_id: string | null
          classification: string | null
          client_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          parsed_content: string | null
          uploaded_by: string | null
        }
        Insert: {
          analysis_id?: string | null
          classification?: string | null
          client_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          parsed_content?: string | null
          uploaded_by?: string | null
        }
        Update: {
          analysis_id?: string | null
          classification?: string | null
          client_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          parsed_content?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowcharts: {
        Row: {
          analysis_id: string
          approved: boolean
          created_at: string
          edges: Json
          id: string
          label: string | null
          nodes: Json
          status: string
          type: string
          updated_at: string
          version: number
        }
        Insert: {
          analysis_id: string
          approved?: boolean
          created_at?: string
          edges?: Json
          id?: string
          label?: string | null
          nodes?: Json
          status?: string
          type: string
          updated_at?: string
          version?: number
        }
        Update: {
          analysis_id?: string
          approved?: boolean
          created_at?: string
          edges?: Json
          id?: string
          label?: string | null
          nodes?: Json
          status?: string
          type?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "flowcharts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          approved: boolean
          approved_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          frequency: number | null
          id: string
          niche: string
          source: string | null
          tags: Json | null
          title: string
          type: Database["public"]["Enums"]["knowledge_type"]
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          niche: string
          source?: string | null
          tags?: Json | null
          title: string
          type?: Database["public"]["Enums"]["knowledge_type"]
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          niche?: string
          source?: string | null
          tags?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["knowledge_type"]
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          on_approval_pending: boolean
          on_diagnosis_complete: boolean
          on_error: boolean
          on_new_comment: boolean
          on_new_upload: boolean
          on_report_generated: boolean
          on_review_pending: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          on_approval_pending?: boolean
          on_diagnosis_complete?: boolean
          on_error?: boolean
          on_new_comment?: boolean
          on_new_upload?: boolean
          on_report_generated?: boolean
          on_review_pending?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          on_approval_pending?: boolean
          on_diagnosis_complete?: boolean
          on_error?: boolean
          on_new_comment?: boolean
          on_new_upload?: boolean
          on_report_generated?: boolean
          on_review_pending?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          analysis_id: string | null
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          analysis_id?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          analysis_id?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          gateway: string
          gateway_payment_id: string | null
          id: string
          installments: number | null
          metadata: Json | null
          method: string | null
          notes: string | null
          plan_id: string | null
          registered_by: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          installments?: number | null
          metadata?: Json | null
          method?: string | null
          notes?: string | null
          plan_id?: string | null
          registered_by?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          installments?: number | null
          metadata?: Json | null
          method?: string | null
          notes?: string | null
          plan_id?: string | null
          registered_by?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          description: string | null
          diagnostics_per_period: number | null
          diagnostics_unlimited: boolean | null
          features: Json | null
          highlight: boolean | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          slug: string
          sort_order: number | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          description?: string | null
          diagnostics_per_period?: number | null
          diagnostics_unlimited?: boolean | null
          features?: Json | null
          highlight?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          slug: string
          sort_order?: number | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          diagnostics_per_period?: number | null
          diagnostics_unlimited?: boolean | null
          features?: Json | null
          highlight?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: {
          ai_reasoning: string | null
          category: string
          created_at: string
          id: string
          is_adaptive: boolean
          options: Json | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          session_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          category?: string
          created_at?: string
          id?: string
          is_adaptive?: boolean
          options?: Json | null
          order_index?: number
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          session_id: string
        }
        Update: {
          ai_reasoning?: string | null
          category?: string
          created_at?: string
          id?: string
          is_adaptive?: boolean
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          ai_follow_up: string | null
          created_at: string
          id: string
          is_vague: boolean | null
          question_id: string
          response_data: Json | null
          response_text: string | null
          session_id: string
          vague_attempts: number | null
        }
        Insert: {
          ai_follow_up?: string | null
          created_at?: string
          id?: string
          is_vague?: boolean | null
          question_id: string
          response_data?: Json | null
          response_text?: string | null
          session_id: string
          vague_attempts?: number | null
        }
        Update: {
          ai_follow_up?: string | null
          created_at?: string
          id?: string
          is_vague?: boolean | null
          question_id?: string
          response_data?: Json | null
          response_text?: string | null
          session_id?: string
          vague_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sessions: {
        Row: {
          ai_context: Json | null
          analysis_id: string
          completed: boolean
          created_at: string
          id: string
          phase: string
          progress: number
          updated_at: string
        }
        Insert: {
          ai_context?: Json | null
          analysis_id: string
          completed?: boolean
          created_at?: string
          id?: string
          phase?: string
          progress?: number
          updated_at?: string
        }
        Update: {
          ai_context?: Json | null
          analysis_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          phase?: string
          progress?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_sessions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          analysis_id: string
          anticipation_risk: string | null
          area: string | null
          calculation_explanation: string | null
          calculation_type: string | null
          category: Database["public"]["Enums"]["recommendation_category"]
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          dependencies: string[] | null
          difficulty: string | null
          estimated_cost: number | null
          estimated_saving: number | null
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          expected_result: string | null
          how_to_implement: Json | null
          id: string
          impact: Database["public"]["Enums"]["severity_level"]
          is_quick_win: boolean | null
          justification: string | null
          payback_months: number | null
          phase_order: number | null
          priority: number | null
          problem: string | null
          process: string | null
          risk: string | null
          roadmap_phase: string | null
          roi_percentage: number | null
          saving_display_mode: string | null
          saving_range_max: number | null
          saving_range_min: number | null
          source: string | null
          timeframe: string | null
          title: string
          tools_required: Json | null
          warning: string | null
        }
        Insert: {
          analysis_id: string
          anticipation_risk?: string | null
          area?: string | null
          calculation_explanation?: string | null
          calculation_type?: string | null
          category?: Database["public"]["Enums"]["recommendation_category"]
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          dependencies?: string[] | null
          difficulty?: string | null
          estimated_cost?: number | null
          estimated_saving?: number | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          expected_result?: string | null
          how_to_implement?: Json | null
          id?: string
          impact?: Database["public"]["Enums"]["severity_level"]
          is_quick_win?: boolean | null
          justification?: string | null
          payback_months?: number | null
          phase_order?: number | null
          priority?: number | null
          problem?: string | null
          process?: string | null
          risk?: string | null
          roadmap_phase?: string | null
          roi_percentage?: number | null
          saving_display_mode?: string | null
          saving_range_max?: number | null
          saving_range_min?: number | null
          source?: string | null
          timeframe?: string | null
          title: string
          tools_required?: Json | null
          warning?: string | null
        }
        Update: {
          analysis_id?: string
          anticipation_risk?: string | null
          area?: string | null
          calculation_explanation?: string | null
          calculation_type?: string | null
          category?: Database["public"]["Enums"]["recommendation_category"]
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          dependencies?: string[] | null
          difficulty?: string | null
          estimated_cost?: number | null
          estimated_saving?: number | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          expected_result?: string | null
          how_to_implement?: Json | null
          id?: string
          impact?: Database["public"]["Enums"]["severity_level"]
          is_quick_win?: boolean | null
          justification?: string | null
          payback_months?: number | null
          phase_order?: number | null
          priority?: number | null
          problem?: string | null
          process?: string | null
          risk?: string | null
          roadmap_phase?: string | null
          roi_percentage?: number | null
          saving_display_mode?: string | null
          saving_range_max?: number | null
          saving_range_min?: number | null
          source?: string | null
          timeframe?: string | null
          title?: string
          tools_required?: Json | null
          warning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          diagnostics_used: number | null
          expires_at: string | null
          id: string
          notes: string | null
          plan_id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          diagnostics_used?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          diagnostics_used?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_diagnostics: {
        Row: {
          analysis_id: string
          id: string
          payment_id: string | null
          subscription_id: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id: string
          id?: string
          payment_id?: string | null
          subscription_id?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string
          id?: string
          payment_id?: string | null
          subscription_id?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_diagnostics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_diagnostics_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_diagnostics_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analysis_status:
        | "cadastro"
        | "questionario"
        | "diagnostico"
        | "fluxogramas"
        | "relatorio"
        | "revisao"
        | "aprovado"
        | "entregue"
      app_role:
        | "socio"
        | "analista"
        | "consultor"
        | "comercial"
        | "gestor"
        | "cliente"
      approval_status: "pending" | "approved" | "rejected"
      approval_type: "report" | "flowchart" | "memory"
      confidence_level: "high" | "medium" | "low"
      evidence_type: "fact" | "inference" | "hypothesis"
      knowledge_type:
        | "bottleneck"
        | "solution"
        | "pattern"
        | "question"
        | "benchmark"
      question_type: "open" | "multiple_choice" | "scale" | "matrix" | "hybrid"
      recommendation_category:
        | "corte"
        | "simplificacao"
        | "automacao"
        | "delegacao"
        | "reestruturacao"
        | "acompanhamento"
      severity_level: "critical" | "high" | "medium" | "low"
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
    Enums: {
      analysis_status: [
        "cadastro",
        "questionario",
        "diagnostico",
        "fluxogramas",
        "relatorio",
        "revisao",
        "aprovado",
        "entregue",
      ],
      app_role: [
        "socio",
        "analista",
        "consultor",
        "comercial",
        "gestor",
        "cliente",
      ],
      approval_status: ["pending", "approved", "rejected"],
      approval_type: ["report", "flowchart", "memory"],
      confidence_level: ["high", "medium", "low"],
      evidence_type: ["fact", "inference", "hypothesis"],
      knowledge_type: [
        "bottleneck",
        "solution",
        "pattern",
        "question",
        "benchmark",
      ],
      question_type: ["open", "multiple_choice", "scale", "matrix", "hybrid"],
      recommendation_category: [
        "corte",
        "simplificacao",
        "automacao",
        "delegacao",
        "reestruturacao",
        "acompanhamento",
      ],
      severity_level: ["critical", "high", "medium", "low"],
    },
  },
} as const
