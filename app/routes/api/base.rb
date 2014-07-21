module HuBoard
  module Routes
    module Api
      class Base < Sinatra::Application
        configure do
          set :views, 'app/views'
          set :root, File.expand_path('../../../', __FILE__)

          disable :method_override
          disable :protection
          disable :static

          set :erb, layout_options: {views: 'app/views/layouts'}

          set :raise_errors, true
        end

        RESERVED_URLS = %w{ site profiles }

        before '/api/:user/:repo/?*' do
          return if RESERVED_URLS.include? params[:user]

          if authenticated? :private
            repo = gh.repos params[:user], params[:repo]

            raise Sinatra::NotFound if repo.message == "Not Found"
          else
            repo = gh.repos params[:user], params[:repo]
            raise Sinatra::NotFound if repo.message == "Not Found"
          end
        end

        helpers Helpers

        not_found do
          json(message: "Not found")
        end
      end
    end
  end
end
