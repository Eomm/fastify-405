'use strict'
const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastify405 = require('../plugin')

const handler = (req, reply) => { reply.send('hello') }

// count 2 test for the plan
async function inject (t, method, status, url = '/', msg) {
  const res = await this.inject({ method, url })
  t.equal(res.statusCode, status, msg)
}

test('Should load correctly the plugin', t => {
  t.plan(1)
  const app = Fastify({ exposeHeadRoutes: false })
  app.register(fastify405)
  app.ready(t.error)
})

test('Should register 405 routes except GET and POST', async t => {
  const app = Fastify({ exposeHeadRoutes: false })
  await app.register(fastify405)
  app.get('/', handler)

  await inject.call(app, t, 'GET', 200)
  await inject.call(app, t, 'POST', 404)
  await inject.call(app, t, 'HEAD', 405)
  await inject.call(app, t, 'PUT', 405)
  await inject.call(app, t, 'DELETE', 405)
  await inject.call(app, t, 'OPTIONS', 405)
  await inject.call(app, t, 'PATCH', 405)
})

test('Should register 405 routes with final slash', async t => {
  const app = Fastify({ exposeHeadRoutes: true })
  app.get('/path', handler)
  await app.register(fastify405)
  app.get('/path/', handler)

  app.get('/second', handler)
  app.get('/second/', handler)

  await inject.call(app, t, 'GET', 200, '/path')
  await inject.call(app, t, 'GET', 200, '/path/')
  await inject.call(app, t, 'GET', 200, '/second')
  await inject.call(app, t, 'GET', 200, '/second/')

  await inject.call(app, t, 'HEAD', 200, '/path', 'route registered before the plugin')
  await inject.call(app, t, 'HEAD', 405, '/path/')
  await inject.call(app, t, 'HEAD', 405, '/second')
  await inject.call(app, t, 'HEAD', 405, '/second/')
})

test('Should register 405 routes only for not-set methods', async t => {
  const app = Fastify({ exposeHeadRoutes: false })
  await app.register(fastify405, { allow: ['GET', 'HEAD', 'OPTIONS', 'PUT'] })
  app.get('/', handler)
  app.head('/', handler)
  app.options('/', handler)

  await inject.call(app, t, 'GET', 200)
  await inject.call(app, t, 'POST', 405)
  await inject.call(app, t, 'HEAD', 200)
  await inject.call(app, t, 'PUT', 404)
  await inject.call(app, t, 'DELETE', 405)
  await inject.call(app, t, 'OPTIONS', 200)
  await inject.call(app, t, 'PATCH', 405)
})

test('Should avoid 405 routes for some URL', async t => {
  const app = Fastify({ exposeHeadRoutes: false })
  await app.register(fastify405, { regexp: /\/route42.*/ })

  app.get('/', handler)
  app.get('/route4', handler)
  app.get('/route42', handler)
  app.get('/route42/hello', handler)

  await inject.call(app, t, 'GET', 200, '/')
  await inject.call(app, t, 'GET', 200, '/route4')
  await inject.call(app, t, 'GET', 200, '/route42')
  await inject.call(app, t, 'GET', 200, '/route42/hello')

  await inject.call(app, t, 'PUT', 404, '/')
  await inject.call(app, t, 'PUT', 404, '/route4')
  await inject.call(app, t, 'PUT', 405, '/route42')
  await inject.call(app, t, 'PUT', 405, '/route42/hello')
})

test('Should avoid 405 routes for URL registered before', async t => {
  const app = Fastify({ exposeHeadRoutes: false })

  app.route({ method: ['GET', 'POST'], url: '/', handler })
  await app.register(fastify405)
  app.route({ method: ['GET', 'POST'], url: '/route4', handler })

  await inject.call(app, t, 'GET', 200, '/')
  await inject.call(app, t, 'GET', 200, '/route4')

  await inject.call(app, t, 'POST', 200, '/')
  await inject.call(app, t, 'POST', 200, '/route4')

  await inject.call(app, t, 'PUT', 404, '/')
  await inject.call(app, t, 'PUT', 405, '/route4')
})

test('Should register 405 in a encapsulated context', async t => {
  const app = Fastify({ exposeHeadRoutes: true })
  await app.register(async (instance, opts) => {
    await instance.register(fastify405)
    instance.get('/', handler)
  }, { prefix: '/prefix' })

  app.get('/', handler)

  await inject.call(app, t, 'GET', 200, '/')
  await inject.call(app, t, 'HEAD', 200, '/', 'registered by fastify by default')
  await inject.call(app, t, 'POST', 404, '/')
  await inject.call(app, t, 'PUT', 404, '/')

  await inject.call(app, t, 'GET', 200, '/prefix')
  await inject.call(app, t, 'POST', 404, '/prefix')
  await inject.call(app, t, 'PUT', 405, '/prefix')
})

test('Should fail with wrong regexp settings', t => {
  t.plan(2)
  const app = Fastify({ exposeHeadRoutes: false })
  app.register(fastify405, { regexp: 'not a reg exp', allow: 'not an array' })
  app.ready((err) => {
    t.type(err, Error)
    t.equal(err.message, 'Options.regexp must be a regular expression')
  })
})

test('Should fail with wrong allow settings', t => {
  t.plan(2)
  const app = Fastify({ exposeHeadRoutes: false })
  app.register(fastify405, { allow: 'not a valid array' })
  app.ready((err) => {
    t.type(err, Error)
    t.equal(err.message, 'Options.allow must be an array with only these values: GET,POST,HEAD,PUT,DELETE,OPTIONS,PATCH')
  })
})

test('Should fail with wrong allow array settings', t => {
  t.plan(2)
  const app = Fastify({ exposeHeadRoutes: false })
  app.register(fastify405, { allow: ['foo'] })
  app.ready((err) => {
    t.type(err, Error)
    t.equal(err.message, 'Options.allow must be an array with only these values: GET,POST,HEAD,PUT,DELETE,OPTIONS,PATCH')
  })
})
