require 'sinatra'
require 'sinatra/content_for'
require 'stripe'
class Huboard
  class Accounts < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    extend Huboard::Common::Settings

    enable :sessions

    def initialize(app = nil)
      super(app)
      @parameters = {}
    end

    if File.exists? "#{File.dirname(__FILE__)}/../.settings"
      puts "settings file"
      token_file =  File.new("#{File.dirname(__FILE__)}/../.settings")
      # TODO: read this from a yaml
      eval(token_file.read) 
    elsif ENV['STRIPE_API']
      set :stripe_key, ENV['STRIPE_API']
    else
      raise "Configuration information not found: you need to provide a .settings file or ENV variables"
    end

    Stripe.api_key = settings.stripe_key

    before do
      protected!
    end

    helpers do
      def protected! 
        return current_user if authenticated?
        authenticate! 

        #HAX! TODO remove
        #ghee = Ghee.new({ :basic_auth => {:user_name => settings.user_name, :password => settings.password}})
        #Stint::Github.new(ghee).add_to_team(settings.team_id, current_user.login) unless github_team_access? settings.team_id
        #current_user
        #github_team_authenticate! team_id
      end

    end


    get "/profile/?" do
      erb :account
    end


    helpers Sinatra::ContentFor
  end
end
