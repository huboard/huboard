require 'time'
require "json/ext"


class Huboard


  class Couch

    attr_reader :connection

    def initialize(options={})
      return @connection = Connection.new(options)
    end


    module CUD

      def escape_docid(doc)
        CGI.escape("#{class_name}-#{doc[identifier.to_s].to_s}")
      end

      def save(doc)
        clone = doc.clone.merge "_id" => escape_docid(doc), "meta" => meta, :timestamp => Time.now.utc.iso8601

        response = connection.get(clone["_id"])

        if response.status == 200
          response = connection.put(clone["_id"], clone.merge("_rev" => response.body._rev ))
        else
          response = connection.put(clone["_id"], clone)
        end


        p response.body.merge clone
      end


      def get_or_create(doc)
        clone = doc.clone.merge "_id" => escape_docid(doc), "meta" => meta

        doc = connection.get(clone["_id"])

        return doc.body if doc.status == 200

        response = connection.put(clone["_id"], p(clone))

        response.body.merge clone
      end

      # Patchs
      #
      # return json
      #
      def patch(attributes)
      end

      # Destroys
      #
      # return boolean
      #
      def destroy
      end
    end

    class Connection < Faraday::Connection


      # Instantiates connection, accepts an options hash
      # for authenticated access
      #
      def initialize(hash={})
        super("#{hash[:base_url] || "http://127.0.0.1:5984" }/huboard") do |builder|
          yield builder if block_given?
          builder.use     FaradayMiddleware::EncodeJson
          builder.use     FaradayMiddleware::Mashify
          builder.use     FaradayMiddleware::ParseJson
          #  builder.use     Ghee::Middleware::UriEscape
          builder.adapter Faraday.default_adapter

        end


      end

    end

    class ResourceProxy

      module ClassMethods
        def identify_by(symbol)
          class_eval <<-EOS, __FILE__, __LINE__ + 1
            def identifier
              return @identifier ||= "#{symbol}"
            end
          EOS
        end



      end
      # Undefine methods that might get in the way
      #instance_methods.each { |m| undef_method m unless m =~ /^__|instance_eval|instance_variable_get|object_id|respond_to/ }

      include CUD
      extend ClassMethods

      def class_name
        (self.is_a?(Module) ? name : self.class.name).split("::").last
      end

      # Make connection and path_prefix readable
      attr_reader :connection, :meta, :identifier

      # Expose pagination data
      attr_reader :current_page, :total, :pagination

      # Instantiates proxy with the connection
      # and path_prefix
      #
      # connection - Ghee::Connection object
      # path_prefix - String
      #
      def initialize(connection, meta)
        @connection, @meta = connection, meta
      end

      # Method_missing takes any message passed
      # to the ResourceProxy and sends it to the
      # real object
      #
      # message - Message object
      # args* - Arguements passed
      #

      #def method_missing(message, *args, &block)
      #  subject.send(message, *args, &block)
      #end

      # Subject is the response body parsed
      # as json
      #
      # Returns json
      #
      def subject
        @subject ||= connection.get(path_prefix){|req| req.params.merge!params }.body
      end

    end

    def users
      return Users.new(connection,  :type => "user" )
    end

    class User < ResourceProxy
      identify_by :id
    end

    def user
      return User.new(connection,  :type => "user", :from => "login" )
    end

    class Users < ResourceProxy
      identify_by :id
    end

    def boards
      return Board.new(connection,  :type => "board" )
    end

    class Board < ResourceProxy
      identify_by :id
    end

    def orgs
      return Orgs.new(connection,  :type => "org" )
    end

    class Orgs < ResourceProxy
      identify_by :id
    end

    def repos
      return Repos.new(connection,  :type => "repo" )
    end

    class Repos < ResourceProxy
      identify_by :id
    end

  end

  module Issues
    module Card
      def couch
        @couch ||= Huboard::Couch.new :base_url => HuboardApplication.couchdb_server
      end

      def move(index)
        old_self = self
        issue = super(index)
        begin
          couch.connection.post("./",{
            :github => old_self.merge(issue),
            :meta => { :type => "event", :name => "card:move" },
            :timestamp => Time.now.utc.iso8601
          }).body
        rescue

        end
        issue
      end
    end
  end

  class Board
    board_method = self.instance_method(:board)

    def couch
      @couch ||= Huboard::Couch.new :base_url => HuboardApplication.couchdb_server
    end

    define_method(:board) do

      api = connection_factory.call
      therepo = api.repos(user, repo)
      theuser = api.users(user)

      begin
        puts "saving to couch"
        couch.user.get_or_create api.user
        couch.users.get_or_create theuser if theuser.type == "User"
        couch.orgs.get_or_create theuser if theuser.type == "Organization"
        couch.repos.get_or_create therepo
      rescue Exception => e
        puts "error with couch"
        puts e.message
        return board_method.bind(self).call
      end

      theboard = board_method.bind(self).call

      #couch.boards.save theboard

      theboard
    end

  end

end
