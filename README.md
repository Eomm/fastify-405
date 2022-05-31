# fastify-405

[![Build Status](https://github.com/Eomm/fastify-405/workflows/ci/badge.svg)](https://github.com/Eomm/fastify-405/actions)
[![npm](https://img.shields.io/npm/v/fastify-405)](https://www.npmjs.com/package/fastify-405)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Add 405 Method Not Allowed HTTP status to your routes, instead of the default 404.


## Install

```
npm install fastify-405
```

### Compatible

| Plugin version | Fastify version |
| ------------- |:---------------:|
| `^1.0.0` | `^2.0.0` |
| `^2.0.0` | `^3.2.0` |
| `^3.0.0` | `^4.0.0` |


## Usage

Register the plugin with some custom option.
It will add an `onRoute` hook and will add an handler
that replay with HTTP status 405 and the `allow` response header.

The `allow` header will contains what you define in the options.

This plugin has been tested also with the encapsulation!

```js
import Fastify from 'fastify'

const fastify = Fastify()
await fastify.register(import('fastify-405'), {
  regexp: /\/foo.*/,
  allow: ['GET', 'HEAD']
})

// This route will reply 405 on POST, HEAD, OPTIONS, PUT..
fastify.get('/foo', (req, reply) => {
  reply.send({ hello: 'world' })
})

// This route will not match the fastify-405 regexp and will reply with 404 on other HTTP methods
fastify.get('/bar', (req, reply) => {
  reply.send({ hello: 'world' })
})

await fastify.listen({ port: 3000 })
console.log('Server listening at http://localhost:3000')
```

> **Note**
> You need to `await` the plugin registration to make sure the plugin is ready to use.
> All the routes defined **before** the plugin registration will be ignored.
> This change has been introduced in Fastify v4.

### Options

You can pass the following options during the registration:

| Option | Default | Description |
|--------|---------|-------------|
|`regexp`| `/.*/`  | The regular expression the route must fulfil in order to add the 405 handler
|`allow` | `['GET', 'POST']` | The method that the route will allow, the HTTP methods that are not in this array will reply 405

```js
await fastify.register(require('fastify-405'), {
  regexp: /\/foo.*/, // must be a regular expression
  allow: ['GET', 'POST'] // could be only a subset of: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
})
```


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
