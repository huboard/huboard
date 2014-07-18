require './app'

case ENV["HUBOARD_ENV"]
when "oss"
when "standalone"
when "production", "staging"
  configure :production, :staging do 
    require "newrelic_rpm"
    use Rack::SSL

    require 'raygun4ruby'
    raygun_api_key = ENV["RAYGUN_APIKEY"]

    Raygun.setup do |config|
      config.api_key = raygun_api_key
      config.silence_reporting = !raygun_api_key
    end

    use Raygun::Middleware::RackExceptionInterceptor
  end
end

use Rack::NoWWW

run HuBoard::App
