#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "development" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

HSAMPLE_EVENT="${HSAMPLE_EVENT:-FOSSASIA\ 2016}"
GH_EVENT="${GH_EVENT:-FOSSASIA\ 2016}"
eval mv dist/a@a.com/$HSAMPLE_EVENT/* sample
eval cd dist/a@a.com/$GH_EVENT/

git init
git config user.name "shubham-padia"
git config user.email "shubhamapadia@gmail.com"

git remote add upstream "https://$GH_TOKEN@github.com/fossasia/open-event-webapp.git"
git fetch upstream
git reset upstream/gh-pages

touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:gh-pages
rm -rf dist/a@a.com