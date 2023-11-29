import type { Elysia } from 'elysia'
import type { CookieOption } from './types'
import { defaultCookieOption } from './constants'

class Cookie {
  static cookies: any = {}

  static parse(cookieValue: string[]): any {
    if (!cookieValue) {
      return new Error("Cookie is required!")
    } 
    cookieValue.forEach((_cookie: string) => {
      let [key, value] = _cookie.split("=")
      this.cookies[key.trim()] = value
    })
    return this.cookies
  }

  static sign(value: string, secret: string): string {
    return value + '.' + new Bun.CryptoHasher("sha256")
                          .update(secret)
                          .digest("base64")
                          .replace(/\=+$/, '');
  }
}

export const cookieMiddleware = function(secret: string) {
  return (app: Elysia) => {
    let _cookies: any = {}
    let _signedCookies: any = {}

    app.derive(({ set }) => {
      let cookieFeatures = {}
      Object.assign(cookieFeatures, {
        setCookie: (name: string, value: string, options?: CookieOption) => {
          options = Object.assign(defaultCookieOption, options)
          if (options?.signed) {
            value = Cookie.sign(value, secret)
            _signedCookies[name] = value
          } else {
            _cookies[name] = value
          }
          let template = `
            ${name}=${value};
            ${options?.httpOnly ? "HttpOnly;": ""}
            ${options?.secure ? "Secure;" : ""}
            ${options?.path ? `Path=${options?.path};` : ""}
            ${
              options?.sameSite === true ? "SameSite=Strict;" : (
                options?.sameSite === false ? "" : `SameSite=${options?.sameSite};`
              )
            }
            ${options?.domain ? `Domain=${options?.domain};` : ""}
            ${options?.maxAge ? `Max-Age=${options?.maxAge};` : ""}
            ${options?.expires ? `Expires=${options?.expires};` : ""}
          `.replace(/\n/gm, "")
          if (!Array.isArray(set.headers['Set-Cookie'])) {
            set.headers['Set-Cookie'] = []
          }
          set.headers['Set-Cookie'].push(template)
        },
        destroyCookie: (name: string) => {
          set.headers['Set-Cookie'] = [...(set.headers['Set-Cookie'] as string[]).filter(_c => {
            return _c.trim().split("=")[0] !== name
          }), `${name}="";Max-Age=0`]
          _cookies[name] && delete _cookies[name]
          _signedCookies[name] && delete _signedCookies[name]
        },
        get cookies(): Object {
          return _cookies
        },
        get signedCookies(): Object {
          return _signedCookies
        }
      })
      Object.freeze(cookieFeatures)
      return cookieFeatures
    })

    return app
  }
}