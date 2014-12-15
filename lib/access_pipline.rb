require 'solid_use_case'

module AccessPipeline
  def self.included(base)
    base.extend ClassMethods
  end

  def run(*args)
    usecase_class.run(*args)
      .match(&usecase_resolver)
  end

  def method_missing(method, *args, &block)
    return usecase_class.send(method, *args, &block)
  end

  module ClassMethods
    extend self
    def usecase(usecase_class, &usecase_resolver)
      define_method(:usecase_class) do
        instance_variable_get("@usecase_class") ||
          instance_variable_set("@usecase_class", usecase_class)
      end
      define_method(:usecase_resolver) do
        instance_variable_get("@usecase_resolver") ||
          instance_variable_set("@usecase_resolver", usecase_resolver)
      end
    end
  end
end
