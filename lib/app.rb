require 'rdiscount'
require 'sinatra'
require 'slim'
require 'encryptor'
require 'base64'
require_relative "helpers"
require_relative "login"
require_relative "site"

class Huboard
  class App < HuboardApplication

    use Login
    use Site

    PUBLIC_URLS = ['/', '/logout','/webhook', '/site/privacy','/site/terms']
    RESERVED_URLS = %w{ assets repositories images about site login logout favicon.ico robots.txt }

    before "/:user/:repo/?*" do 

      return if RESERVED_URLS.include? params[:user]

      if authenticated? :private
        repo = gh.repos params[:user], params[:repo]

        raise Sinatra::NotFound if repo.message == "Not Found"

        if repo.private && settings.production?
          user = gh.users params[:user]
          customer = couch.customers.findPlanById user.id
          session[:github_login] = user.login
          session[:redirect_to] = user.login == gh.user.login ? "/settings/profile" : "/settings/profile/#/#{user.login}"
          halt([401, "Access denied"]) if !customer.rows.any? || customer.rows.first.value.stripe.customer.delinquent
        end

      else
        repo = gh.repos params[:user], params[:repo]
        raise Sinatra::NotFound if repo.message == "Not Found"
      end
    end

    helpers do
      def protected!(*args)
        return current_user if authenticated?(*args)
        authenticate!(*args)
      end
    end

    get '/' do 
      @parameters = params
      return erb :home, :layout => :marketing unless logged_in?
      @repos = huboard.all_repos
      @private = nil
      erb :index
    end



    get '/:user/?' do 
      pass if params[:user] == "assets"
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
      pass if params[:user] == "assets"
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
      pass if params[:user] == "assets"
      @parameters = params.merge({ :socket_backend => socket_backend})
      erb :backlog, :layout => :layout_fluid
    end

    get '/:user/:repo/beta/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?
      
      @parameters = params.merge({ :socket_backend => socket_backend})

      @repo = gh.repos(params[:user],params[:repo])
      if logged_in?
        is_a_collaborator = gh.connection.get("/repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204
        @repo.merge!(is_collaborator: is_a_collaborator)
      else
        @repo.merge!(is_collaborator: false)
      end

      erb :ember_board, :layout => :layout_ember
    end

    get '/:user/:repo/board/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}"
    end

    get '/:user/:repo/board/create/?' do
      pass if params[:user] == "assets"
      @parameters = params
      erb :create_board
    end

    post '/:user/:repo/board/create/?' do
      pass if params[:user] == "assets"
      hook_url = "#{socket_backend}/issues/webhook?token=#{encrypted_token}"
      pebble.create_board(params[:user],params[:repo], socket_backend.nil? ? nil : hook_url)
      redirect "/#{params[:user]}/#{params[:repo]}/board"
    end

    get '/:user/:repo/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?
      @parameters = params.merge({ :socket_backend => socket_backend})

      @repo = gh.repos(params[:user],params[:repo])
      if logged_in?
        is_a_collaborator = gh.connection.get("/repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204
        @repo.merge!(is_collaborator: is_a_collaborator)
      else
        @repo.merge!(is_collaborator: false)
      end

      erb :board, :layout => :layout_fluid
    end


    get '/:user/:repo/hook/?' do 
      pass if params[:user] == "assets"
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

    not_found do
      erb :"404", :layout => false
    end

  end

end

