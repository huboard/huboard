class Webhook < Huboard::Service
  def receive_event
    Faraday.post do |req|
      req.url data.webhookURL
      req.headers['Content-Type'] = 'application/json'
      req.body = payload.to_json
    end
  end
end

