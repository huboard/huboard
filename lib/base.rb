require "hashie"
class BadAuthentication < Sinatra::Base
  get '/unauthenticated' do
    status 403
    <<-EOS
      <h2>Unable to authenticate, sorry bud.</h2>
      <p>#{env['warden'].message}</p>
    EOS
  end
end
class HuboardApplication < Sinatra::Base

  enable  :sessions
  enable  :raise_errors
  disable :show_exceptions

  if File.exists? "#{File.dirname(__FILE__)}/../.settings"
    puts "settings file"
    token_file =  File.new("#{File.dirname(__FILE__)}/../.settings")
    # TODO: read this from a yaml
    eval(token_file.read) 
  elsif ENV['GITHUB_CLIENT_ID']
    set :secret_key, ENV['SECRET_KEY']
    set :team_id, ENV["TEAM_ID"]
    set :user_name, ENV["USER_NAME"]
    set :password, ENV["PASSWORD"]
    GITHUB_CONFIG = {
      :client_id     => ENV['GITHUB_CLIENT_ID'],
      :client_secret => ENV['GITHUB_SECRET'],
      :scope => "public_repo"
    }
    set :session_secret, ENV["SESSION_SECRET"]
    set :socket_backend, ENV["SOCKET_BACKEND"]
    set :socket_secret, ENV["SOCKET_SECRET"]

  else
    raise "Configuration information not found: you need to provide a .settings file or ENV variables"
  end

  puts settings.session_secret

  helpers Huboard::Common::Helpers
  use Rack::Session::Cookie, :key => 'rack.session', :path => '/', :secret => settings.session_secret
  set :views, File.expand_path("../views",File.dirname(__FILE__))

  use Warden::Manager do |config|
    config.failure_app = BadAuthentication
    config.default_strategies :github
    config.scope_defaults :default, :config => GITHUB_CONFIG
    config.scope_defaults :private, :config => GITHUB_CONFIG.merge(:scope => 'repo')
  end

  helpers do
    def warden
      env['warden']
    end

    def authenticate!(*args)
      warden.authenticate!(*args)
    end

    def authenticated?(*args)
      warden.authenticated?(*args)
    end
    def logout!
      warden.logout
    end

    # The authenticated user object
    #
    # Supports a variety of methods, name, full_name, email, etc
    def github_user
      warden.user(:private) || warden.user || Hashie::Mash.new
    end
  end
end
