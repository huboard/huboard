
require 'time'

class IssueEventJob
  include SuckerPunch::Job

  def perform(payload)
    HuBoard.cache.with do |dalli| # guard clause for double events
      key = "#{payload[:meta][:action]}.#{payload[:meta][:user]["login"]}.#{payload[:meta][:identifier]}.#{payload[:meta][:timestamp]}"
      puts "SEARCHING FOR KEY: #{key}"
      return if dalli.get(key)
      puts "SETTING KEY: #{key}"
      dalli.set(key, payload.to_s)
    end

    payload[:meta].merge! :origin => HuboardApplication.settings.server_origin

    HuBoard::PubSub.publish payload[:meta][:repo_full_name], payload


    PublishWebhookJob.new.publish payload if self.class.included_modules.include? IsPublishable
  rescue => e
    puts "ERROR: IssueEventJob: error publishing event #{e}\nBacktract:\n#{e.backtrace * "\n"}"
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

module IsPublishable; end

class PublishWebhookJob
  include SuckerPunch::Job

  def couch
    @couch ||= Huboard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
  end

  def perform payload
    full_name = payload[:meta][:repo_full_name]

    result = couch.integrations.by_full_name "\"#{CGI.escape(full_name.gsub("/","-"))}\""

    result.rows.each do |r|
      begin
        service = Huboard::Service.services.detect { |srv| srv.to_s == r.value.integration.name }
        srv = service.new payload[:meta][:action], r.value.integration.data, payload
        srv.receive_event()
      rescue => e
        puts "ERROR: PublishWebHookJob: #{e}"
      end
    end
  end

  def production?
    ENV["RACK_ENV"] == "production" || ENV["RACK_ENV"] == "staging"
  end

  def publish payload
    if production?
      async.perform payload
    else
      perform payload
    end
  end
end

class IssueStatusChangedEvent < IssueEventJob
  include IsPublishable

  def publish(issue, action, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_status_changed",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue,
        action: action
      }
    }

    execute payload
  end
end

class IssueMovedEvent < IssueEventJob
  include IsPublishable

  def publish(issue, previous, user, correlationId = "")
    payload = {
      meta: {
        action: "moved",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user,
        correlationId: correlationId,
        repo_full_name: "#{issue.repo.owner.login}/#{issue.repo.name}"
      },
      payload: {
        issue: issue,
        column: issue.current_state,
        previous: previous
      }
    }

    execute payload
  end
end

class IssueReorderedEvent < IssueEventJob
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "reordered",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user,
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
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "assigned",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user,
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
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "milestone_changed",
        identifier: issue.number,
        timestamp: Time.now.utc.iso8601,
        user: user,
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
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_closed",
        identifier: issue.number,
        timestamp: issue.closed_at,
        user: user,
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

class IssueOpenedEvent < IssueEventJob
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_opened",
        identifier: issue.number,
        timestamp: issue.created_at,
        user: user,
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

class IssueArchivedEvent < IssueEventJob
  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_archived",
        identifier: issue.number,
        timestamp: issue.created_at,
        user: user,
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


class IssueReopenedEvent < IssueEventJob
  include IsPublishable

  def publish(issue, user, correlationId = "")
    payload = {
      meta: {
        action: "issue_reopened",
        identifier: issue.number,
        timestamp: issue.updated_at,
        user: user,
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
