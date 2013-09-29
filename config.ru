require 'rubygems'
require 'bundler'

Bundler.setup

require 'rack/no-www'
require 'rack/robustness'


require 'sprockets'
require 'sprockets-helpers'
require 'bourbon'
require 'compass'

require './lib/helpers'
require './lib/base'
require './lib/app'
require './lib/api'
require './lib/account.rb'
require './lib/github'
require './lib/pebble'

configure :production do 
  require "newrelic_rpm"
end

use Rack::NoWWW
use Rack::Static, :urls => ["/files", "/font","/img", "/scripts","/css"], :root => "public"

class HuboardAssets < Sprockets::Environment
    if File.exists? ".settings"
      load ".settings"
    elsif ENV['STRIPE_API']
      set :stripe_key, ENV['STRIPE_API']
      set :stripe_publishable_key, ENV['STRIPE_PUBLISHABLE_API']
    else
      raise "Configuration information not found: you need to provide a .settings file or ENV variables"
    end
end

environment = HuboardAssets.new

map "/api" do
  run Huboard::API
end

map "/" do 
  run Huboard::App
end

map "/settings" do 
    run Huboard::Accounts
end

map "/assets" do
  environment.append_path 'assets/javascripts'
  environment.append_path 'assets/stylesheets'
  environment.append_path 'assets/images'
  Compass.sass_engine_options[:load_paths].each { |d| environment.append_path d.to_s }
  run environment
end

