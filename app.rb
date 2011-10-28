require 'sinatra'
require 'json'
require 'crack'
require './lib/github'


get '/:user/:repo/milestones' do
  return Dashboard::Github.milestones(params[:user],params[:repo]).to_json
end

get '/:user/:repo/board' do 
  return Dashboard::Pebble.board(params[:user], params[:repo]).to_json
end

post '/webhook' do 
  puts "webhook"
  Dashboard::Pebble.responds_to_message(Crack::JSON.parse(params[:payload])) do |commit, hash|
    puts commit
  end
end

get '/board' do 
  erb :board
end

get '/' do 
  erb :index
end

