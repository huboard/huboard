class PublishWebhookJob < ActiveJob::Base
  def couch
    @couch ||= HuBoard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
  end

  def perform(payload)
    full_name = payload[:meta][:repo_full_name]

    result = couch.integrations.by_full_name "\"#{CGI.escape(full_name.gsub("/","-"))}\""

    result.rows.each do |r|
      begin
        service = HuBoard::Services.services.detect { |srv| srv.to_s == "HuBoard::#{r.value.integration.name}" }
        srv = service.new payload[:meta][:action], r.value.integration.data, payload
        srv.receive_event()
      rescue => e
        bc = ActiveSupport::BacktraceCleaner.new
        bc.add_silencer { |line| line =~ /mongrel|rubygems|\.rbenv/ }
        bc.add_filter   { |line| line.gsub(Rails.root.to_s, '') }
        Rails.logger.error "error publishing event \n    Exception: #{e}\n    Backtrace:\n        #{bc.clean(e.backtrace) * "\n        "}"
      end
    end

  end
end
