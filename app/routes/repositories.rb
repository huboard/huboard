module HuBoard
  module Routes
    class Repositories < Base

      RESERVED_URLS = %w{ login repositories settings }

      before '/:user/:repo/?*' do
        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo.message == "Not Found"
        else
          repo = gh.repos params[:user], params[:repo]
          raise Sinatra::NotFound if repo.message == "Not Found"
        end
      end

      get '/', is_logged_in: true do
        @parameters = params
        @repos = huboard.all_repos
        @private = nil
        @user = gh.users(current_user.login)
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


      get '/:user/:repo/backlog/?' do
        redirect "/#{params[:user]}/#{params[:repo]}/#/milestones"
      end

      get '/:user/:repo/beta/?' do
        redirect "/#{params[:user]}/#{params[:repo]}/#/"
      end

      get '/:user/:repo/?' do
        UseCase::FetchBoard.new(huboard).run(params).match do
          success do
            @parameters = params.merge({ :socket_backend => socket_backend})

            @repo = gh.repos(params[:user],params[:repo])
            if logged_in?
              begin
                is_a_collaborator = @repo.permissions.push
                @repo.merge!(is_collaborator: is_a_collaborator)
              rescue
                @repo.merge!(is_collaborator: true)
              end
            else
              @repo.merge!(is_collaborator: false)
            end

            erb :ember_board, layout: :layout_ember
          end

          failure :not_found do
            raise Sinatra::NotFound
          end

          failure :no_board do 
             redirect "/#{params[:user]}/#{params[:repo]}/board/create" 
          end
          failure :no_issues do
             redirect "/#{params[:user]}/#{params[:repo]}/board/enable_issues" 
          end
        end
      end

      get '/:user/:repo/board/?' do
        redirect "/#{params[:user]}/#{params[:repo]}"
      end

      get '/:user/:repo/board/enable_issues/?' do
        raise Sinatra::NotFound unless logged_in?
        @parameters = params
        @repo = gh.repos(params[:user],params[:repo])
        erb :enable_issues
      end

      post '/:user/:repo/board/enable_issues/?' do
        huboard.board(params[:user], params[:repo]).enable_issues
        redirect "/#{params[:user]}/#{params[:repo]}/"
      end

      get '/:user/:repo/board/create/?' do
        raise Sinatra::NotFound unless logged_in?
        @parameters = params
        @repo = gh.repos(params[:user],params[:repo])
        erb :create_board
      end

      post '/:user/:repo/board/create/?' do
        huboard.board(params[:user], params[:repo]).create_board
        redirect "/#{params[:user]}/#{params[:repo]}/"
      end
    end
  end
end
