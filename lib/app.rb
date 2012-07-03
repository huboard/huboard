require 'rdiscount'
require 'sinatra'
require 'sinatra/content_for'
require 'stint'
require 'encryptor'
require 'base64'
require_relative "helpers"

module Huboard
  class App < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    extend Huboard::Common::Settings

    PUBLIC_URLS = ['/', '/logout']
    before do
      protected! unless PUBLIC_URLS.include? request.path_info
    end

    helpers do
      def protected! 
        return current_user if authenticated?
        authenticate! 
        #HAX! TODO remove
        #ghee = Ghee.new({ :basic_auth => {:user_name => settings.user_name, :password => settings.password}})
        #Stint::Github.new(ghee).add_to_team(settings.team_id, current_user.login) unless github_team_access? settings.team_id
        #current_user
        #github_team_authenticate! team_id
      end
    end

    get '/' do 
      return erb :home unless authenticated?
      protected!
      @repos = pebble.all_repos
      erb :index
    end

    get '/login' do
      protected!
      redirect '/'
    end


    get '/logout' do
      logout!
      redirect '/'
    end

    get '/:user/:repo/milestones' do 
      @parameters = params
      erb :milestones
    end

    get '/:user/:repo/board/create' do
      @parameters = params
      erb :create_board
    end

    post '/:user/:repo/board/create/?' do
      @parameters = params
      pebble.create_board(params[:user],params[:repo],"#{base_url}/webhook?token=#{encrypted_token}")
      redirect "/#{params[:user]}/#{params[:repo]}/board"
    end

    get '/:user/:repo/board/?' do 
      @parameters = params.merge({:login => current_user.login})
      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook' do 
      json(pebble.create_hook( params[:user], params[:repo], "#{base_url}/webhook?token=#{encrypted_token}"))
    end

    post '/webhook' do 
      puts "webhook"
      token =  decrypt_token( params[:token] )
      hub = Stint::Pebble.new(Stint::Github.new(gh))

      payload = JSON.parse(params[:payload])

      response = []
      repository = payload["repository"]
      commits = payload["commits"]
      commits.reverse.each do |c|

        response << hub.push_card(  repository["owner"]["name"], repository["name"], c)
      end 
      json response
    end

    helpers Sinatra::ContentFor

  end
end

