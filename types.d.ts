export interface CookieOption {
  signed?: boolean
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number | null
  path?: string
  sameSite?: boolean | 'lax' | 'none' | 'strict'
  secure?: boolean
}