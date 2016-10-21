#!/bin/bash

set -o errexit -o nounset

HSAMPLE_TIMEOUT="${HSAMPLE_TIMEOUT:-90s}"

HSAMPLE_ENDPOINT="${HSAMPLE_ENDPOINT:-https://raw.githubusercontent.com/fossasia/open-event/master/sample/OTS16/}"

node cli.js heroku_dir $HSAMPLE_ENDPOINT & timeout $HSAMPLE_TIMEOUT npm run start;
