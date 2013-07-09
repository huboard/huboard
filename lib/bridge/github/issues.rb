class Huboard

  module Issues

    def issues(label = nil)
      params = {:direction => "asc"}
      params = params.merge({:labels => label}) if label
      gh.issues(params).all.each{|i| i.extend(Card)}.each{ |i| i.merge!({"repo" => {:owner => {:login => user}, :name => repo }}) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f}
    end

    def issue(number)
      issue = gh.issues(number).extend(Card).merge!({:repo => {:owner => {:login => user}, :name => repo }})
      issue.attach_client connection_factory
      issue
    end

    def milestones
      gh.milestones.all.each { |m| m.extend(Milestone) }.each{ |i| i.merge!({"repo" => {:owner => {:login => user}, :name => repo }}) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f}
    end

    def milestone(number)
      milestone = gh.milestones(number).extend(Milestone).merge!({:repo => {:owner => {:login => user}, :name => repo }})
      milestone.attach_client connection_factory
      milestone
    end

    module Card

      def current_state
        r = Huboard.column_pattern
        self.labels.sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}  || {"name" => "__nil__"}
      end

      def order
         self["_data"]["order"] || self.number.to_f
      end

      def update_labels(labels)

        keep_labels = self.labels.find_all {|l| Huboard.all_patterns.any? {|p| p.match(l.name)}}

        update_with = labels.concat(keep_labels.map{ |l| l["name"] }) 

        patch "labels" => update_with

      end

      def other_labels
        self.labels.reject {|l| Huboard.all_patterns.any? {|p| p.match l.name }}
      end

      def attach_client connection
          @connection_factory = connection 
      end

      def gh
          @connection_factory.call
      end

      def client
         gh.repos(self[:repo][:owner][:login], self[:repo][:name]).issues(self.number)
      end

      def events
        client.events.all.to_a
      end

      def all_comments
        client.comments.all.to_a
      end

      def feed
        the_feed =  { :comments => self.all_comments, :events => events }
        return self.merge! the_feed
      end

      def patch(hash)
        updated = client.patch hash 
        updated.extend(Card).merge!(:repo => repo)
      end

      def move(index)
        board = Huboard::Board.new(self[:repo][:owner][:login], self[:repo][:name], @connection_factory)
        column_labels = board.column_labels
        new_state = column_labels.find { |l| /#{index}\s*- *.+/.match l.name }
          self.labels << new_state unless new_state.nil?
        self.labels = self.labels.delete_if { |l| l["name"] == self[:current_state]["name"]}
        patch "labels" => self.labels
      end

      def close
        status = client.close
        return :success => status
      end

      def reorder(index)
        embed_data({"order" => index.to_f})
        patch :body => self.body
      end

      def embed_data(data = nil)
        if !data
          r = /@huboard:(.*)/
            match = r.match self.body
          return { } if match.nil?

          begin
            return JSON.load(match[1])
          rescue
            return {}
          end
        else
          _data = embed_data
          if _data.empty?
            self.body = self.body.to_s.concat  "\r\n\r\n<!---\r\n@huboard:#{JSON.dump(data)}\r\n-->\r\n" 
          else
            self.body = self.body.gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge(data))}"
          end
        end
      end

      def self.extended(klass)
        klass[:current_state] = klass.current_state
        klass[:other_labels] = klass.other_labels
        klass["_data"] = klass.embed_data
      end

    end


    module Milestone

      def reorder(index)
        embed_data({"order" => index.to_f})
        patch :description => self.description
      end

      def attach_client connection
          @connection_factory = connection 
      end

      def gh
          @connection_factory.call
      end

      def client
         gh.repos(self[:repo][:owner][:login], self[:repo][:name]).milestones(self.number)
      end

      def patch(hash)
        m = client.patch hash
        m.extend(Milestone).merge! :repo => self["repo"]
      end

      def embed_data(data = nil)
        if !data
          r = /@huboard:(.*)/
            match = r.match self.description
          return { } if match.nil?

          begin
            return JSON.load(match[1])
          rescue
            return {}
          end
        else
          _data = embed_data
          if _data.empty?
            self.description = self.description.concat  "\r\n\r\n<!---\r\n@huboard:#{JSON.dump(data)}\r\n-->\r\n" 
          else
            self.description = self.description.gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge(data))}"
          end
        end
      end

      def self.extended(klass)
        klass["_data"] = klass.embed_data
      end

    end
  end
end
