require 'sinatra'
require 'sinatra/content_for'
require 'stint'
require 'encryptor'
require 'base64'

module Huboard
  class App < Sinatra::Base

    enable :sessions
                      
    if File.exists? '.settings'
      token_file =  File.new("#{File.dirname(__FILE__)}/.settings")
      eval(token_file.read) 
    end
    if ENV['GITHUB_CLIENT_ID']
      set :secret_key, ENV['SECRET_KEY']
      set :team_id, ENV["TEAM_ID"]
      set :user_name, ENV["USER_NAME"]
      set :password, ENV["PASSWORD"]
      set :github_options, {
        :secret    => ENV['GITHUB_SECRET'],
        :client_id => ENV['GITHUB_CLIENT_ID'],
        :scopes => "user,repo"
      }
      set :session_secret, ENV["SESSION_SECRET"]
    end

    register Sinatra::Auth::Github


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

    post '/api/:user/:repo/movecard' do 
      json pebble.move_card params[:user], params[:repo], params[:issue], params[:index]
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
      json(pebble.create_hook( params[:user], params[:repo], "#{base_url}/webhook?token=#{encrypted_token}"))
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

    before do
      authenticate!
      Stint::Github.new(:basic_auth => {:username => settings.user_name, :password => settings.password}).add_to_team(settings.team_id, current_user) unless github_team_access? settings.team_id
      current_user
      github_team_authenticate! team_id
    end


    helpers Sinatra::ContentFor

    helpers do
      def encrypted_token
        encrypted = Encryptor.encrypt user_token, :key => settings.secret_key
        Base64.urlsafe_encode64 encrypted
      end

      def user_token
        github_user.token
      end

      def decrypt_token(token)
        decoded = Base64.urlsafe_decode64 token
        Encryptor.decrypt decoded, :key => settings.secret_key
      end

      def current_user
        @user ||= warden.user
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

      def team_id
        settings.team_id
      end

    end
  end
end

