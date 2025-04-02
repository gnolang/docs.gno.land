#!/bin/sh

set -e  # Exit on error

ROOT_DIR="$(dirname "$0")/.."
TMP_DIR=$(mktemp -d)

trap 'rm -rf "$TMP_DIR"' EXIT  # Ensure cleanup on exit

echo "Downloading and extracting Gno monorepo..."
curl -L -o "$TMP_DIR/gno.zip" "https://github.com/gnolang/gno/archive/refs/heads/master.zip"
unzip -q "$TMP_DIR/gno.zip" -d "$TMP_DIR"

EXTRACTED_DIR="$TMP_DIR/gno-master"

echo "Updating docs..."
rm -rf "$ROOT_DIR/docs"
mv "$EXTRACTED_DIR/docs" "$ROOT_DIR/"

echo "Moving sidebar.json..."
mv "$EXTRACTED_DIR/misc/docs/sidebar.json" "$ROOT_DIR/docs/sidebar.json"

echo "Done!"
