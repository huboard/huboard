require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'rack-rescue'
#require 'sinatra_auth_github'

Bundler.require

require './lib/helpers'
require './lib/base'
require './lib/app'
require './lib/api'
require './lib/github'
require './lib/pebble'

configure :production do 
  require "newrelic_rpm"
end

use Rack::Rescue
use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/img", "/scripts","/css"], :root => "public"

map "/api" do
  run Huboard::API

end
map "/" do 
    run Huboard::App
end
