#!/usr/bin/env bash

#precise 12.04 -

apt-get -y -q update > /dev/null
apt-get -y -q install python-software-properties vim curl git make g++ > /dev/null


#add-apt-repository ppa:nginx/stable
#apt-get -y -q update > /dev/null
#apt-get -y -q install nginx > /dev/null


add-apt-repository -y ppa:chris-lea/node.js
apt-get -y update
apt-get -y install nodejs

