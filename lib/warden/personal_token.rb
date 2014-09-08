module HuBoard
  module Strategies
    class User
      def self.authenticate(token)
        Warden::GitHub::User.load token
      end
    end
    class PersonalTokenStrategy < WardenStrategies::Simple
      config do |c|
        c[:required_params] = [:token]
        c[:user_class] = User
      end
    end
    ::Warden::Strategies.add(:personal_token, PersonalTokenStrategy)
  end
end

