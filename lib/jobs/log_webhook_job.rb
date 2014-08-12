class LogWebhookJob
  include SuckerPunch::Job

  def perform(payload)
    Faraday.post "http://requestb.in/1jc4rdk1", payload
  rescue
  end

  def production?
    ENV["RACK_ENV"] == "production" || ENV["RACK_ENV"] == "staging"
  end

  def log payload
    if production?
      async.perform payload
    else
      perform payload
    end
  end
end
