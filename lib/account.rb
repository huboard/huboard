require 'sinatra'
require 'sinatra/content_for'
require 'stripe'

class Huboard
  class Accounts < HuboardApplication

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
      set :stripe_publishable_key, ENV['STRIPE_PUBLISHABLE_API']
    else
      raise "Configuration information not found: you need to provide a .settings file or ENV variables"
    end

    Stripe.api_key = settings.stripe_key

    before do
      protected!
    end

    helpers do
      def protected! 
        return current_user if authenticated? :private
        authenticate! :scope => :private
      end

    end


    get "/profile/?" do

      @user = gh.user
      @orgs = gh.orgs

      erb :accounts, :layout => :ember_layout
    end

    post "/charge/:org/?" do 

      customer = Stripe::Customer.create(
        :email => params[:email],
        :card  => params[:stripeToken],
        :plan =>  params[:plan]
      )

      user = gh.user
      org = gh.orgs(params[:org])

      couch.customers.save({
         "id" => customer.id,
         github: {
          :user => user.to_hash,
          :org => org.to_hash
         },
         stripe: {
            customer: customer
         }
      })

      erb :charge
    end

    helpers Sinatra::ContentFor
  end
end
