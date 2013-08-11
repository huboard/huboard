require 'rubygems'
require 'bundler'
require 'rack/no-www'
#require 'rack/robustness'
#require 'sinatra_auth_github'

Bundler.require

require './lib/helpers'
require './lib/base'
require './lib/app'
require './lib/api'
require './lib/github'
require './lib/pebble'

configure :production do 
  #require "newrelic_rpm"
end

use Rack::Robustness do |g|
  g.status 500
  g.content_type 'text/plain'
  g.body 'A fatal error occured.'
end

use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/img", "/scripts","/css"], :root => "public"

map "/api" do
  run Huboard::API

end
map "/" do 
  run Huboard::App
end
