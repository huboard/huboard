class IssueEventJob < ActiveJob::Base

  before_enqueue :guard_against_double_events

  def self.action(action)
    @_action = action
  end

  @_timestamp = Proc.new { Time.now.utc.iso8601 }
  def self.timestamp(override=nil)
    if override
      @_timestamp = override
    else
      @_timestamp
    end
  end
  @_timestamp = Proc.new { Time.now.utc.iso8601 }
  def self.timestamp(override=nil)
    if override
      @_timestamp = override
    else
      @_timestamp
    end
  end

  def self.build_meta(params)
    issue = params['issue']
    HashWithIndifferentAccess.new(
      action: @_action,
      timestamp: @_timestamp.call(params),
      correlationId: params['action_controller.params']['correlationId'],
      user: params['current_user'],
      repo_full_name: "#{issue[:repo][:owner][:login]}/#{issue[:repo][:name]}"
    )
  end

  def guard_against_double_events
    payload = { meta:  self.class.build_meta(self.arguments.first) }
    Rails.cache.with do |dalli|
      key = "#{payload[:meta][:action]}.#{payload[:meta][:user]["login"]}.#{payload[:meta][:identifier]}.#{payload[:meta][:timestamp]}"
      return false if dalli.get(key)
      dalli.set(key, payload.to_s)
    end
  end

  def perform(params)
    deliver payload(params)
  end

  def deliver(payload)
    message = { 
      meta: self.class.build_meta(arguments.first),
      payload: payload
    }
    client = ::Faye::Redis::Publisher.new({})
    client.publish "/" + message[:meta][:repo_full_name], message
  end
end
