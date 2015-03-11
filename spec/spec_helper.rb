require "json"
require "couchrest"
require "httparty"

require 'dotenv'
Dotenv.load

require "query_handler"

def seed(fixture)
  test_customer = JSON.parse(File.read(@fixtures_path + fixture))
  doc = @couch.save_doc(test_customer)
  doc
end

RSpec.configure do |c|
  c.filter_run_excluding :webhooks

  c.around do |example|
    if example.metadata[:webhooks]
      @fixtures_path = "#{File.dirname(__FILE__)}/lib/webhooks/fixtures/"
      @couch ||= CouchRest.database("http://127.0.0.1:5984/huboard")
    end
    example.run
  end
end
