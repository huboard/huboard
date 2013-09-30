require 'rubygems'
require 'bundler'

Bundler.require

require 'rack/no-www'
require 'rack/ssl'
require 'rack/robustness'


require 'sprockets'
require 'sprockets-helpers'
require 'bourbon'
require 'compass'

require './lib/bootstrap'

configure :production do 
  require "newrelic_rpm"
  use Rack::SSL
end

use Rack::NoWWW
use Rack::Static, :urls => ["/files", "/font","/img", "/scripts","/css"], :root => "public"


map "/api" do
  run Huboard::API
end

map "/" do 
  run Huboard::App
end

map "/settings" do 
    run Huboard::Accounts
end

#map "/assets" do
#  environment.append_path 'assets/javascripts'
#  environment.append_path 'assets/stylesheets'
#  environment.append_path 'assets/images'
#  Compass.sass_engine_options[:load_paths].each { |d| environment.append_path d.to_s }
#  run environment
#end

