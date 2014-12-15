module HuBoard
  module Routes
    class SassLogin < Base
      helpers do
        def controller?(*controller)
          controller.include?(@controller) ? "nav__btn--active nav__item--current" : ""
        end
      end

      get "/login/?" do
        @controller = "login"
        erb :login_sass, layout: false
      end
    end

    class Marketing < Base
      helpers do
        def cloudfront_path(image)
          ENV['HUBOARD_ENV'] == "production" ? URI::join(ENV["CLOUDFRONT_URL"],image) : "assets/#{image}" 
        end

        def controller?(*controller)
          controller.include?(@controller) ? "nav__item--current" : ""
        end
      end

      get "/", is_logged_in: false do
        @controller = params[:controller] || "home"
        erb :marketing, layout: :marketing
      end

      get "/site/privacy/?" do
        @controller = "privacy"
        erb :privacy, layout: :marketing
      end

      get "/site/terms/?" do
        @controller = "terms"
        erb :terms_of_service, layout: :marketing
      end

      get '/pricing/?' do
        @controller = "pricing"
        erb :pricing, layout: :marketing
      end

      get '/integrations/?' do
        @controller = "integrations"
        erb :integrations, layout: :marketing
      end

      use SassLogin
    end
  end
end
