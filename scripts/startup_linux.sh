#!/bin/sh
#
# Basic script to get Bill to start up on system init on Linux
#
# Usage: sudo ./startup_osx.sh
#

# Bill vars dude!
BILL_VERSION=v0.1.7

# Move to the tempdir to get stuff
cd /tmp

# Grab the things we need
curl -OL https://github.com/kalabox/kalabox-bill/releases/download/${BILL_VERSION}/bill-linux-x64-${BILL_VERSION}

# Move the bill bin into the correct place and make sure its executable
mkdir -p /usr/local/bin
mv bill-linux-x64-${BILL_VERSION} /usr/local/bin/bill
chmod +x /usr/local/bin/bill

#
# Gather information about the system and state
#
# Let's first try to get our system
if [ -f /etc/os-release ]; then
  source /etc/os-release
  : ${FLAVOR:=$ID_LIKE}
  : ${FLAVOR:=$ID}
# Some OS do not implement /etc/os-release yet so lets do this in case
# they dont
elif [ -f /etc/arch-release ]; then
  FLAVOR="arch"
elif [ -f /etc/gentoo-release ]; then
  FLAVOR="gentoo"
elif [ -f /etc/fedora-release ]; then
  FLAVOR="fedora"
elif [ -f /etc/redhat-release ]; then
  FLAVOR="redhat"
elif [ -f /etc/debian_version ]; then
  FLAVOR="debian"
else
  FLAVOR="whoknows"
fi

# Add script to rc.local
if [ "${FLAVOR}" == "debian" ]; then
  echo "/usr/local/bin/bill -d" >> /etc/rc.local
  chmod +x /etc/rc.local
elif [ "${FLAVOR}" == "fedora" ]; then
  curl -O https://raw.githubusercontent.com/kalabox/kalabox-bill/master/scripts/bill
  mv bill /etc/init.d/bill
  chmod +x /etc/init.d/bill
  chkconfig --add /etc/init.d/bill
  chkconfig --level 2345 bill on
fi

# Start up bill
/usr/local/bin/bill -d &

exit 0
