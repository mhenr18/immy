# Immy - change-tracked data structures with an immutable API

Immy takes change-tracked data structures and makes them look immutable.
In many cases, this gives you the programmatic benefits of immutable data
structures as well as the benefits of near-native performance for mutations.

## What makes Immy different to other immutable data libraries?

Other immutable data structure libraries tend to use implementations that
rely on structural sharing of trees. When you create a new data structure
from an existing one, the old data structure remains unchanged.

Immy relies on keeping track of changes to a single underlying data structure
(think of Git for in-memory data structures). When you create a new data
structure from an existing one, the underlying data structure is stolen from
the old one and given to the new one with the change applied. This leaves the
old data structure with a reference to the new one, and a diff that can be 
applied to reverse the change and get back to the old state.

Compared to a structural sharing approach, Immy's change tracking can result
in significant performance and memory benefits for many cases. However, this
comes at the cost of poor performance when accessing older data structures.
As such, you should consider whether Immy is appropriate for your use case
before deciding to use it over other libraries.

## What are these performance benefits that you're talking about?

Check out the code and execute `npm run benchmark` at a terminal.

*TODO: include benchmark info in the README*

## Is Immy right for me?

If your usage of immutable data structures tends to be like this:

```
for (i = 0; i < 1000000; ++i) {
  foo = foo.push(i)
}

doSomething(foo)
```

then Immy will be an extremely good fit for you. If you rely on being able
to frequently access "older" versions of immutable data structures, like this:

```
var bar = foo

for (i = 0; i < 1000000; ++i) {
  foo = foo.push(i)
}

doSomething(foo, bar)
```

then Immy might not be the best fit for your use case.
