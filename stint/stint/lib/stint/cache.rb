module stint

  module Cache
    @the_wrapped_methods = []
    @alias = {}
    @cache = {}

    def cache(method_name)
      @the_wrapped_methods << method_name
    end

    def self.method_added(method)
      if(@the_wrapped_methods.include?(method))
        #how to get the method name?
        @alias[method]=method
      end
    end

    def cache_call(args)
      #cache check
      key = args.join #how?
      if @cache[key].nil?
        result = @alias[method](args)
        cache[key] = result
      end if
      result
    end
  end
end
