require 'rubygems'
require 'bundler'

Bundler.require

if File.exists?("./.env") 
  require 'dotenv'
  Dotenv.load
end

Octokit.api_endpoint = ENV["GITHUB_API_ENDPOINT"] if ENV["GITHUB_API_ENDPOINT"]
Octokit.web_endpoint = ENV["GITHUB_WEB_ENDPOINT"] if ENV["GITHUB_WEB_ENDPOINT"]

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

