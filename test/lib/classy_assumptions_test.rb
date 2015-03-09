require 'test_helper'


class ClassyAssumptionsTest < ActiveSupport::TestCase
  class BobBase
    def self.bob
      @bob ||= "bob"
    end
    def self.set_bob(bob)
      @bob = bob
    end
    def perform
      payload
    end
  end
  class Frank < BobBase
    def get_bob_class
      self.class.bob
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

  test 'class variables arent altered' do
    bill = Bill.new
    assert bill.get_bob_class == "bob"
    assert bill.get_bob == 'bill'

    frank = Frank.new
    assert frank.get_bob_class == "bob"

    bill.class.set_bob "bill"

    assert frank.get_bob_class != bill.get_bob_class
  end


end
