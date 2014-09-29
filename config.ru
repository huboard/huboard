require 'rubygems'
require 'bundler'
require 'uri'

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

Octokit.api_endpoint = ENV["GITHUB_API_ENDPOINT"] if ENV["GITHUB_API_ENDPOINT"]
Octokit.web_endpoint = ENV["GITHUB_WEB_ENDPOINT"] if ENV["GITHUB_WEB_ENDPOINT"]

if HuBoard::App.development? 
  run HuBoard::App
else
  options = {
    mount: '/site/pubsub',
    timeout: 25,
    ping: 15,
    engine: {
      type: Faye::Redis,
      uri: (ENV['REDIS_URL'] || 'redis://localhost:6379')
    }
  }

  run Faye::RackAdapter.new(HuBoard::App, options)

  require 'logger'
  Faye.logger = Logger.new(STDOUT)
  Faye.logger.level = Logger::INFO
end
