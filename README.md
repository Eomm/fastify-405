# fastify-405

[![Coverage Status](https://coveralls.io/repos/github/Eomm/fastify-405/badge.svg?branch=master)](https://coveralls.io/github/Eomm/fastify-405?branch=master) [![Build Status](https://travis-ci.com/Eomm/fastify-405.svg?branch=master)](https://travis-ci.com/Eomm/fastify-405) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Add 405 Method Not Allowed HTTP status to your routes, instead of the default 404.


## Install

```
npm install fastify-405
```

This plugin support Node.js >=6 and Fastify ^2

## Usage

Register the plugin with some custom option. It will add an `onRoute` hook and will add an handler
that replay with HTTP status 405 and the `allow` response header.

The `allow` header will contains what you define in the options.

This plugin has been tested also with the encapsulation!

```js
const fastify = require('fastify')()

fastify.register(require('fastify-405'), {
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

fastify.listen(3000, err => {
  if (err) throw err
  console.log('Server listening at http://localhost:3000')
})
```

### Options

You can pass the following options during the registration:

| Option | Default | Description |
|--------|---------|-------------|
|`regexp`| `/.*/`  | The regular expression the route must fulfil in order to add the 405 handler
|`allow` | `['GET', 'POST']` | The method that the route will allow, the HTTP methods that are not in this array will reply 405

```js
fastify.register(require('fastify-rate-limit'), {
  regexp: /\/foo.*/, // must be a regular expression
  allow: ['GET', 'POST'] // could be only a subset of: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
})
```


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
