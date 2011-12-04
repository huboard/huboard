require 'rubygems'
require 'bundler'
require 'rack/no-www'
Bundler.require

require './app.rb'

use Rack::NoWWW

run Sinatra::Application
