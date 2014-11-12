class HipChat < Huboard::Service
  def connection
    @connection ||= Faraday.new do |builder|
      builder.response :logger
      builder.request :url_encoded
      builder.adapter Faraday.default_adapter
    end
  end

  def receive_event
    if self.respond_to? "transform_#{event.to_s}"
      mash = Hashie::Mash.new payload
      mash.payload.issue.body_text = mash.payload.issue.body if mash.payload.issue.body_text.nil?
      hipchat_post_data = self.send("transform_#{event.to_s}", mash)
      connection.post do |req|
        req.url data.webhookURL
        req.headers['Content-Type'] = 'application/json'
        req.body = hipchat_post_data.to_json
      end
    end
  end

  def github_url
    ENV["GITHUB_WEB_ENDPOINT"] || "https://github.com/"
  end

  def transform_moved(mash)
    {
      color: 'purple',
      message: "#{URI.join(github_url,mash.meta.user.login)} moved #{mash.payload.issue.title}(#{mash.payload.issue.html_url}) from #{mash.payload.previous.text} to #{mash.payload.column.text }",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_assigned(mash)
    assigned = mash.payload.assignee.nil? ? 'unassigned:' : 'assigned'
    issue_assignee = mash.payload.assignee.nil? ? '' : mash.payload.assignee.html_url
    to = mash.payload.assignee.nil? ? '' : 'to '
    {
      color: 'purple',
      message: "#{URI.join(github_url,mash.meta.user.login)} #{assigned} #{issue_assignee} #{to}#{mash.payload.issue.title}(#{mash.payload.issue.html_url})",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_milestone_changed(mash)
    milestone = mash.payload.milestone.nil? ? "No Milestone" : mash.payload.milestone.title
    {
      color: 'purple',
      message: "#{URI.join(github_url,mash.meta.user.login)} changed milestone of #{mash.payload.issue.html_url} to #{milestone}",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_issue_status_changed(mash)
    color = {
      unready: "yellow",
      ready: "purple",
      blocked: "red",
      unblocked: "green"
    }
    {
      color: "#{color[mash.payload.action.to_sym]}",
      message: "#{URI.join(github_url,mash.meta.user.login)} changed the status of #{mash.payload.issue.html_url} to #{mash.payload.action} \nTitle: #{mash.payload.issue.title}",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_issue_opened(mash)
    {
      color: "purple",
      message: "#{URI.join(github_url,mash.meta.user.login)} opened a new issue #{mash.payload.issue.html_url} \nTitle: #{mash.payload.issue.title}",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_issue_closed(mash)
    {
      color: "purple",
      message: "#{URI.join(github_url,mash.meta.user.login)} closed #{mash.payload.issue.html_url} \nTitle: #{mash.payload.issue.title}",
      notify: true,
      message_format: 'text'
    }
  end

  def transform_issue_reopened(hash)
    {
      color: "purple",
      message: "#{URI.join(github_url,mash.meta.user.login)} reopened #{mash.payload.issue.html_url} \nTitle: #{mash.payload.issue.title}",
      notify: true,
      message_format: 'text'
    }
  end
end
