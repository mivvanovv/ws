import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { HttpLink, split, ApolloClient, InMemoryCache } from "@apollo/client/core"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"

import App from './App.vue'

// Create an http link:
const httpLink = new HttpLink({
  // uri: "http://localhost:3000/graphql"
  uri: 'https://api.dev.archive.avicii.com/graphql'
})

// Socket API link:
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.dev.archive.avicii.com/graphql',
    // url: 'ws://localhost:3000/graphql',
    options: {
      reconnect: true,
    },
    headers: {
      "Sec-Websocket-Protocol": "graphql-ws"
    },
    connectionParams: {
      accessToken: "xxxxx"
    },
    on: {
      opened() {console.log('opened')},
      closed() {console.log('closed')},
      connected() {console.log('connected')},
      ping() {console.log('ping')},
      pong() {console.log('pong')},
      message(m) {console.log("message", m)},
      error(e) {console.log(e)},
    }
  })
)

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  httpLink
)

// Create the apollo client with cache implementation.
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render() {
    return h(App);
  }
})

app.mount('#app')
