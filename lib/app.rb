require 'rdiscount'
require 'sinatra'
require 'slim'
require 'sinatra/content_for'
require 'encryptor'
require 'base64'
require_relative "helpers"

class Huboard
  class App < HuboardApplication

    PUBLIC_URLS = ['/', '/logout','/webhook', '/site/privacy','/site/terms']
    RESERVED_URLS = %w{ assets repositories images about site login logout favicon.ico robots.txt }

    before do

    end

    before "/:user/:repo/?*" do 

      return if RESERVED_URLS.include? params[:user]

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
      end
    end


    get '/logout' do
      logout!
      redirect '/'
    end

    get "/site/privacy/?" do
      return erb :privacy, :layout => :marketing unless authenticated?
    end

    get "/site/terms/?" do
      return erb :terms_of_service, :layout => :marketing unless authenticated?
    end

    get '/login/?' do
      @parameters = params
      erb :login, :layout => :marketing
    end

    get '/login/private/?' do
      authenticate! :scope => :private
      redirect params[:redirect_to] || '/'
    end

    get '/login/public/?' do
      authenticate!
      redirect params[:redirect_to] || '/'
    end

    get '/' do 
      @parameters = params
      return erb :home, :layout => :marketing unless logged_in?
      @repos = huboard.all_repos
      @private = nil
      erb :index
    end

    get '/pricing/?' do 
      erb :pricing, :layout => :marketing
    end

    get "/favicon.ico" do
     
      path = File.expand_path("../../public/img/favicon.ico",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "image/vnd.microsoft.icon"
      [status, headers, response]
    end

    get "/robots.txt" do
      puts "hello"
      path = File.expand_path("../../public/files/robots.txt",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "text/plain"
      [status, headers, response]
    end

    get '/:user/?' do 
      user =   gh.users(params[:user]).raw
      raise Sinatra::NotFound unless user.status == 200 
      @parameters = params

      if logged_in? && current_user.login == params[:user]
        @repos = huboard.repos
      else
        @repos = huboard.repos_by_user(params[:user])
      end

      @user = user.body
      @private = nil
      erb :index
    end

    get "/repositories/public/:user/?" do
      user =   gh.users(params[:user]).raw
      raise Sinatra::NotFound unless user.status == 200 

      @parameters = params
      @repos = huboard.repos_by_user(params[:user]).select {|r| !r.private }
      @user = user.body
      @private = 0
      erb :index
    end

    get "/repositories/private/:user/?" do
      user =   gh.users(params[:user]).raw
      raise Sinatra::NotFound unless user.status == 200 
      unless authenticated? :private 
        uri = Addressable::URI.convert_path("#{base_url}/login/private")
        uri.query_values = { redirect_to: "/repositories/private/#{params[:user]}" }
        redirect uri.to_s
      end
      @parameters = params

      if logged_in? && current_user.login == params[:user]
        @repos = huboard.all_repos.select {|r| r.private }
      else
        @repos = huboard.all_repos.select {|r| r.private && r.owner.login.casecmp(params[:user]) == 0 }
      end

      @user = user.body
      @private = 1
      erb :index

    end

    get '/:user/:repo/settings/?' do 
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

    get '/:user/:repo/backlog/?' do 
      @parameters = params.merge({ :socket_backend => socket_backend})
      erb :backlog, :layout => :layout_fluid
    end
    get '/:user/:repo/board/?' do 
      redirect "/#{params[:user]}/#{params[:repo]}"
    end

    get '/:user/:repo/board/create/?' do
      @parameters = params
      erb :create_board
    end


    post '/:user/:repo/board/create/?' do
      puts "creating board"
      hook_url = "#{socket_backend}/issues/webhook?token=#{encrypted_token}"
      pebble.create_board(params[:user],params[:repo], socket_backend.nil? ? nil : hook_url)
      redirect "/#{params[:user]}/#{params[:repo]}/board"
    end

    get '/:user/:repo/?' do 
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?
      @parameters = params.merge({ :socket_backend => socket_backend})
      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook/?' do 
      raise Sinatra::NotFound unless huboard.board(params[:user], params[:repo]).has_board?
      @parameters = params
      json(pebble.create_hook( params[:user], params[:repo], "#{socket_backend}/issues/webhook?token=#{encrypted_token}")) unless socket_backend.nil?
    end

    post '/webhook/?' do 
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

