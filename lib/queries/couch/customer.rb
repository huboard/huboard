module Queries
  class CouchCustomer

    def self.get(id, connection)
      -> { connection.customers.findPlanById(id) }
    end
  end
end
