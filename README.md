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

```
curl -sL https://raw.githubusercontent.com/kalabox/kalabox-bill/master/scripts/startup_osx.sh | sudo bash
```

### Windows

### Linux

```
curl -sL https://raw.githubusercontent.com/kalabox/kalabox-bill/master/scripts/startup_linux.sh | sudo bash
```

## Building Bill

You need `grunt-cli` and `jxcore` installed.

```
git clone https://github.com/kalabox/kalabox-bill.git
cd kalabox-bill
npm install
grunt build
```

Your Bill binary will live in `dist/`
