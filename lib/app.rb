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
      huboard.board(params[:user], params[:repo]).create_board
      redirect "/#{params[:user]}/#{params[:repo]}/"
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

    not_found do
      erb :"404", :layout => false
    end

  end

end

