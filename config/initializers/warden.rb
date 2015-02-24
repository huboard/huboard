Warden::GitHub::Rails.setup do |config|
  config.add_scope :default,  
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'public_repo'

  config.add_scope :private, 
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'repo'

  config.default_scope = :default
end
Warden::Manager.serialize_from_session { |key| p Warden::GitHub::Verifier.load(key) }
Warden::Manager.serialize_into_session { |user| p Warden::GitHub::Verifier.dump(user) }

