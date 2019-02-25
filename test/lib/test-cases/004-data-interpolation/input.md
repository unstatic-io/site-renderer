## Foo
Value of `foo` is `${foo}`, as in ${foo}

## Bar Baz
Value of `bar.baz` is `${bar.baz}`

## Quux
Value of `&dollar;{quux}` is `${quux}`

## Xyzzy
Value of `&dollar;{xyzzy}` is `${xyzzy}`, but it won't appear in the code snippet below
```js
console.log(`${xyzzy}`);
```

## Foobarception
Sometimes your needs depend on some other thing you need:
- `&dollar;{bar.&dollar;{foo}}` = `${bar.${foo}}`
- `&dollar;{bar[&dollar;{foo}]}` = `${bar[${foo}]}`