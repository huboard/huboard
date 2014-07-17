module HuBoard
  module Routes
    autoload :Base, 'app/routes/base'
    autoload :Assets, 'app/routes/assets'
    autoload :Static, 'app/routes/static'

    autoload :Marketing, 'app/routes/marketing'
    autoload :Login, 'app/routes/login'
    autoload :Repositories, 'app/routes/repositories'

    module Api
      autoload :Base, 'app/routes/api/base'
      autoload :Board, 'app/routes/api/board'
    end
  end
end
