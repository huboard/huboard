require 'test_helper'

class TestExistsJob; end
class TestJob; end

class JobResolverTest < ActiveSupport::TestCase
  test "should return a no op proc" do
    assert JobResolver.find_job(controller: "herp", action: "derp") == JobResolver::Noop 
  end

  test "should resolve a test class" do
    assert JobResolver.find_job(controller: "test", action: "exists") == TestExistsJob
  end

  test "should resolve the generic fallback class" do
    assert JobResolver.find_job(controller: "test", action: "not_exists") == TestJob
  end
end
