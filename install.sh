#!/bin/bash

EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/ip-indicator@amirilf.ir"

echo "Installing IP Indicator..."

# remove the old version
rm -rf "$EXTENSION_DIR"

# copy the extension
cp -r "$(dirname "$0")" "$EXTENSION_DIR"

echo "Extension installed to $EXTENSION_DIR"
echo "Restart GNOME Shell: Alt+F2, type 'r', press Enter"
echo "Enable: gnome-extensions enable ip-indicator@amirilf.ir"
