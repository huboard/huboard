require_relative "helpers"

module Huboard
  class API < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    puts "settings.root #{settings.root}"
    if File.exists? "#{File.dirname(__FILE__)}/../.settings"
      puts "settings file"
      token_file =  File.new("#{File.dirname(__FILE__)}/../.settings")
      eval(token_file.read) 
    end

    if ENV['GITHUB_CLIENT_ID']
      set :secret_key, ENV['SECRET_KEY']
      set :github_options, {
        :secret    => ENV['GITHUB_SECRET'],
        :client_id => ENV['GITHUB_CLIENT_ID'],
      }
      set :session_secret, ENV["SESSION_SECRET"]
    end
   settings.github_options[:scopes] = "user,repo"

    before do
      authenticate! unless authenticated?
    end

    # json api
    get '/:user/:repo/milestones' do
      return json pebble.milestones(params[:user],params[:repo])
    end

    get '/:user/:repo/board' do 
      return json pebble.board(params[:user], params[:repo])
    end

    post '/:user/:repo/reorderissue' do 
      milestone = params["issue"]
      json pebble.reorder_issue params[:user], params[:repo], milestone["number"], params[:index]
    end

    post '/:user/:repo/reordermilestone' do 
      milestone = params["milestone"]
      json pebble.reorder_milestone params[:user], params[:repo], milestone["number"], params[:index]
    end

    post '/:user/:repo/movecard' do 
      json pebble.move_card params[:user], params[:repo], params[:issue], params[:index]
    end

    post '/:user/:repo/close' do                                                               
      json pebble.close_card params[:user], params[:repo], params[:issue]
    end

    get "/token" do
      return "User Token: #{user_token}"
    end

  end
end
