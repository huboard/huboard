module UseCase
  class PrivateRepo
    include SolidUseCase

    attr_reader :repo_user, :gh_user, :couch
    def initialize(repo_user, gh_user, couch)
      @repo_user = repo_user
      @gh_user = gh_user
      @couch = couch
    end

    steps :an_account_exists?, :a_trial_available?, :has_subscription?

    def an_account_exists?(customer)
      if !account_exists?(@repo_user) && user_is_owner  
        create_new_account(@gh_user, @repo_user)
        continue customer
      else
        continue customer
      end
    end

    def a_trial_available?(customer)
      if trial_available?(customer) && user_is_owner
        redirect "/settings/trial"
        continue(customer)
      else
        continue(customer)
      end
    end

    def has_subscription?(customer)
      if subscription_active?(customer)
        continue(customer)
      else
        alt_customer = couch.customers.findPlanById @gh_user['id']
        fail :unauthorized unless subscription_active?(alt_customer)
      end
    end

    :private
    def user_is_owner
      @repo_user['login'] == @gh_user['login']
    end
  end
end
