require 'rubygems'
require 'bundler'

require 'dotenv'
Dotenv.load

# Setup load paths
Bundler.require
$: << File.expand_path('../', __FILE__)
$: << File.expand_path('../lib', __FILE__)

environment = ENV["HUBOARD_ENV"] || "development"
require "config/environments/#{environment}.rb"
require './app'
require "config/initializers/#{environment}.rb"


use Rack::NoWWW

run HuBoard::App
