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
bill.js -d -p 1991
```

## Running Bill as a start up service

### Darwin

```
curl -sL https://raw.githubusercontent.com/kalabox/kalabox-bill/master/scripts/startup_osx.sh | sudo bash
```

### Windows

Download the latest Windows release [here](https://github.com/kalabox/kalabox-bill/releases), rename it `bill.exe` and put it
someplace safe like `%USERPROFILE%\Desktop\.bin\bill.exe`

Open up `cmd.exe` as Administrator and run
```
schtasks.exe /create /tn "Bill" /ru SYSTEM /sc ONSTART /rl HIGHEST /tr "%USERPROFILE%\Desktop\.bin\bill.exe -d"
```

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
