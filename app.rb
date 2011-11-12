require 'sinatra'
require 'sinatra/content_for'
require 'omniauth'
require 'stint'

# json api
get '/api/:user/:repo/milestones' do
  return json github.milestones(params[:user],params[:repo])
end

get '/api/:user/:repo/board' do 
  return json pebble.board(params[:user], params[:repo])
end

get '/' do 
  @user = OpenStruct.new current_user
  @repos = pebble.all_repos
  erb :index
end

get '/:user/:repo/milestones' do 
   @parameters = params
   erb :milestones
end
get '/:user/:repo/board' do 
   @parameters = params
   erb :board
end

post '/webhook' do 
  puts "webhook"
  Stint::Pebble.responds_to_message(Crack::JSON.parse(params[:payload])) do |commit, hash|
    puts commit
  end
end

get '/user' do
  json github.user
end
get '/authorizations' do
  json github.authorizations
end
get '/all_repos' do
  json pebble.all_repos
end


# omniauth integration

get '/auth/github/callback' do
  omniauth = request.env['omniauth.auth']
  session["user_token"] = omniauth['credentials']['token']
  redirect '/'
end

get '/auth/failure' do
  content_type 'text/plain'
  "Failed to authenticate: #{params[:message]}"
end

get '/logout' do
  session["user_token"] = nil
  session["user_login"] = nil
  redirect '/'
end

PUBLIC_URLS = [ '/logout', '/auth/github', '/auth/github/callback']

load '.settings' if File.exists? '.settings'
if ENV['GITHUB_CLIENT_ID']
  set :github_client_id, ENV['GITHUB_CLIENT_ID']
  set :github_secret, ENV['GITHUB_SECRET']
end

enable :sessions

use OmniAuth::Builder do
  provider :github,   settings.github_client_id, settings.github_secret do |o|
    o.authorize_params = {:scope => 'repo,user'}
  end
end

before do
  protected! unless PUBLIC_URLS.include? request.path_info
end

helpers do
  def user_token
    session['user_token']
  end

  def current_user
    session['user_login'] ||= github.user
  end

  def logged_in?
    !!user_token
  end

  def protected!
    redirect '/auth/github' unless logged_in?
  end

  def github
    @github ||= Stint::Github.new(user_token)
  end

  def pebble
    @pebble ||= Stint::Pebble.new(github)
  end

  def json(obj)
    JSON.pretty_generate(obj)
  end
end
