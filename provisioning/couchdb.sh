#!/usr/bin/env bash

sudo apt-get -y -q update > /dev/null
sudo apt-get -y -q install python-software-properties vim curl make g++ > /dev/null

sudo npm install -g couchapp

#create database container
curl -X PUT http://127.0.0.1:5984/huboard

pushd /vagrant/couch/app
couchapp -dc push . http://127.0.0.1:5984/huboard
popd

