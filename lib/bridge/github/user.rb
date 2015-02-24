module Warden
  module GitHub
    class User
      def safe_avatar_url
        return attribs['avatar_url'] unless attribs['avatar_url'].nil?
        "https://secure.gravatar.com/avatar/" + attribs['gravatar_id'] + "?d=retro"
      end
    end
  end
end
