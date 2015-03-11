
Rails.application.middleware.insert_after ActionDispatch::Flash, Warden::Manager do |config|
  config.scope_defaults :private, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'repo'
  }
  config.scope_defaults :default, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'public_repo'
  }

  config.failure_app = Rails.application.routes

end


Warden::Manager.serialize_from_session { |key| Warden::GitHub::Verifier.load(key) }
Warden::Manager.serialize_into_session { |user| Warden::GitHub::Verifier.dump(user) }

