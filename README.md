# graphql-prometheus

a thin layer to measure the resolvers and queries initiated in your grpahql setup

## install

```
npm i graphql-prometheus
```

```js
// import the package
import * as metrics from 'graphql-prometheus'
```

register the metrics, pass in a reporter if you want to create your own
```js
// use default, global register
metrics.register()

// or
metrics.register({ registers: [register] })

// or
const registry = new Registry(registers)
metrics.register(registry)
```

listen to each resolve function
```js
// resolvers.js

// measure timing for this resolver, no matter where it is used
export const analytics = metrics.resolver((parent, args, request) => {
  return db.query('select * from analytics')
})
```

listen to the query / mutation side
```js
// query.js
// use the request method(s) for root entries,
// to only measure complete queries once
const user = {
  type: UserType,
  resolve: metrics.request((parent, args, request) => {
    return await db.getUser(request.userId)
  }),
}

export const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user,
  })
})

// or
export const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => metrics.requests({
    user: {
      type: UserType,
      resolve: (parent, args, request) => {
        return await db.getUser(request.userId)
      },
    },
  }),
})
```

```js
// mutation.js
export const mutation = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: () => metrics.requests({
    createItem: {
      type: ItemType,
      args: {
        name: { type: graphql.GraphQLString },
      },
      resolve: async (parent, args, request) => {
        return await db.insertItem(args.name)
      },
    },
  }),
})
```
