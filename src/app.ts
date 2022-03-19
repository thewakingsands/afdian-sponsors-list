import createFastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import prettifier from '@mgcrea/pino-pretty-compact'
import { Afdian } from './afdian'
import fastifyCors from 'fastify-cors'
import { Cache } from './cache'

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const importDynamic = new Function('modulePath', 'return import(modulePath)')

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

async function buildFastify(
  options: FastifyServerOptions = {},
): Promise<FastifyInstance> {
  const fastify = createFastify({
    logger: { prettyPrint: true, prettifier } as any,
    ...options,
  })

  const fastifyHttpErrorsEnhanced = await importDynamic(
    'fastify-http-errors-enhanced',
  )
  await fastify.register(fastifyHttpErrorsEnhanced.default)
  await fastify.register(fastifyCors)

  return fastify
}

async function start() {
  const app = await buildFastify()
  const afdian = new Afdian(
    process.env.AFDIAN_USER_ID!,
    process.env.AFDIAN_API_TOKEN!,
  )

  const cache = new Cache<Awaited<ReturnType<Afdian['getSponsors']>>>(
    5 * 60 * 1000,
  )

  app.get('/sponsors', async (request, reply) => {
    // const page = (request.query as any).page || 1
    if (!cache.get()) {
      cache.set(await afdian.getSponsors(1))
    }
    const body = cache.get()
    await reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(body)
  })

  await app.listen(process.env.PORT || 8809)
}

start().catch(console.error)
