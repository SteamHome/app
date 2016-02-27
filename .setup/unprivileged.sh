#!/usr/bin/env bash

echo "Installing nvm & node stable"
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
exec bash
nvm install stable
echo "Done"

echo "Installing global npm packages"
npm install -g bower gulp fauxton yo serve
echo "Done"
