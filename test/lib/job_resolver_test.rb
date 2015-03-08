require 'test_helper'

class TestExistsJob; end

class JobResolverTest < ActiveSupport::TestCase
  test "should return a no op proc" do
    assert JobResolver.find_job(controller: "test", action: "foo") == JobResolver::Noop 
  end

  test "should resolve a test class" do
    assert JobResolver.find_job(controller: "test", action: "exists") == TestExistsJob
  end
  
end
