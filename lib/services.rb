class Service
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
    Service.services << type
    super
  end
end
