'use strict'
const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastify405 = require('../plugin')

const handler = (req, reply) => { reply.send('hello') }

// count 2 test for the plan
function inject (t, method, status, url = '/') {
  this.inject({ method, url }, (err, res) => {
    t.error(err)
    t.strictEqual(res.statusCode, status)
  })
}

test('Should load correctly the plugin', t => {
  t.plan(1)
  const app = Fastify()
  app.register(fastify405)
  app.ready(t.error)
})

test('Should register 405 routes except GET and POST', t => {
  t.plan(14)
  const app = Fastify()
  app.register(fastify405)
  app.get('/', handler)

  inject.call(app, t, 'GET', 200)
  inject.call(app, t, 'POST', 404)
  inject.call(app, t, 'HEAD', 405)
  inject.call(app, t, 'PUT', 405)
  inject.call(app, t, 'DELETE', 405)
  inject.call(app, t, 'OPTIONS', 405)
  inject.call(app, t, 'PATCH', 405)
})

test('Should register 405 routes with final slash', t => {
  t.plan(16)
  const app = Fastify()
  app.get('/path', handler)
  app.register(fastify405)
  app.get('/path/', handler)

  app.get('/second', handler)
  app.get('/second/', handler)

  inject.call(app, t, 'GET', 200, '/path')
  inject.call(app, t, 'GET', 200, '/path/')
  inject.call(app, t, 'GET', 200, '/second')
  inject.call(app, t, 'GET', 200, '/second/')

  inject.call(app, t, 'HEAD', 404, '/path')
  inject.call(app, t, 'HEAD', 405, '/path/')
  inject.call(app, t, 'HEAD', 405, '/second')
  inject.call(app, t, 'HEAD', 405, '/second/')
})

test('Should register 405 routes only for not-set methods', t => {
  t.plan(14)
  const app = Fastify()
  app.register(fastify405, { allow: ['GET', 'HEAD', 'OPTIONS', 'PUT'] })
  app.get('/', handler)
  app.head('/', handler)
  app.options('/', handler)

  inject.call(app, t, 'GET', 200)
  inject.call(app, t, 'POST', 405)
  inject.call(app, t, 'HEAD', 200)
  inject.call(app, t, 'PUT', 404)
  inject.call(app, t, 'DELETE', 405)
  inject.call(app, t, 'OPTIONS', 200)
  inject.call(app, t, 'PATCH', 405)
})

test('Should avoid 405 routes for some URL', t => {
  t.plan(16)
  const app = Fastify()
  app.register(fastify405, { regexp: /\/route42.*/ })

  app.get('/', handler)
  app.get('/route4', handler)
  app.get('/route42', handler)
  app.get('/route42/hello', handler)

  inject.call(app, t, 'GET', 200, '/')
  inject.call(app, t, 'GET', 200, '/route4')
  inject.call(app, t, 'GET', 200, '/route42')
  inject.call(app, t, 'GET', 200, '/route42/hello')

  inject.call(app, t, 'PUT', 404, '/')
  inject.call(app, t, 'PUT', 404, '/route4')
  inject.call(app, t, 'PUT', 405, '/route42')
  inject.call(app, t, 'PUT', 405, '/route42/hello')
})

test('Should avoid 405 routes for URL registered before', t => {
  t.plan(12)
  const app = Fastify()

  app.route({ method: ['GET', 'POST'], url: '/', handler })
  app.register(fastify405)
  app.route({ method: ['GET', 'POST'], url: '/route4', handler })

  inject.call(app, t, 'GET', 200, '/')
  inject.call(app, t, 'GET', 200, '/route4')

  inject.call(app, t, 'POST', 200, '/')
  inject.call(app, t, 'POST', 200, '/route4')

  inject.call(app, t, 'PUT', 404, '/')
  inject.call(app, t, 'PUT', 405, '/route4')
})

test('Should register 405 in a encapsulated context', t => {
  t.plan(12)
  const app = Fastify()
  app.register((instance, opts, next) => {
    instance.register(fastify405)
    instance.get('/', handler)
    next()
  }, { prefix: '/prefix' })

  app.get('/', handler)

  inject.call(app, t, 'GET', 200, '/')
  inject.call(app, t, 'POST', 404, '/')
  inject.call(app, t, 'HEAD', 404, '/')

  inject.call(app, t, 'GET', 200, '/prefix')
  inject.call(app, t, 'POST', 404, '/prefix')
  inject.call(app, t, 'HEAD', 405, '/prefix')
})

test('Should fail with wrong regexp settings', t => {
  t.plan(2)
  const app = Fastify()
  app.register(fastify405, { regexp: 'not a reg exp', allow: 'not an array' })
  app.ready((err) => {
    t.type(err, Error)
    t.strictEqual(err.message, 'Options.regexp must be a regular expression')
  })
})

test('Should fail with wrong allow settings', t => {
  t.plan(2)
  const app = Fastify()
  app.register(fastify405, { allow: 'not a valid array' })
  app.ready((err) => {
    t.type(err, Error)
    t.strictEqual(err.message, 'Options.allow must be an array with only these values: GET,POST,HEAD,PUT,DELETE,OPTIONS,PATCH')
  })
})

test('Should fail with wrong allow array settings', t => {
  t.plan(2)
  const app = Fastify()
  app.register(fastify405, { allow: ['foo'] })
  app.ready((err) => {
    t.type(err, Error)
    t.strictEqual(err.message, 'Options.allow must be an array with only these values: GET,POST,HEAD,PUT,DELETE,OPTIONS,PATCH')
  })
})
