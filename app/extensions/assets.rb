require 'sprockets'
require 'sprockets_memcache_store'

module HuBoard
  module Extensions
    module Assets extend self
      class UnknownAsset < StandardError; end

      PRECOMPILED_ASSETS = %w{ember-accounts.js vendor/jquery.js vendor/jquery-ui.js bootstrap.js marketing.js board/application.js marketing.css flex_layout.css application.css splash.css errors/main.css marketing/main.css bootstrap.css *.png *.jpg *.svg}

      module Helpers
        include Sprockets::Helpers
      end

      def registered(app)
        assets = Sprockets::Environment.new(app.settings.root)
        app.set :assets, assets
        app.set :precompile, PRECOMPILED_ASSETS

        assets.append_path('app/assets/javascripts')
        assets.append_path('app/assets/stylesheets')
        assets.append_path('app/assets/images')
        assets.append_path('vendor/assets/javascripts')
        assets.append_path('vendor/assets/stylesheets')

        app.set :asset_host, ''
        app.set :asset_path, -> { File.join(public_folder, "assets") }

        app.configure :production, :staging do
          assets.js_compressor  = :uglify
          assets.css_compressor = :scss

          Sprockets::Helpers.configure do |config|
            config.digest = true
            config.manifest = Sprockets::Manifest.new(app.assets, app.asset_path)
          end
        end

        app.configure do
          assets.cache = Sprockets::Cache::FileStore.new('./tmp')
          Sprockets::Helpers.configure do |config|
            config.environment = app.assets
          end
        end

        app.helpers Helpers
      end
    end
  end
end
