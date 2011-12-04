require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'sinatra_auth_github'

Bundler.require

require './app.rb'

use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/images", "/scripts","/styles"], :root => "public"

run Huboard::App
