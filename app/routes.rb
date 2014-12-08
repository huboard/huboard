module HuBoard
  module Routes
    autoload :Base, 'app/routes/base'
    autoload :Failure, 'app/routes/failure'
    autoload :Fallback, 'app/routes/fallback'
    autoload :Assets, 'app/routes/assets'
    autoload :Static, 'app/routes/static'

    autoload :Marketing, 'app/routes/marketing'
    autoload :Login, 'app/routes/login'
    autoload :Repositories, 'app/routes/repositories'
    autoload :Profiles, 'app/routes/profiles'

    module Api
      autoload :Base, 'app/routes/api/base'
      autoload :Milestones, 'app/routes/api/milestones'
      autoload :Board, 'app/routes/api/board'
      autoload :Issues, 'app/routes/api/issues'
      autoload :Integrations, 'app/routes/api/integrations'
      autoload :Webhooks, 'app/routes/api/webhooks'
      autoload :Profiles, 'app/routes/api/profiles'
      autoload :Uploads, 'app/routes/api/uploads'
    end
  end
end
