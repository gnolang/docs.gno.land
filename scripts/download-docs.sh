#!/bin/sh

ROOT_DIR="$(dirname "$0")/.."

wget -O /tmp/gno.zip "https://github.com/gnolang/gno/archive/refs/heads/master.zip"
unzip -d /tmp/ /tmp/gno.zip

cp -r /tmp/gno-master/docs ${ROOT_DIR}/docs
