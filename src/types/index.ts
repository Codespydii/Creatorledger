export interface SessionPayload {
  userId: string
  email: string
  expiresAt: Date
}

export type ActionState<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | undefined
