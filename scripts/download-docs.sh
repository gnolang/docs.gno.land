#!/bin/sh

set -e  # Exit on error

ROOT_DIR="$(dirname "$0")/.."
TMP_DIR=$(mktemp -d)

# Download and extract the repository
wget -O "$TMP_DIR/gno.zip" "https://github.com/gnolang/gno/archive/refs/heads/master.zip"
unzip "$TMP_DIR/gno.zip" -d "$TMP_DIR"

# Remove existing docs/ folder if it exists
rm -rf "$ROOT_DIR/docs"

# Move only the docs/ folder
mv "$TMP_DIR/gno-master/docs" "$ROOT_DIR/"

# Cleanup
rm -rf "$TMP_DIR"