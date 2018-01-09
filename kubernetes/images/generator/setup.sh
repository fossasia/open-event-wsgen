#!/bin/bash
git clone ${REPOSITORY} webapp_generator
cd webapp_generator
git checkout ${BRANCH}

if [ -v COMMIT_HASH ]; then
    git reset --hard ${COMMIT_HASH}
fi

npm install --no-shrinkwrap