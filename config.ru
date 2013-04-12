require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'sinatra_auth_github'

Bundler.require

require './lib/app.rb'
require './lib/api.rb'
require './lib/github.rb'
require './lib/pebble.rb'

configure :production do 
  require "newrelic_rpm"
end

use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/img", "/scripts","/css"], :root => "public"

if ENV["BASIC_AUTH_USER"] && ENV["BASIC_AUTH_PASSWORD"]
  use Rack::Auth::Basic, "Protected Area" do |username, password|
    username == ENV["BASIC_AUTH_USER"] && password == ENV["BASIC_AUTH_PASSWORD"]
  end
end

map "/api" do
  run Huboard::API

end
map "/" do 
    run Huboard::App
end
