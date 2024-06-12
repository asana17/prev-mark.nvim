# Node.js scripts

Before running scripts:

```bash
npm install
```

## `server.js`

Start a simple local http server.

To run:

```bash
node server.js <port> <directory>
```

Access `localhost:<port>/<html file>` to see `<html file>` content in `<directory>`.

## Before commit

Use `eslint` and `prettier` for Node.js codes.
If `eslint` requires the latest Node.js, do:

```bash
npm install -g n
n lts
n latest
prune
```

These comands can require `sudo`.

You can run `eslint` and `prettier` by:

```bash
npx eslint .
npx prettier . --write
```
