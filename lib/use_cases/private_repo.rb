module UseCase
  class PrivateRepo
    include SolidUseCase

    attr_accessor :couch, :gh
    def initialize(gh, couch)
      @gh = gh
      @couch = couch
    end

    steps :an_account_exists?, :a_trial_available?, :has_subscription?

    def an_account_exists?(params)
      @repo_user ||= @gh.users(params[:user])

      @customer = QueryHandler.run do |q|
        q << Queries::CouchCustomer.get(@repo_user["id"], @couch)
        q << Queries::PassThrough.go
      end

      return fail(:pass_through) if @customer[:pass_through]
      if !account_exists?(@customer) && user_is_owner(params)
        create_new_account(@gh.user, @repo_user)
        continue(params)
      else
        continue(params)
      end
    end

    def a_trial_available?(params)
      if trial_available?(@customer) && user_is_owner(params)
        params[:trial_available] = true
        return continue(params)
      else
        continue(params)
      end
    end

    def has_subscription?(params)
      if subscription_active?(@customer)
        continue(params)
      else
        alt_customer = couch.customers.findPlanById @gh.user['id']
        fail :unauthorized unless subscription_active?(alt_customer)
      end
    end

    :private
    def user_is_owner(params)
      if @repo_user["type"] == "Organization"
        @u ||= @gh.orgs(@repo_user["login"]).memberships(@gh.user["login"]) do |req|
          req.headers["Accept"] = "application/vnd.github.moondragon+json"
        end
        return @u["role"] == "admin"
      end
      @repo_user['login'] == @gh.user['login']
    end
  end
end
