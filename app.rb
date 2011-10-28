require 'sinatra'
require 'json'
require './lib/github'

get '/:user/:repo/milestones' do
  return Dashboard::Github.milestones(params[:user],params[:repo]).to_json
end

get '/:user/:repo/board' do 
  return Dashboard::Pebble.board(params[:user], params[:repo]).to_json
end

post 'webhook' do 
  Dashboard::Pebble.responds_to_message(Crack::Json.parse(params[:payload])) do |commit, hash|
    puts commit
    puts hash
  end
end

get '/board' do 
  erb :board
end

get '/' do 
  erb :index
end

