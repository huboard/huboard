require 'test_helper'

class UberDictionaryTest < ActiveSupport::TestCase
  test "should call on missing lambda once" do
    times = 0
    dictionary = UberDictionary.new ->(key) { times+=1; key + "_foo" }

    assert dictionary['a'] == "a_foo"
    assert_equal times, 1
    # test it again, the value should be cached now
    assert dictionary['a'] == "a_foo"
    assert_equal times, 1
  end

  test 'should consider hashes as a valid key' do
    times = 0
    dictionary = UberDictionary.new ->(key) { times+=1; {} }

    dictionary[{a: :b}]
    assert_equal times, 1
    dictionary[{a: :b}]
    assert_equal times, 1
  end

  test "should call on addition" do
    on_addition = false
    dictionary = UberDictionary.new ->(key) { key + "_foo" }
    dictionary.on_addition = ->(value) { on_addition = value } 

    dictionary['a']

    assert on_addition == "a_foo"
  end
  test "should respond to each" do 
    dictionary = UberDictionary.new ->(key) { key + "_foo" }
    dictionary['a']

    assert dictionary.count > 0
    assert dictionary.first == "a_foo"
  end
end
