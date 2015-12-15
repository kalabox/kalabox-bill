#!/bin/sh
#
# Basic script to get Bill to start up on system init on OSX
#
# Usage: sudo ./startup_osx.sh
#

# Bill vars dude!
BILL_VERSION=v0.1.7

# Move to the tempdir to get stuff
cd /tmp

# Grab the things we need
curl -OL https://github.com/kalabox/kalabox-bill/releases/download/${BILL_VERSION}/bill-darwin-x64-${BILL_VERSION}
curl -O https://raw.githubusercontent.com/kalabox/kalabox-bill/master/scripts/io.kalabox.bill.plist

# Move the bill bin into the correct place and make sure its executable
mkdir -p /usr/local/bin
mv bill-darwin-x64-${BILL_VERSION} /usr/local/bin/bill
chmod +x /usr/local/bin/bill

# Set up our start up job
mv io.kalabox.bill.plist /Library/LaunchDaemons/io.kalabox.bill.plist
launchctl load -D system /Library/LaunchDaemons/io.kalabox.bill.plist
