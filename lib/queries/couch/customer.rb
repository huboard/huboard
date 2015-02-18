module Queries
  class CouchCustomer

    def self.get(id, connection)
      -> { connection.customers.findPlanById(id) }
    end

    def self.get_cust(id, connection)
      -> { connection.connection.get("Customers-#{id}").body }
    end
  end
end
