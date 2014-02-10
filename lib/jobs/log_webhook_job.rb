class LogWebhookJob
  include SuckerPunch::Job

  def perform(payload)
    Faraday.post "http://requestb.in/1d0hd3s1", payload
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

