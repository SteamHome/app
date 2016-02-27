#!/usr/bin/env bash

echo "Updating Repos"
sudo apt-get update
echo "Done"

echo "Setting Locale & Timezone"
echo "LC_ALL=en_US.UTF-8" >> /etc/default/locale
sudo locale-gen en_US.UTF-8
sudo locale-gen it_IT.UTF-8
ln -sf /usr/share/zoneinfo/US/Eastern /etc/localtime
echo "Done"

echo "Installing Packages"
sudo apt-get install -qq build-essential software-properties-common python-software-properties vim curl git > /dev/null 2>&1 
echo "Done"

echo "Installing CouchDB"
sudo add-apt-repository ppa:couchdb/stable -y
sudo apt-get update
sudo apt-get install -qq couchdb > /dev/null 2>&1
echo "Done"

echo "Enable swap memory..."
sudo dd if=/dev/zero of=/var/swap.1 bs=1M count=1024
sudo mkswap /var/swap.1
sudo swapon /var/swap.1
echo "Done"