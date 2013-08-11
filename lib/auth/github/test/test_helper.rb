require 'warden/test/helpers'
require 'warden/github/user'

module Sinatra
  module Auth
    module Github
      module Test
        module Helper
          include(Warden::Test::Helpers)
          def make_user(attrs = {})
            User.make(attrs)
          end

          class User < Warden::GitHub::User
            def self.make(attrs = {})
              default_attrs = {
                 'login'   => "test_user",
                 'name'    => "Test User",
                 'email'   => "test@example.com",
                 'company' => "GitHub",
                 'gravatar_id' => 'https://a249.e.akamai.net/assets.github.com/images/gravatars/gravatar-140.png'
              }
              default_attrs.merge! attrs
              User.new(default_attrs)
            end
          end
        end
      end
    end
  end
end
