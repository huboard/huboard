class Gitter < Huboard::Service
  def connection
    @connection ||= Faraday.new do |builder|
      builder.response :logger
      builder.request :url_encoded
      builder.adapter Faraday.default_adapter
    end
  end

  def receive_event
    connection.post do |req|
      req.url data.webhookURL
      req.headers['Content-Type'] = 'application/json'
      req.body = payload.to_json
    end
  end
end
