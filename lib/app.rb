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

    PUBLIC_URLS = ['/', '/logout','/webhook']
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

    get '/login' do
      protected!
      redirect '/'
    end


    get '/logout' do
      logout!
      redirect '/'
    end

    get '/' do 
      return erb :home, :layout => :marketing unless authenticated?
      protected!
      @repos = pebble.all_repos
      erb :index
    end

    get '/:user/?' do 
      protected!
      @repos = pebble.all_repos.select {|r| r["owner"]["login"] == params[:user]}
      @filtered = params[:user]
      erb :index
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
      @parameters = params.merge({:login => current_user.login, :socket_backend => socket_backend})
      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook' do 
      json(pebble.create_hook( params[:user], params[:repo], "#{base_url}/webhook?token=#{encrypted_token}"))
    end

    post '/webhook' do 

      token =  decrypt_token( params[:token] )
      ghee = gh(token)
      hub = Stint::Pebble.new(Stint::Github.new(ghee))

      payload = JSON.parse(params[:payload])
      issue = payload["issue"]

      if issue.nil?
        user = payload["repository"]["owner"]["login"]
        repo = payload["repository"]["name"]
        hooks = ghee.repos(user, repo).hooks
                                        .reject {|x| x["name"] != "web" }
                                        .find_all {|x| ["config"]["url"].start_with? base_url}
        hub.fix_hooks user, repo, hooks
        puts "fixed hooks"
        return json({:message => "fixed hooks"})
      end

      #blank embedded data
      issue["_data"] = {} unless issue.nil?
      issue["repo"] = payload["repository"]

      case payload["action"]
        when "opened" then publish payload["repository"]["full_name"], "Opened.0", issue
        when "closed" then publish payload["repository"]["full_name"], "Closed.#{issue["number"]}", issue
        # reopened is a bit more complex
      end

      json({"hooked" => "successful"})
    end

    helpers Sinatra::ContentFor

  end
end

