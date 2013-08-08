require 'rdiscount'
require 'sinatra'
require 'sinatra/content_for'
require 'encryptor'
require 'base64'
require_relative "helpers"

class Huboard
  class App < HuboardApplication
    #register Sinatra::Auth::Github

    PUBLIC_URLS = ['/', '/logout','/webhook']

    before do

    end

    before "/:user/:repo/?*" do 


      return if ["images", "about", "site" ,"login"].include? params[:user]
      
      if authenticated? :private
        repo = gh.repos params[:user], params[:repo]
        raise Sinatra::NotFound if repo.message == "Not Found"
      else
        repo = gh.repos params[:user], params[:repo]
        halt([401, "Repo not found"]) if repo.message == "Not Found"
      end


    end

    helpers do
      def protected!(*args)
        return current_user if authenticated?(*args)
        authenticate!(*args)
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
      return erb :home, :layout => :marketing unless logged_in?
      @repos = huboard.all_repos
      erb :index
    end

    get '/login/private/?' do
      authenticate! :scope => :private
      redirect params[:redirect_to] || '/'
    end


    get '/:user/?' do 
      user =   gh.users(params[:user]).raw
      raise Sinatra::NotFound unless user.status == 200 
      @parameters = params
      @repos = huboard.repos_by_user(params[:user])
      @user = user.body
      erb :index
    end

    get '/:user/:repo/?' do 
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?

      @parameters = params.merge({ :socket_backend => socket_backend})

      adapter = huboard.board(params[:user], params[:repo])

      @actions = Hashie::Mash.new({
          :linked => {
            :labels => adapter.link_labels
          },
          :settings => adapter.settings
      })

      erb :repo
    end

    get '/:user/:repo/backlog' do 
      @parameters = params.merge({ :socket_backend => socket_backend})
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
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?
      @parameters = params.merge({ :socket_backend => socket_backend})
      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook' do 
      raise Sinatra::NotFound unless huboard.board(params[:user], params[:repo]).has_board?
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
        return json(hub.create_hook(user, repo, "#{socket_backend}/issues/webhook?token=#{params[:token]}")) unless socket_backend.nil?
      rescue
        return json({:message => "something go wrong?"})
      end
    end

    helpers Sinatra::ContentFor

  end
end

