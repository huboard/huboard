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

      customer_doc = QueryHandler.run do |q|
        q << Queries::CouchCustomer.get(@repo_user["id"], @couch)
        q << Queries::PassThrough.go
      end
      return fail(:pass_through) if customer_doc[:pass_through]

      @customer = account_exists?(customer_doc) ? customer_doc[:rows].first.value : false
      if !@customer && user_is_owner(params)
        @customer = create_new_account(@gh.user, @repo_user)
        continue(params)
      else
        continue(params)
      end
    end

    def a_trial_available?(params)
      return fail(:unauthorized) unless @customer
      if trial_available?(@customer) && user_is_owner(params)
        params[:trial_available] = true
        continue(params)
      else
        continue(params)
      end
    end

    def has_subscription?(params)
      return continue(params) if params[:trial_available] || trial_active?(@customer)
      if subscription_active?(@customer) && @repo_user["type"] == "User"
        return continue(params)
      else
        query = Queries::CouchCustomer.get(@repo_user["id"], @couch)
        customer_doc = QueryHandler.exec(&query)
        customer = customer_doc ? customer_doc[:rows].first.value : false
      end
      return fail :unauthorized unless customer && subscription_active?(customer)
      return continue(params)
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
