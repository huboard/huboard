require 'sinatra'
require 'json'
require './lib/github'

get '/:user/:repo/milestones' do
  return Dashboard::Github.milestones(params[:user],params[:repo]).to_json
end

get '/:user/:repo/board' do 
  return Dashboard::Github.board(params[:user], params[:repo]).to_json
end

get '/board' do 
  erb :board
end

get '/' do 
  erb :index
end

