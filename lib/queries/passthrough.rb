module Queries
  class PassThrough

    def self.go
      -> { {pass_through: true} }
    end
  end
end
