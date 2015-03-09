class PublishWebhookJob < ActiveJob::Base
  def couch
    @couch ||= HuBoard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
  end

  def perform(payload)
    full_name = payload[:meta][:repo_full_name]

    result = couch.integrations.by_full_name "\"#{CGI.escape(full_name.gsub("/","-"))}\""

    result.rows.each do |r|
      begin
        service = HuBoard::Service.services.detect { |srv| srv.to_s == r.value.integration.name }
        srv = service.new payload[:meta][:action], r.value.integration.data, payload
        srv.receive_event()
      rescue => e
        Rails.logger.error "error publishing event #{r} \n    Backtrace:\n    #{e.backtrace * "\n"}"
      end
    end

  end
end
