require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'sinatra_auth_github'

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
