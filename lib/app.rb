require 'rdiscount'
require 'sinatra'
require 'slim'
require 'encryptor'
require 'base64'

class Huboard
  class App < HuboardApplication

    use Login

    helpers do
      set(:is_logged_in) do |enabled| 
        condition do
          enabled == logged_in?
        end
      end
    end

    get '/', :is_logged_in => true do 
      @parameters = params
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

    get '/:user/:repo/backlog/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}/#/milestones"
    end
    get '/:user/:repo/beta/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}/#/"
    end

    get '/:user/:repo/?' do 
      pass if params[:user] == "assets"
      redirect "/#{params[:user]}/#{params[:repo]}/board/create" unless huboard.board(params[:user], params[:repo]).has_board?
      
      @parameters = params.merge({ :socket_backend => socket_backend})

      @repo = gh.repos(params[:user],params[:repo])
      if logged_in?
        is_a_collaborator = gh.connection.get("./repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204
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
      redirect "/#{params[:user]}/#{params[:repo]}/"
    end

    get '/:user/:repo/hook/?' do 
      pass if params[:user] == "assets"
      raise Sinatra::NotFound unless huboard.board(params[:user], params[:repo]).has_board?
      @parameters = params
      json(pebble.create_hook( params[:user], params[:repo], "#{socket_backend}/issues/webhook?token=#{encrypted_token}")) unless socket_backend.nil?
    end

    get "/favicon.ico" do
     
      path = File.expand_path("../../public/img/favicon.ico",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "image/vnd.microsoft.icon"
      [status, headers, response]
    end

    get "/robots.txt" do
      path = File.expand_path("../../public/files/robots.txt",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "text/plain"
      [status, headers, response]
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

