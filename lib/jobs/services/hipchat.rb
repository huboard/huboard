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

  def avatar(mash)
    "<a href='#{URI.join(github_url,mash.meta.user.login)}'> <img src='#{mash.meta.user.avatar_url}' height='25' width='25'/></a>&nbsp"
  end

  def transform_moved(mash)
    {
      color: 'purple',
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> moved <a href='#{mash.payload.issue.html_url}'>#{mash.payload.issue.title}</a> from <b>#{mash.payload.previous.text}</b> to <b>#{mash.payload.column.text }</b>",
      notify: true,
      message_format: 'html'
    }
  end

  def transform_assigned(mash)
    assigned = mash.payload.assignee.nil? ? 'unassigned:' : 'assigned'
    issue_assignee = mash.payload.assignee.nil? ? '' : "<a href='#{mash.payload.assignee.html_url}'> #{mash.payload.assignee.login} </a>"
    to = mash.payload.assignee.nil? ? '' : 'to '
    {
      color: 'purple',
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> #{assigned} #{issue_assignee} #{to}<a href='#{mash.payload.issue.html_url}'>#{mash.meta.repo_full_name}##{mash.payload.issue.number}</a><br><b>#{mash.payload.issue.title}</b><br>#{mash.payload.issue.body}",
      notify: true,
      message_format: 'html'
    }
  end

  def transform_milestone_changed(mash)
    milestone = mash.payload.milestone.nil? ? "No Milestone" : mash.payload.milestone.title
    {
      color: 'purple',
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> changed milestone of <a href='#{mash.payload.issue.html_url}'>#{mash.payload.issue.title}</a> to #{milestone}",
      notify: true,
      message_format: 'html'
    }
  end

  def transform_issue_status_changed(mash)
    color = {
      unready: "yellow",
      ready: "green",
      blocked: "red",
      unblocked: "green"
    }
    {
      color: "#{color[mash.payload.action.to_sym]}",
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> changed the status of <a href='#{mash.payload.issue.html_url}'>#{mash.meta.repo_full_name}##{mash.payload.issue.number}</a> to #{mash.payload.action}<br><b>#{mash.payload.issue.title}</b><br>#{mash.payload.issue.body}",
      notify: true,
      message_format: 'html'
    }
  end

  def transform_issue_opened(mash)
    {
      color: "purple",
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> opened a new issue <a href='#{mash.payload.issue.html_url}'>#{mash.meta.repo_full_name}##{mash.payload.issue.number}</a> <br><b>#{mash.payload.issue.title}</b><br>#{mash.payload.issue.body}",
      notify: true,
      message_format: 'html'
    }
  end

  def transform_issue_closed(mash)
    {
      color: "purple",
      message: "#{avatar(mash)} <a href='#{URI.join(github_url,mash.meta.user.login)}'> #{mash.meta.user.login} </a> closed <a href='#{mash.payload.issue.html_url}'>#{mash.meta.repo_full_name}##{mash.payload.issue.number}</a> <br><b>#{mash.payload.issue.title}</b><br>#{mash.payload.issue.body}",
      notify: true,
      message_format: 'html'
    }
  end

  # No Such Event
  #def transform_issue_reopened(hash)
  #  {
  #    color: "purple",
  #    message: "#{URI.join(github_url,mash.meta.user.login)} reopened #{mash.payload.issue.html_url} \nTitle: #{mash.payload.issue.title}",
  #    notify: true,
  #    message_format: 'text'
  #  }
  #end
end
