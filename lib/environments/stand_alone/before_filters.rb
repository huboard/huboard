class Huboard
  class App

    PUBLIC_URLS = ['/', '/logout','/webhook', '/site/privacy','/site/terms']
    RESERVED_URLS = %w{ assets repositories images about site login logout favicon.ico robots.txt }

    before "/:user/:repo/?*" do 

      return if RESERVED_URLS.include? params[:user]

      if authenticated? :private
        repo = gh.repos params[:user], params[:repo]

        raise Sinatra::NotFound if repo.message == "Not Found"

      else
        repo = gh.repos params[:user], params[:repo]
        raise Sinatra::NotFound if repo.message == "Not Found"
      end
    end
  end
  class API 

    PUBLIC_URLS = ['/authorized']
    RESERVED_URLS = %w{ subscribe settings profiles v2 site }

    before "/:user/:repo/?*" do 
      
      return if RESERVED_URLS.include? params[:user]

      if authenticated? :private
        repo = gh.repos(params[:user], params[:repo]).raw
      else
        repo = gh.repos(params[:user], params[:repo]).raw
      end

      raise Sinatra::NotFound if repo.status == 404

    end
  end
end

