module HuBoard
  module Routes
    class Static < Sinatra::Application
      configure do
        set :views, 'app/views'
        set :root, File.expand_path('../../../', __FILE__)
        disable :method_override
        disable :protection
        enable :static
      end

      def static!
        return unless public_dir = settings.public_folder

        public_dir = File.expand_path(public_dir)
        path = File.expand_path(public_dir + unescape(request.path_info))
        return unless path.start_with?(public_dir) and File.file?(path)

        env['sinatra.static_file'] = path

        unless settings.development? || settings.test?
          expires 1.year.to_i, :public, max_age: 31536000
          headers 'Date' => Time.current.httpdate
        end

        send_file path, disposition: nil
      end
    end
  end
end
