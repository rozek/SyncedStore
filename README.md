# SyncedStore CRDT

[![npm version](https://badge.fury.io/js/%40syncedstore%2Fcore.svg)](https://badge.fury.io/js/%40syncedstore%2Fcore) [![Coverage Status](https://coveralls.io/repos/github/YousefED/SyncedStore/badge.svg?branch=main)](https://coveralls.io/github/YousefED/SyncedStore?branch=main)

<a href="https://discord.gg/exFZg6X2XU"><img alt="Discord" src="https://img.shields.io/badge/Chat on discord%20-%237289DA.svg?&style=for-the-badge&logo=discord&logoColor=white"/></a>

<small><i>(This library was previously called "Reactive-CRDT")</i></small>

SyncedStore is an easy-to-use library for building collaborative applications that sync automatically. It's built on top of [Yjs](https://github.com/yjs/yjs), a proven, high performance CRDT implementation.

> **Nota bene**: this fork has been created in order to keep the original project (which seems to be inactive) up-to-date with Yjs. However, this basically covers the `core` sub-package only, not any of the others.

## TL;DR

Create apps like this:

[![SyncedStore CRDT screencapture](https://raw.githubusercontent.com/YousefED/syncedstore/main/syncedstore-2.gif)](https://syncedstore.org/docs/react)

_[Play with this example](https://syncedstore.org/docs/react)_

Using an API as simple as this:

```typescript
// add a todo
store.todos.push({ completed: false, title: "Get groceries" });

// set todo to completed
store.todos[0].completed = true;
```

# Documentation

### [View the documentation with interactive code samples](https://syncedstore.org/docs/)

You can find the SyncedStore documentation
[on the website](https://syncedstore.org/).

- [Getting Started](https://syncedstore.org/docs/basics/installation)
- [Working with React](https://syncedstore.org/docs/react)
- [Working with Vue](https://syncedstore.org/docs/vue)
- [Working with Svelte](https://syncedstore.org/docs/svelte)
- [Collaborative text editing](https://syncedstore.org/docs/advanced/richtext)
- [Sync providers](https://syncedstore.org/docs/sync-providers)

## Examples

We have several examples [on the website](https://syncedstore.org/) ([React](https://syncedstore.org/docs/react), [Vue](https://syncedstore.org/docs/vue), [Svelte](https://syncedstore.org/docs/svelte)) as part of the documentation.

In this repository, there are also more complex examples based on TodoMVC ([examples/todo-react](https://github.com/YousefED/syncedstore/tree/main/examples/todo-react), [examples/todo-vue](https://github.com/YousefED/syncedstore/tree/main/examples/todo-vue), [examples/todo-svelte](https://github.com/YousefED/syncedstore/tree/main/examples/todo-svelte)).

[![example app screencapture](https://raw.githubusercontent.com/YousefED/syncedstore/main/syncedstore.gif)](https://github.com/YousefED/syncedstore/tree/main/examples/)

- Open live demo: [React](https://ze3vo.csb.app/) or [Vue](https://uie1c.csb.app/) (Of course, open multiple times to test multiplayer)
- Edit / view on Codesandbox [React](https://codesandbox.io/s/todo-react-ze3vo) / [Vue](https://codesandbox.io/s/todo-vue-uie1c)

# Motivation

SyncedStore makes it easy to develop applications that:

- 👨‍👩‍👧‍👦 **Are collaborative**: create multi-user and multi-device experiences without the need to handle complex conflict resolution management yourself.
- 🚀 **Are fast**: operations are handled locally, and data synchronization with other users and devices happens quietly in the background. 0 Latency!
- 🔗 **Work offline**: cloud apps typically don’t work while offline. Supporting both data sync and offline used to be difficult, SyncedStore aims to simplify this.

Perhaps most importantly, it makes it easy to build **decentralized applications**. This has a lot of security & privacy benefits compared to always relying on central (expensive) servers to keep track of all our data.

> Read more about [the benefits of Local-first software in this essay](https://www.inkandswitch.com/local-first.html)

In short, with some technological magic of so-called [CRDTs](https://crdt.tech/) (_Conflict-free Replicated Data Types_), we can build _cross-device_ apps that are _more collaborative_, _faster_, _work offline_ AND put the user _back in control of their data_.

# Feedback

I'd always love to hear how you're using SyncedStore. Definitely open an issue if you need help, get in touch via [Twitter](https://www.twitter.com/yousefed), or join the discussion in the [Yjs forums](https://discuss.yjs.dev/).

# Credits ❤️

SyncedStore builds directly on [Yjs](https://github.com/yjs/yjs) and [Reactive](https://www.github.com/yousefed/reactive). It's also inspired by and builds upon the amazing work by [MobX](https://mobx.js.org/) and [NX Observe](https://github.com/nx-js/observer-util).

SyncedStore is built as part of [TypeCell](https://www.typecell.org). TypeCell is proudly sponsored by the renowned [NLNet foundation](https://nlnet.nl/foundation/) who are on a mission to support an open internet, and protect the privacy and security of internet users. Check them out!

<a href="https://nlnet.nl"><img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NLNet" width="100"></a>
