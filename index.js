'use strict'

const fp = require('fastify-plugin')

const kIgnore = Symbol('fastify-405:ignoreOnRoute')
const HTTP_METHODS = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'TRACE']

function fourOhfive (fastify, opts, next) {
  const options = Object.assign({
    regexp: /.*/,
    allow: ['GET', 'POST']
  }, opts)

  if (!(options.regexp instanceof RegExp)) {
    next(new Error('Options.regexp must be a regular expression'))
    return
  }
  if (!Array.isArray(options.allow) || !options.allow.reduce((acc, m) => acc && HTTP_METHODS.includes(m), true)) {
    next(new Error(`Options.allow must be an array with only these values: ${HTTP_METHODS}`))
    return
  }

  const unAllow = HTTP_METHODS.filter(_ => !options.allow.includes(_))
  const preAllow = options.allow.join(', ')

  const registered = new Map()

  fastify.addHook('onRoute', function support405 (routeOptions) {
    if ((routeOptions.config || {}).ignore === kIgnore) {
      return
    }

    fastify.log.trace('Evaluating [%o] [%s] url', routeOptions.method, routeOptions.url)

    const is405Url = options.regexp.test(routeOptions.url)
    if (!is405Url) {
      fastify.log.debug('Reject url [%s] not match the regexp [%s]', routeOptions.url, options.regexp)
      return
    }

    let method
    if (typeof routeOptions.method === 'string') {
      method = routeOptions.method
    } else {
      method = routeOptions.method[0]
    }

    const isAllowed = options.allow.includes(method)
    const isAlreadyRegistered = registered.has(routeOptions.url)
    if (!isAllowed || isAlreadyRegistered) {
      fastify.log.trace('Url [%s] already registered for 405 methods %o', routeOptions.url, unAllow)
      return
    }

    registered.set(routeOptions.url, true)

    fastify.log.debug('Adding 405 routes for [%s] with methods %o', routeOptions.url, unAllow)
    fastify.route({
      method: unAllow,
      path: routeOptions.routePath,
      config: { ignore: kIgnore },
      handler: (req, reply) => {
        reply
          .code(405)
          .header('allow', preAllow)
          .send()
      }
    })
  })

  next()
}

module.exports = fp(fourOhfive, {
  fastify: '^5',
  name: 'fastify-405'
})
