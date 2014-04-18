class Slack < Huboard::Service
  def receive_event
    if self.respond_to? "transform_#{event.to_s}"
      Faraday.post do |req|
        req.url data.webhookURL
        req.headers['Content-Type'] = 'application/json'
        slack = self.send("transform_#{event.to_s}", payload)
        slack.merge! :channel => data.channel unless data.channel.empty?
        req.body = slack.to_json
      end
    end
  end

  def github_url
    ENV["GITHUB_WEB_ENDPOINT"] || "https://github.com/"
  end

  def transform_moved(message)
    mash = Hashie::Mash.new message
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> moved <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> from #{mash.payload.previous.text} to #{mash.payload.column.text }",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> moved <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> from #{mash.payload.previous.text} to #{mash.payload.column.text }",
        text: "*Title*: #{mash.payload.issue.title}",
        mrkdwn_in: ["text","fields"],
        unfurl_links: true
      }]
    }
  end

  def transform_assigned(message)
    mash = Hashie::Mash.new message
    if mash.payload.assignee.nil?
      return {
        username: "#{mash.meta.user.login} via HuBoard",
        icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
        attachments: [{
          fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> unassigned <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
          pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> unassigned <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
          text: "*Title*: #{mash.payload.issue.title}",
          mrkdwn_in: ["text","fields"],
            unfurl_links: true
        }]
      }
    else
      return {
        username: "#{mash.meta.user.login} via HuBoard",
        icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
        attachments: [{
          fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> assigned <#{mash.payload.assignee.html_url}|#{mash.payload.assignee.login}> to <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
          pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> assigned <#{mash.payload.assignee.html_url}|#{mash.payload.assignee.login}> to <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
          text: "*Title*: #{mash.payload.issue.title}",
          mrkdwn_in: ["text","fields"],
            unfurl_links: true
        }]
      }
    end
  end

  def transform_milestone_changed(message)
    mash = Hashie::Mash.new message
    if mash.payload.milestone.nil?
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed milestone of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to _nil_",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed milestone of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to _nil_",
        text: "*Title*: #{mash.payload.issue.title}",
        mrkdwn_in: ["text","fields","pretext"],
        unfurl_links: true
      }]
    }
    else
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed milestone of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to *#{mash.payload.milestone.title}*",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed milestone of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to *#{mash.payload.milestone.title}*",
        text: "*Title*: #{mash.payload.issue.title}",
        mrkdwn_in: ["text","fields","pretext"],
        unfurl_links: true
      }]
    }
    end
  end

  def transform_issue_status_changed(message)
    icon = {
      unready: "",
      ready: ":point_right: ",
      blocked: ":x: ",
      unblocked: ""
    }
    color = {
      unready: "#e3e4e6",
      ready: "#22d186",
      blocked: "#f9646e",
      unblocked: "#e3e4e6"
    }
    mash = Hashie::Mash.new message
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "#{icon[mash.payload.action.to_sym]}<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed the status of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to #{mash.payload.action}",
        text: "#{icon[mash.payload.action.to_sym]}<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> changed the status of <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}> to #{mash.payload.action} \n*Title*: #{mash.payload.issue.title}",
        color: "#{color[mash.payload.action.to_sym]}",
        mrkdwn_in: ["text","fields"],
        unfurl_links: true
      }]
    }
  end

  def transform_issue_opened(message)
    mash = Hashie::Mash.new message
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> opened a new issue <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> opened a new issue <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        fields: [
          {title: "Title", value: "#{mash.payload.issue.title}", short: false},
          {title: "Description", value: "#{mash.payload.issue.body_text.split("\n").take(3).join("\n")}", short: false},
        ],
        color: "#6cc644",
        mrkdwn_in: ["text","fields"],
        unfurl_links: true
      }]
    }
  end

  def transform_issue_closed(message)
    mash = Hashie::Mash.new message
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> closed <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> closed <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        fields: [
          {title: "Title", value: "#{mash.payload.issue.title}", short: false},
          {title: "Description", value: "#{mash.payload.issue.body_text.split("\n").take(3).join("\n")}", short: false},
        ],
        color: "#8274d6",
        mrkdwn_in: ["text","fields"],
        unfurl_links: true
      }]
    }
  end

  def transform_issue_reopened(message)
    mash = Hashie::Mash.new message
    return {
      username: "#{mash.meta.user.login} via HuBoard",
      icon_url: "https://avatars.githubusercontent.com/u/#{mash.meta.user.id}?s=64",
      attachments: [{
        fallback: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> reopened <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        pretext: "<#{URI.join(github_url,mash.meta.user.login)}|@#{mash.meta.user.login}> reopened <#{mash.payload.issue.html_url}|#{mash.meta.repo_full_name}##{mash.payload.issue.number}>",
        fields: [
          {title: "Title", value: "#{mash.payload.issue.title}", short: false},
          {title: "Description", value: "#{mash.payload.issue.body_text.split("\n").take(3).join("\n")}", short: false},
        ],
        color: "#6cc644",
        mrkdwn_in: ["text","fields"],
        unfurl_links: true
      }]
    }
  end

end
