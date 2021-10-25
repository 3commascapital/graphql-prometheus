import * as promClient from 'prom-client'
import { Reporter } from './reporter'

export const registers = [promClient.register]

export const reporter = new Reporter()

export const register = (rep: Reporter = reporter) => {
  const { registers } = rep
  rep.metric('resolved', new promClient.Counter({
    name: 'graphql_queries_resolved',
    help: 'The amount of GraphQL queries that have had their operation resolved.',
    labelNames: ['operationName', 'operation'],
    registers,
  }))
  rep.metric('startedExecuting', new promClient.Counter({
    name: 'graphql_queries_execution_started',
    help: 'The amount of GraphQL queries that have started executing.',
    labelNames: ['operationName', 'operation'],
    registers,
  }))
  rep.metric('encounteredErrors', new promClient.Counter({
    name: 'graphql_queries_errored',
    help: 'The amount of GraphQL queries that have encountered errors.',
    labelNames: ['operationName', 'operation'],
    registers,
  }))
  rep.metric('responded', new promClient.Counter({
    name: 'graphql_queries_responded',
    help: 'The amount of GraphQL queries that have been executed and been attempted to send to the client. This includes requests with errors.',
    labelNames: ['operationName', 'operation'],
    registers,
  }))
  rep.metric('resolverTime', new promClient.Histogram({
    name: 'graphql_resolver_time',
    help: 'The time to resolve a GraphQL field.',
    labelNames: ['parentType', 'fieldName', 'returnType'],
    registers,
  }))
  rep.metric('resolverError', new promClient.Counter({
    name: 'graphql_resolver_error',
    help: 'The time to resolve to an error.',
    labelNames: ['parentType', 'fieldName', 'returnType'],
    registers,
  }))
  rep.metric('totalRequestTime', new promClient.Histogram({
    name: 'graphql_total_request_time',
    help: 'The time to complete a GraphQL query.',
    labelNames: ['operationName', 'operation'],
    registers,
  }))
}

export const resolve = (resolver, rep: Reporter = reporter) => async (...inputs) => {
  const [parent, args, request, parsed] = inputs
  const labels = {
    parentType: parsed.operation.operation,
    fieldName: parsed.fieldName,
    returnType: parsed.returnType.toString(),
  }
  const timer = rep.histogram('resolverTime').startTimer(labels)
  try {
    const result = await resolver(...inputs)
    return result
  } catch (err) {
    rep.counter('resolverError').inc(labels)
    throw err
  } finally {
    timer()
  }
}

export const field = (resolve, rep: Reporter = reporter) => async (...inputs) => {
  const [parent, args, context, parsed] = inputs
  const labels = {
    fieldName: parsed.fieldName,
    operation: parsed.operation.operation,
  }
  rep.counter('startedExecuting').inc(labels)
  const timer = rep.histogram('totalRequestTime').startTimer(labels)
  try {
    const result = await resolve(...inputs)
    rep.counter('resolved').inc(labels)
    return result
  } catch (err) {
    rep.counter('encounteredErrors').inc(labels)
    throw err
  } finally {
    timer()
  }
}

export const fields = (targets, rep: Reporter = reporter) => {
  for (let [key, value] of Object.entries<{resolve: (parent, args, context, parse) => {}}>(targets)) {
    value.resolve = field(value.resolve, rep)
  }
  return targets
}
