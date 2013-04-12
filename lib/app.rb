require 'rdiscount'
require 'sinatra'
require 'sinatra/content_for'
require 'encryptor'
require 'base64'
require_relative "helpers"

class Huboard
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
      @parameters = params
      return erb :home, :layout => :marketing unless authenticated?
      protected!
      configure_gh
      @repos = Huboard.all_repos
      erb :index
    end

    get '/:user/?' do 
      protected!
      @parameters = params
      @repos = Huboard.repos_by_user(params[:user])
      @filtered = params[:user]
      erb :index
    end

    get '/:user/:repo/?' do 
      @parameters = params.merge({:login => current_user.login, :socket_backend => socket_backend})
      configure_gh

      adapter = Huboard.adapter_for(params[:user], params[:repo])

      @actions = Hashie::Mash.new({
          :linked => {
            :labels => adapter.link_labels
          },
          :settings => adapter.settings
      })

      erb :repo
    end

    get '/:user/:repo/backlog' do 
      @parameters = params.merge({:login => current_user.login, :socket_backend => socket_backend})
      erb :backlog, :layout => :layout_fluid
    end

    get '/:user/:repo/board/create' do
      @parameters = params
      erb :create_board
    end

    post '/:user/:repo/board/create/?' do
      pebble.create_board(params[:user],params[:repo],"#{socket_backend}/issues/webhook?token=#{encrypted_token}") unless socket_backend.nil?
      redirect "/#{params[:user]}/#{params[:repo]}/board"
    end

    get '/:user/:repo/board/?' do 
      @parameters = params.merge({:login => current_user.login, :socket_backend => socket_backend})
      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook' do 
      @parameters = params
      json(pebble.create_hook( params[:user], params[:repo], "#{socket_backend}/issues/webhook?token=#{encrypted_token}")) unless socket_backend.nil?
    end

    post '/webhook' do 
      begin
        token =  decrypt_token( params[:token] )
        ghee = gh(token)
        hub = Stint::Pebble.new(Stint::Github.new(ghee))

        payload = JSON.parse(params[:payload])
        user = payload["repository"]["owner"]["login"]
        repo = payload["repository"]["name"]
        hooks = ghee.repos(payload["repository"]["full_name"]).hooks.reject {|x| x["name"] != "web" }.find_all {|x| x["config"]["url"].start_with? base_url}
        hub.fix_hooks user, repo, hooks
        puts "fixed hooks"
        return json(hub.create_hook(user, repo, "#{socket_backend}/issues/webhook?token=#{params[:token]}")) unless socket_backend.nil?
      rescue
        return json({:message => "something go wrong?"})
      end
    end

    helpers Sinatra::ContentFor

  end
end

