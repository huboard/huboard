class UberDictionary
  include Enumerable
  attr_accessor :on_missing
  attr_writer :on_addition
  def initialize(on_missing = ->(key) { throw "Missing key:#{key}" })
    @on_missing = on_missing
    @on_addition = Proc.new {}
    @inner_hash = HashWithIndifferentAccess.new
    @inner_hash.default_proc = ->(hash, key) {
      value = @on_missing.call(key)
      @on_addition.call value
      hash[key] = value
    }
  end

  def each
    @inner_hash.each do |key, value| 
      yield value
    end
  end

  def [](*args)
    @inner_hash.send(:[], *args)
  end

end
