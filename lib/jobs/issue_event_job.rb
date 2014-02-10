require 'time'

class IssueEventJob
  include SuckerPunch::Job

  def perform(payload)
    if ENV["SOCKET_BACKEND"]
      Faraday.post do |req|
        req.url "#{ENV["SOCKET_BACKEND"]}/hook"
        #req.url "http://requestb.in/1d0hd3s1"
        req.headers['Content-Type'] = 'application/json'
        req.body = payload.merge({secret: ENV["SOCKET_SECRET"]}).to_json
      end
    end
    Faraday.post do |req|
      #req.url "#{ENV["SOCKET_BACKEND"]}/hook"
      req.url "http://requestb.in/1d0hd3s1"
      req.headers['Content-Type'] = 'application/json'
      req.body = payload.to_json
    end
  rescue
  end

  def production?
    ENV["RACK_ENV"] == "production" || ENV["RACK_ENV"] == "staging" 
  end

  def execute payload
    if production?
      async.perform payload 
    else
      perform payload
    end
  end
end

class IssueMovedEvent < IssueEventJob
  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "moved",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user.attribs,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue,
        column: issue.current_state
      }
    }

    execute payload
  end
end

class IssueAssignedEvent < IssueEventJob
  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "assigned",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user.attribs,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue,
        assignee: issue.assignee
      }
    }

    execute payload
  end
end

class IssueMilestoneChangedEvent < IssueEventJob
  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "milestone_changed",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user.attribs,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue,
        milestone: issue.milestone
      }
    }

    execute payload
  end
end

class IssueClosedEvent < IssueEventJob
  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_closed",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user.attribs,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue
      }
    }

    execute payload
  end
end


