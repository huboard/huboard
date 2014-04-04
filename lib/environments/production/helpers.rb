class Huboard
  module Common
    module Helpers extend self
      def render_view(*args)
        erb(*args)

      end
    end
  end
end
