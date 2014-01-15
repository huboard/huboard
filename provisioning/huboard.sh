#!/usr/bin/env bash

pushd /vagrant
bundle install --path vendor/bundle --binstubs

echo SECRET_KEY=$(openssl rand -base64 32) > .env
echo SESSION_SECRET=$(openssl rand -base64 32) >> .env

echo GITHUB_CLIENT_ID= >> .env
echo GITHUB_SECRET= >> .env

echo MEMCACHIER_SERVERS=localhost:11211 >> .env

echo COUCH_DATABASE=huboard >> .env
echo COUCH_URL=http://127.0.0.1:5984 >> .env

echo RACK_ENV= >> .env

echo STRIPE_API=sk_test >> .env

echo GITHUB_API_ENDPOINT=https://api.github.com/ >> .env 
echo GITHUB_WEB_ENDPOINT=https://github.com/ >> .env 

# setup nginx
sudo apt-get -y -q install nginx
sudo service nginx start
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /vagrant/config/nginx.conf /etc/nginx/sites-enabled/huboard
sudo service nginx restart

# setup unicorn
sudo ln -s /vagrant/config/unicorn_init.sh /etc/init.d/unicorn
sudo service unicorn start 
