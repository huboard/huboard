#!/usr/bin/env bash

apt-get install -y g++
apt-get install -y erlang-dev erlang-manpages erlang-base-hipe erlang-eunit erlang-nox erlang-xmerl erlang-inets
sudo apt-get install -y libmozjs185-dev libicu-dev libcurl4-gnutls-dev libtool

wget http://mirror.symnds.com/software/Apache/couchdb/source/1.5.0/apache-couchdb-1.5.0.tar.gz -P /tmp/
pushd /tmp
tar xvzf apache-couchdb-1.5.0.tar.gz
pushd apache-couchdb-*
./configure && make
sudo make install

### remove leftovers from ubuntu packages
sudo rm /etc/logrotate.d/couchdb /etc/init.d/couchdb

sudo adduser --disabled-login --disabled-password --no-create-home --gecos "CouchDB Admin" couchdb

sudo chown -R couchdb:couchdb /usr/local/var/log/couchdb
sudo chown -R couchdb:couchdb /usr/local/var/lib/couchdb
sudo chown -R couchdb:couchdb /usr/local/var/run/couchdb

### install logrotate and initd scripts
sudo ln -s /usr/local/etc/logrotate.d/couchdb /etc/logrotate.d/couchdb
sudo ln -s /usr/local/etc/init.d/couchdb  /etc/init.d
sudo update-rc.d couchdb defaults
