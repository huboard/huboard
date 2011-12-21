require File.dirname(__FILE__) + '/spec_helper'

class Bob
  extend Stint::Cache

  cache :bob

  def bob(a,b)
  end
end

describe "something cool" do
  it 'should cache methods' do
  end

  it 'should leave other methods alone' do
  end
end
