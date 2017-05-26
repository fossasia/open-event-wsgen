#!/usr/bin/env bash

export DEPLOY_BRANCH=${DEPLOY_BRANCH:-master}

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_REPO_SLUG" != "fossasia/open-event-webapp" -o  "$TRAVIS_BRANCH" != "$DEPLOY_BRANCH" ]; then
    echo "Skip production deployment for a very good reason."
    exit 0
fi

export REPOSITORY="https://github.com/${TRAVIS_REPO_SLUG}.git"

sudo rm -f /usr/bin/git-credential-gcloud.sh
sudo rm -f /usr/bin/bq
sudo rm -f /usr/bin/gsutil
sudo rm -f /usr/bin/gcloud
rm -rf node_modules

curl https://sdk.cloud.google.com | bash;
source ~/.bashrc
gcloud components install kubectl

gcloud config set compute/zone us-west1-a
# Decrypt the credentials we added to the repo using the key we added with the Travis command line tool
openssl aes-256-cbc -K $encrypted_1a655549843e_key -iv $encrypted_1a655549843e_iv -in ./kubernetes/travis/eventyay-cf9d0dcc3261.json.enc -out eventyay-cf9d0dcc3261.json -d
mkdir -p lib
gcloud auth activate-service-account --key-file eventyay-cf9d0dcc3261.json
export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/eventyay-cf9d0dcc3261.json
gcloud config set project eventyay
gcloud container clusters get-credentials nextgen-cluster
cd kubernetes/images/generator
docker build --build-arg COMMIT_HASH=$TRAVIS_COMMIT --build-arg BRANCH=$DEPLOY_BRANCH --build-arg REPOSITORY=$REPOSITORY --no-cache -t eventyay/webapp-generator:$TRAVIS_COMMIT .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker tag eventyay/webapp-generator:$TRAVIS_COMMIT eventyay/webapp-generator:latest
docker push eventyay/webapp-generator
kubectl set image deployment/webapp-generator --namespace=web webapp-generator=eventyay/webapp-generator:$TRAVIS_COMMIT