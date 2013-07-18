require 'sinatra'
require 'sinatra/content_for'
class Huboard
  class Accounts < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    extend Huboard::Common::Settings

     def initialize(app = nil, params = {})
      super(app)
      @parameters = {}
     end

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
