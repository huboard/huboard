require 'raygun4ruby'
require "newrelic_rpm"
module HuBoard
  extend self

  def sass?
    true
  end
end

configure :production, :staging do 
  use Rack::SSL
  use Rack::NoWWW

  raygun_api_key = ENV["RAYGUN_APIKEY"]

  Raygun.setup do |config|
    config.api_key = raygun_api_key
    config.silence_reporting = !raygun_api_key
  end

  use Raygun::Middleware::RackExceptionInterceptor
end


