#!/bin/zsh
ulimit -n 65536
cd "$(dirname "$0")"
npx expo start --ios
