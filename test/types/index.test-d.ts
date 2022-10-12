import { expectType } from 'tsd'

import fastify from 'fastify'
import fastify405 from '../../index'

const app = fastify()

app
  .register(fastify405, {
    regexp: /\/foo.*/,
    allow: ['GET', 'HEAD']
  })
  .after((_) => {
    app.get('/foo-bar', () => 'done')
  })
  .inject({
    url: '/foo-bar',
    method: 'POST'
  })
  .then((res) => {
    expectType<number>(res.statusCode)
  })