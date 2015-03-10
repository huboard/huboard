module HuBoard
  class Services
    attr_accessor :event, :data, :payload

    def initialize(event, data, payload)
      @event = event.to_sym
      @data = data || {}
      @payload = payload
    end

    def self.services
      @services ||= []
    end

    def self.inherited(type)
      Services.services << type
      super
    end
  end
end
# TODO: changes this to a class resolver or a gem
require_relative "services/gitter"
require_relative "services/hip_chat"
require_relative "services/slack"
require_relative "services/webhook"
