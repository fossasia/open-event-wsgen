#!/bin/bash

set -o errexit -o nounset

HSAMPLE_TIMEOUT="${HSAMPLE_TIMEOUT:-60s}"

HSAMPLE_ENDPOINT="${HSAMPLE_ENDPOINT:-https://eventyay.com/api/v1/events/6}"

node cli.js heroku_dir $HSAMPLE_ENDPOINT & timeout $HSAMPLE_TIMEOUT npm run start;
