require 'test_helper'


class ClassyAssumptionsTest < ActiveSupport::TestCase
  class BobBase
    def self.bob
      @bob ||= "bob"
    end
    def perform
      payload
    end
  end
  class Bill < BobBase
    def initialize
      @bob = "bill"
    end
    def payload
      "payload"
    end

    def get_bob
      @bob
    end
    def get_bob_class
      self.class.bob
    end
  end

  test 'base class has access to inheritors methods' do
    assert Bill.new.perform == "payload"
  end

  test 'class variable different from instance variable' do
    bill = Bill.new
    assert bill.get_bob_class == "bob"
    assert bill.get_bob == 'bill'
  end
end
