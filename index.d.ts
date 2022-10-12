import type { FastifyPluginCallback, HTTPMethods } from 'fastify'

export interface Fastify405Options {
  /**
   * Expose a route that will return the JSON structure.
   * By default the route is exposed at `GET /json-overview`.
   * @default "/.*\/"
   */
   regexp?: RegExp,

  /**
   * Customize the route's options when `exposeRoute` is set to `true`
   */
   allow?: HTTPMethods[],
}

export const Fastify405: FastifyPluginCallback<Fastify405Options>
export default Fastify405
