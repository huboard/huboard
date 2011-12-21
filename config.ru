require 'rubygems'
require 'bundler'
require 'rack/no-www'
require 'sinatra_auth_github'

Bundler.require

require './lib/app.rb'
require './lib/api.rb'

use Rack::NoWWW
use Rack::Static, :urls => [ "/font","/images", "/scripts","/styles"], :root => "public"

map "/api" do
  run Huboard::API

end
map "/" do 
    run Huboard::App
end
