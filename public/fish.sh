#!/usr/bin/env bash
# 🐠 duikvenster.nl — welkom onder water

if command -v asciiquarium &>/dev/null; then
  asciiquarium </dev/tty
  exit
fi

if command -v brew &>/dev/null; then
  echo "Installing asciiquarium..."
  brew install asciiquarium && asciiquarium </dev/tty
else
  echo "Geen brew gevonden. Installeer asciiquarium handmatig: https://github.com/cmatsuoka/asciiquarium"
  exit 1
fi
