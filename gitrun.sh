#!/bin/bash

# crlf fix
dos2unix ./bin/*

# git stuff
git add .
git commit -m "${1}"
git push

# npm stuff
npm version patch
node gitrun.sh
npm publish