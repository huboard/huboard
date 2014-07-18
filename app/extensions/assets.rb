require 'sprockets'
require 'sprockets_memcache_store'

module HuBoard
  module Extensions
    module Assets extend self
      class UnknownAsset < StandardError; end

      module Helpers
        include Sprockets::Helpers
      end

      def registered(app)
        # Assets
        app.set :assets, assets = Sprockets::Environment.new(app.settings.root)
        app.set :precompile, precompile = %w{ vendor/jquery-ui.js bootstrap.js marketing.js board/application.js marketing.css flex_layout.css application.css splash.css bootstrap.css *.png }

        assets.append_path('app/assets/javascripts')
        assets.append_path('app/assets/stylesheets')
        assets.append_path('app/assets/images')
        assets.append_path('vendor/assets/javascripts')
        assets.append_path('vendor/assets/stylesheets')

        app.set :asset_host, ''
        app.set :asset_path, -> { File.join(public_folder, "assets") } 


        app.configure :production, :staging do
          puts "Production"
          assets.js_compressor  = :uglify
          assets.css_compressor = :scss

          Sprockets::Helpers.configure do |config|
            config.digest = true
            config.manifest = Sprockets::Manifest.new(app.assets, app.asset_path)
          end

        end

        app.configure do
          puts "Configure"
          assets.cache = Sprockets::Cache::FileStore.new('/tmp')
          Sprockets::Helpers.configure do |config|
            config.environment = app.assets
          end
        end

        app.helpers Helpers
      end
    end
  end
end

