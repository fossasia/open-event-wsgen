#!/bin/bash

set -o errexit -o nounset

GH_TIMEOUT="${GH_TIMEOUT:-120s}"

node cli.js & timeout $GH_TIMEOUT npm run start;
