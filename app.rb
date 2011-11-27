require 'sinatra'
require 'sinatra/content_for'
require 'omniauth'
require 'stint'
require 'encryptor'
require 'base64'

# json api
get '/api/:user/:repo/milestones' do
  return json github.milestones(params[:user],params[:repo])
end

get '/api/:user/:repo/board' do 
  return json pebble.board(params[:user], params[:repo])
end

post '/api/:user/:repo/reordermilestone' do 
  milestone = params["milestone"]
  json pebble.reorder_milestone params[:user], params[:repo], milestone["number"], params[:index]
end

get '/' do 
  @repos = pebble.all_repos
  erb :index
end

get '/:user/:repo/milestones' do 
   @parameters = params
   erb :milestones
end
get '/:user/:repo/board' do 
   @parameters = params
   erb :board, :layout => :layout_fluid
end
get '/:user/:repo/hook' do 
   json(pebble.create_hook( params[:user], params[:repo], "#{base_url}?token=#{user_token}"))
end

post '/webhook' do 
  puts "webhook"
  token =  decrypt_token( params[:token] )
  hub = Stint::Pebble.new(Stint::Github.new({ :headers => {"Authorization" => "token #{token}"}}))
  
  payload = JSON.parse(params[:payload])

  response = []
  repository = payload["repository"]
  commits = payload["commits"]
  commits.reverse.each do |c|
    
    response << hub.push_card(  repository["owner"]["name"], repository["name"], c)
  end 
  json response
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
get '/hook' do 
  token = user_token
  json({ :token => token})
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

PUBLIC_URLS = ['/webhook', '/logout', '/auth/github', '/auth/github/callback']

load '.settings' if File.exists? '.settings'
if ENV['GITHUB_CLIENT_ID']
  set :github_client_id, ENV['GITHUB_CLIENT_ID']
  set :github_secret, ENV['GITHUB_SECRET']
  set :secret_key, ENV['SECRET_KEY']
end

enable :sessions

use OmniAuth::Builder do
  provider :github,   settings.github_client_id, settings.github_secret do |o|
    o.authorize_params = {:scope => 'repo,user'}
  end
end

before do
  protected! unless PUBLIC_URLS.include? request.path_info
  @user = OpenStruct.new current_user
end

helpers do
  def encrypted_token
    encrypted = Encryptor.encrypt session['user_token'], :key => settings.secret_key
    Base64.strict_encode64 encrypted
  end

  def user_token
     session['user_token']
  end

  def decrypt_token(token)
    decoded = Base64.strict_decode64 token
    Encryptor.decrypt decoded, :key => settings.secret_key
  end

  def current_user
    @user ||= github.user
  end

  def logged_in?
    !!user_token
  end

  def protected!
    redirect '/auth/github' unless logged_in?
  end

  def github
    @github ||= Stint::Github.new({ :headers => {"Authorization" => "token #{user_token}"}})
  end

  def pebble
    @pebble ||= Stint::Pebble.new(github)
  end

  def json(obj)
    JSON.pretty_generate(obj)
  end
   def base_url
    @base_url ||= "#{request.env['rack.url_scheme']}://#{request.env['HTTP_HOST']}"
  end
end
