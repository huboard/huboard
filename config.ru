require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'sinatra_auth_github'

require 'sprockets'

Bundler.require

require './lib/app.rb'
require './lib/api.rb'
require './lib/account.rb'
require './lib/github.rb'
require './lib/pebble.rb'

configure :production do 
  require "newrelic_rpm"
end

use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/img", "/scripts","/css"], :root => "public"



map "/api" do
  run Huboard::API
end

map "/" do 
    run Huboard::App
end

map "/settings" do 
    run Huboard::Accounts
end

class HuboardAssets < Sprockets::Environment
  extend Huboard::Common::Settings
end

map "/assets" do
  environment = HuboardAssets.new
  environment.append_path 'assets/javascripts'
  environment.append_path 'assets/stylesheets'
  run environment
end
