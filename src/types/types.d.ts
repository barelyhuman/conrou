// Any interface that satisfies this should be fine
// doesn't have to be an express.js specific router
// this allows you to move it around
// into any http server instance
export interface RouterInterface {
  get(url: string, handler: any): Promise<void>
  post(url: string, handler: any): Promise<void>
  put(url: string, handler: any): Promise<void>
  post(url: string, handler: any): Promise<void>
}
