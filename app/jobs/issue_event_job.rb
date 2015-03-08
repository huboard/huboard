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

  def self.build_meta(params)
    HashWithIndifferentAccess.new(
      {
        meta: {
          action: @_action,
          timestamp: @_timestamp.call(arguments.first),
          correlationId: "",
        }
      }
    )
  end

  def guard_against_double_events(job)
    Rails.cache.with do |dalli|
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

    #PubSub.publish channel, payload
  end


end
