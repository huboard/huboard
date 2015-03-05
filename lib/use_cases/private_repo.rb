require "app/account_helpers"

module UseCase
  class PrivateRepo
    include HuBoard::AccountHelpers
    include SolidUseCase

    attr_accessor :couch, :gh
    def initialize(gh, couch)
      @gh = gh
      @couch = couch
    end

    steps :an_account_exists?, :a_trial_available?, :has_subscription?

    def an_account_exists?(params)
      @repo_owner ||= @gh.users(params[:user])

      plan_doc = QueryHandler.run do |q|
        q << Queries::CouchCustomer.get(@repo_owner["id"], @couch)
        q << Queries::PassThrough.go
      end
      return fail(:pass_through) if plan_doc[:pass_through]

      @customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false
      continue(params)
    end

    def a_trial_available?(params)
      if trial_available?(@customer) && user_is_owner(params)
        params[:trial_available] = true
        continue(params)
      else
        continue(params)
      end
    end

    def has_subscription?(params)
      return continue(params) if params[:trial_available] || trial_active?(@customer)
      if @customer && subscription_active?(@customer)
        return continue(params)
      end
      return fail :unauthorized
    end

    :private
    def user_is_owner(params)
      if @repo_owner["type"] == "Organization"
        @user ||= @gh.orgs(@repo_owner["login"])
          .memberships(@gh.user["login"])
        return @user["role"] == "admin"
      end
      @repo_owner['login'] == @gh.user['login']
    end
  end
end
