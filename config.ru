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

case ENV["HUBOARD_ENV"]
when "oss"
  require './initializers/oss'
when "standalone"
  require './initializers/stand_alone'
when "production", "staging"
  configure :production, :staging do 
    require "newrelic_rpm"
    use Rack::SSL
  end
  require './initializers/production'
  map "/settings" do 
      run Huboard::Accounts
  end
else
  configure :production, :staging do 
    require "newrelic_rpm"
    use Rack::SSL

    if ENV["RAYGUN_APIKEY"]
      require 'raygun4ruby'
      raygun_api_key = ENV["RAYGUN_APIKEY"]

      Raygun.setup do |config|
        config.api_key = raygun_api_key
        config.silence_reporting = !raygun_api_key
      end
      use Raygun::Middleware::RackExceptionInterceptor
    end
  end
  require './initializers/production'
  map "/settings" do 
      run Huboard::Accounts
  end
end


use Rack::NoWWW
use Rack::Static, :urls => ["/files", "/font","/img", "/scripts","/css"], :root => "public"


map "/api" do
  run Huboard::API
end

map "/" do 
  run Huboard::App
end

