import type { FastifyPluginCallback, HTTPMethods } from 'fastify'

export interface Fastify405Options {
  /**
   * The regular expression the route must fulfil in order to add the 405 handler
   * @default "/.*\/"
   */
   regexp?: RegExp,

  /**
   * The method that the route will allow, the HTTP methods that are not in this array will reply 405
   * @default ["GET", "POST"]
   */
   allow?: HTTPMethods[],
}

export const Fastify405: FastifyPluginCallback<Fastify405Options>
export default Fastify405
