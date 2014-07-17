module HuBoard
  module Routes
    class Marketing < Base

      helpers do
        def cloudfront_path(image)
          URI::join(ENV["CLOUDFRONT_URL"],image)
        end

        def controller?(*controller)
          controller.include?(@controller) ? "nav__item--current" : ""
        end
      end

      get "/" do
        erb :marketing, layout: :marketing
      end
    end
  end
end
