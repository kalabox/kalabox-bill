# Bill

Woah! It's a simple REST server to run scripts on a machine!

## Installation

Grab a pre-compiled binary from the [releases page](https://github.com/kalabox/kalabox-bill/releases), make executable and add to your PATH.

Or install with NPM

```
npm install -g kalabox-bill

```

## Usage

```
bill.js -d
```

or for a custom port...

```
/node_modules/kalabox-bill/bin/bill.js -d -p 1989
```

## Running Bill as a start up service

### Darwin

Build an app with automater and add it to your login items.

http://stackoverflow.com/questions/6442364/running-script-upon-login-mac/6445525#6445525

### Windows

### Linux

## Building Bill

You need `grunt-cli` and `jxcore` installed.

```
git clone https://github.com/kalabox/kalabox-bill.git
cd kalabox-bill
npm install
grunt build
```

Your Bill binary will live in `dist/`
