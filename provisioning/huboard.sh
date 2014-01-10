#!/usr/bin/env bash

#precise 12.04 -

sudo npm install -g couchapp

#create database container
curl -X PUT http://127.0.0.1:5984/huboard

pushd couch/app
couchapp -dc push . http://127.0.0.1:5984/huboard
popd

bundle install --path vendor/bundle --binstubs

echo SECRET_KEY=$(openssl rand -base64 32) > .env
echo SESSION_SECRET=$(openssl rand -base64 32) >> .env

echo GITHUB_CLIENT_ID= >> .env
echo GITHUB_SECRET= >> .env

echo MEMCACHIER_SERVERS=localhost:11211 >> .env

echo COUCH_DATABASE=huboard >> .env
echo COUCH_URL=http://127.0.0.1:5984 >> .env

echo RACK_ENV=staging >> .env

echo STRIPE_API=sk_test >> .env

bundle exec foreman run rake assets:precompile

