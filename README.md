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
export const analytics = metrics.resolve((parent, args, request) => {
  return db.query('select * from analytics')
})
```

listen to the query / mutation side
```js
// schema.js
export default new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => metrics.fields({
    user: {
      type: UserType,
      resolve: (parent, args, request) => {
        return db.query(`select * from users where id = $1`, [request.userId])
      },
    },
  }),
})
```
