module Stint
  module Cache
    @the_wrapped_methods = []
    @alias = {}
    @cache = {}

    def cache(method_name)
      cached_methods  << method_name
    end

    def cached_methods
      @the_wrapper_methods ||= []
    end

    def method_added(method)
      if(cached_methods.include?(method))
        #how to get the method name?
      end
    end

    def cache_call(args)
      #cache check
      key = args.join #how?
      if @cache[key].nil?
        result = @alias[method]
        cache[key] = result
      end if
      result
    end
  end
end
