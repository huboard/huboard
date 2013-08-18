require 'rubygems'
require 'bundler'

Bundler.setup

require 'rack/no-www'
require 'rack/robustness'


require './lib/helpers'
require './lib/base'
require './lib/app'
require './lib/api'
require './lib/github'
require './lib/pebble'

configure :production do 
  require "newrelic_rpm"
end


use Rack::NoWWW
use Rack::Static, :urls => ["/files", "/font","/img", "/scripts","/css"], :root => "public"

map "/api" do
  run Huboard::API
end

map "/" do 
  run Huboard::App
end
