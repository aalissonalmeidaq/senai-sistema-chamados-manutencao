
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "chamados": {
                  Row: {
                    "atualizado_em": string,"categoria": Database["public"]['Enums']["categoria_chamado"],"criado_em": string,"descricao": string,"encerrado_em": string | null,"equipamento_id": number,"id": number,"prioridade": Database["public"]['Enums']["prioridade_chamado"],"resolvido_em": string | null,"solicitante_id": string,"status": Database["public"]['Enums']["status_chamado"],"tecnico_id": string | null,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"categoria": Database["public"]['Enums']["categoria_chamado"],"criado_em"?: string,"descricao": string,"encerrado_em"?: string | null,"equipamento_id": number,"id"?: never,"prioridade"?: Database["public"]['Enums']["prioridade_chamado"],"resolvido_em"?: string | null,"solicitante_id": string,"status"?: Database["public"]['Enums']["status_chamado"],"tecnico_id"?: string | null,"titulo": string
                  }
                  Update: {
                    "atualizado_em"?: string,"categoria"?: Database["public"]['Enums']["categoria_chamado"],"criado_em"?: string,"descricao"?: string,"encerrado_em"?: string | null,"equipamento_id"?: number,"id"?: never,"prioridade"?: Database["public"]['Enums']["prioridade_chamado"],"resolvido_em"?: string | null,"solicitante_id"?: string,"status"?: Database["public"]['Enums']["status_chamado"],"tecnico_id"?: string | null,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chamados_equipamento_id_fkey"
      columns: ["equipamento_id"]
isOneToOne: false
      referencedRelation: "equipamentos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "chamados_solicitante_id_fkey"
      columns: ["solicitante_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "chamados_tecnico_id_fkey"
      columns: ["tecnico_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    }
                  ]
                },"comentarios_chamado": {
                  Row: {
                    "autor_id": string | null,"chamado_id": number,"criado_em": string,"id": number,"interno": boolean,"texto": string
                  }
                  ComputedFields: never
                  Insert: {
                    "autor_id"?: string | null,"chamado_id": number,"criado_em"?: string,"id"?: never,"interno"?: boolean,"texto": string
                  }
                  Update: {
                    "autor_id"?: string | null,"chamado_id"?: number,"criado_em"?: string,"id"?: never,"interno"?: boolean,"texto"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "comentarios_chamado_autor_id_fkey"
      columns: ["autor_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comentarios_chamado_chamado_id_fkey"
      columns: ["chamado_id"]
isOneToOne: false
      referencedRelation: "chamados"
      referencedColumns: ["id"]
    }
                  ]
                },"equipamentos": {
                  Row: {
                    "atualizado_em": string,"categoria": Database["public"]['Enums']["categoria_equipamento"],"codigo": string,"criado_em": string,"criado_por": string | null,"descricao": string,"estado": Database["public"]['Enums']["estado_equipamento"],"id": number,"localizacao": string,"nome": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"categoria": Database["public"]['Enums']["categoria_equipamento"],"codigo": string,"criado_em"?: string,"criado_por"?: string | null,"descricao"?: string,"estado"?: Database["public"]['Enums']["estado_equipamento"],"id"?: never,"localizacao": string,"nome": string
                  }
                  Update: {
                    "atualizado_em"?: string,"categoria"?: Database["public"]['Enums']["categoria_equipamento"],"codigo"?: string,"criado_em"?: string,"criado_por"?: string | null,"descricao"?: string,"estado"?: Database["public"]['Enums']["estado_equipamento"],"id"?: never,"localizacao"?: string,"nome"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "equipamentos_criado_por_fkey"
      columns: ["criado_por"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    }
                  ]
                },"eventos": {
                  Row: {
                    "autor_id": string | null,"chamado_id": number | null,"criado_em": string,"dados": NonNullable<Json>,"descricao": string,"equipamento_id": number | null,"id": number,"ordem_id": number | null,"tipo": string,"visivel_solicitante": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "autor_id"?: string | null,"chamado_id"?: number | null,"criado_em"?: string,"dados"?: NonNullable<Json>,"descricao": string,"equipamento_id"?: number | null,"id"?: never,"ordem_id"?: number | null,"tipo": string,"visivel_solicitante"?: boolean
                  }
                  Update: {
                    "autor_id"?: string | null,"chamado_id"?: number | null,"criado_em"?: string,"dados"?: NonNullable<Json>,"descricao"?: string,"equipamento_id"?: number | null,"id"?: never,"ordem_id"?: number | null,"tipo"?: string,"visivel_solicitante"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "eventos_autor_id_fkey"
      columns: ["autor_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "eventos_chamado_id_fkey"
      columns: ["chamado_id"]
isOneToOne: false
      referencedRelation: "chamados"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "eventos_equipamento_id_fkey"
      columns: ["equipamento_id"]
isOneToOne: false
      referencedRelation: "equipamentos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "eventos_ordem_id_fkey"
      columns: ["ordem_id"]
isOneToOne: false
      referencedRelation: "ordens_manutencao"
      referencedColumns: ["id"]
    }
                  ]
                },"ordens_manutencao": {
                  Row: {
                    "atividades_executadas": string,"atualizado_em": string,"chamado_id": number,"concluida_em": string | null,"criado_em": string,"diagnostico": string,"equipamento_id": number,"id": number,"iniciada_em": string | null,"plano_acao": string,"responsavel_id": string,"resultado": Database["public"]['Enums']["resultado_ordem"] | null,"status": Database["public"]['Enums']["status_ordem"],"tipo": Database["public"]['Enums']["tipo_manutencao"]
                  }
                  ComputedFields: never
                  Insert: {
                    "atividades_executadas"?: string,"atualizado_em"?: string,"chamado_id": number,"concluida_em"?: string | null,"criado_em"?: string,"diagnostico"?: string,"equipamento_id": number,"id"?: never,"iniciada_em"?: string | null,"plano_acao"?: string,"responsavel_id": string,"resultado"?: Database["public"]['Enums']["resultado_ordem"] | null,"status"?: Database["public"]['Enums']["status_ordem"],"tipo": Database["public"]['Enums']["tipo_manutencao"]
                  }
                  Update: {
                    "atividades_executadas"?: string,"atualizado_em"?: string,"chamado_id"?: number,"concluida_em"?: string | null,"criado_em"?: string,"diagnostico"?: string,"equipamento_id"?: number,"id"?: never,"iniciada_em"?: string | null,"plano_acao"?: string,"responsavel_id"?: string,"resultado"?: Database["public"]['Enums']["resultado_ordem"] | null,"status"?: Database["public"]['Enums']["status_ordem"],"tipo"?: Database["public"]['Enums']["tipo_manutencao"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "ordens_manutencao_chamado_id_fkey"
      columns: ["chamado_id"]
isOneToOne: false
      referencedRelation: "chamados"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ordens_manutencao_equipamento_id_fkey"
      columns: ["equipamento_id"]
isOneToOne: false
      referencedRelation: "equipamentos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ordens_manutencao_responsavel_id_fkey"
      columns: ["responsavel_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    }
                  ]
                },"perfis": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"id": string,"nome": string,"papel": Database["public"]['Enums']["papel_usuario"]
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"id": string,"nome": string,"papel"?: Database["public"]['Enums']["papel_usuario"]
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome"?: string,"papel"?: Database["public"]['Enums']["papel_usuario"]
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "alterar_status_chamado":
{ Args: { "p_chamado_id": number,"p_observacao"?: string,"p_status": Database["public"]['Enums']["status_chamado"] }; Returns: undefined
                           },
"alterar_status_ordem":
{ Args: { "p_observacao"?: string,"p_ordem_id": number,"p_status": Database["public"]['Enums']["status_ordem"] }; Returns: undefined
                           },
"codigo_ordem":
{ Args: { "ordem_id": number }; Returns: string
                           },
"contexto_sistema":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"definir_papel":
{ Args: { "p_papel": Database["public"]['Enums']["papel_usuario"],"p_usuario": string }; Returns: undefined
                           },
"eh_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"eh_equipe":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"observacao_atual":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"papel_atual":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["papel_usuario"]
                           },
"rotulo":
{ Args: { "valor": string }; Returns: string
                           },
"transicao_chamado_exige_observacao":
{ Args: { "de": Database["public"]['Enums']["status_chamado"],"para": Database["public"]['Enums']["status_chamado"] }; Returns: boolean
                           },
"transicao_chamado_permitida":
{ Args: { "de": Database["public"]['Enums']["status_chamado"],"equipe": boolean,"para": Database["public"]['Enums']["status_chamado"],"solicitante": boolean }; Returns: boolean
                           },
"transicao_ordem_permitida":
{ Args: { "de": Database["public"]['Enums']["status_ordem"],"para": Database["public"]['Enums']["status_ordem"] }; Returns: boolean
                           },
"verificar_conexao":
{ Args: Record<PropertyKey, never>; Returns: Json
                           }
          }
          Enums: {
            "categoria_chamado": "falha"|"desempenho"|"seguranca"|"melhoria"|"outro","categoria_equipamento": "informatica"|"eletrica"|"mecanica"|"climatizacao"|"laboratorio"|"mobiliario"|"outro","estado_equipamento": "disponivel"|"em_manutencao"|"inativo","papel_usuario": "solicitante"|"tecnico"|"administrador","prioridade_chamado": "baixa"|"media"|"alta"|"critica","resultado_ordem": "resolvido"|"parcial"|"nao_resolvido","status_chamado": "aberto"|"em_triagem"|"em_atendimento"|"aguardando"|"resolvido"|"encerrado","status_ordem": "planejada"|"em_execucao"|"concluida"|"cancelada","tipo_manutencao": "corretiva"|"preventiva"|"evolutiva"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "categoria_chamado": ["falha", "desempenho", "seguranca", "melhoria", "outro"],"categoria_equipamento": ["informatica", "eletrica", "mecanica", "climatizacao", "laboratorio", "mobiliario", "outro"],"estado_equipamento": ["disponivel", "em_manutencao", "inativo"],"papel_usuario": ["solicitante", "tecnico", "administrador"],"prioridade_chamado": ["baixa", "media", "alta", "critica"],"resultado_ordem": ["resolvido", "parcial", "nao_resolvido"],"status_chamado": ["aberto", "em_triagem", "em_atendimento", "aguardando", "resolvido", "encerrado"],"status_ordem": ["planejada", "em_execucao", "concluida", "cancelada"],"tipo_manutencao": ["corretiva", "preventiva", "evolutiva"]
          }
        }
} as const
