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
        CGI.escape("#{class_name}-#{doc["_id"] || doc[identifier.to_s].to_s}")
      end

      def delete!(doc)
        connection.delete(doc._id) do |req|
          req.params[:rev] = doc._rev
        end
        id = CGI.escape("Deleted-#{doc._id}")
        connection.put id, meta: { type: "deleted" }, doc: doc
      end

      def save(doc)
        clone = doc.clone.merge "_id" => doc["_id"] || escape_docid(doc), "meta" => meta, :last_updated => Time.now.utc.iso8601

        response = connection.get(clone["_id"])

        if response.status == 200
          response = connection.put(clone["_id"], clone.merge("_rev" => response.body._rev ))
        else
          clone = doc.clone.merge "_id" => escape_docid(doc), "meta" => meta, :timestamp => Time.now.utc.iso8601
          response = connection.put(clone["_id"], clone)
        end

        response.body.merge clone
      end

      def query_view(viewname, options = {})
        result = connection.get("_design/#{class_name}/_view/#{viewname}") do |request|
          request.params.merge! options
        end
        result.body
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

      class Timeout < Faraday::Middleware
        begin

        rescue LoadError, NameError => e
          self.load_error = e
        end

        def initialize(app, *args)
          @app = app
        end

        def call(env)
          env[:request][:timeout] = 12
          env[:request][:open_timeout] = 10
          @app.call env
        end
      end

      # Instantiates connection, accepts an options hash
      # for authenticated access
      #
      def initialize(hash={})
        super("#{hash[:base_url] || "http://127.0.0.1:5984" }/#{hash[:database] || "huboard"}") do |builder|
          yield builder if block_given?
          builder.use     FaradayMiddleware::EncodeJson
          builder.use     FaradayMiddleware::Mashify
          builder.use     FaradayMiddleware::ParseJson
          builder.request :retry, 3
          builder.use     Timeout
          #  builder.use     Ghee::Middleware::UriEscape
          builder.use Faraday::HttpCache, store: HuBoard.cache, logger: Logger.new(STDOUT), serializer: Marshal
          builder.adapter Faraday.default_adapter

          builder.request :url_encoded


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
      Users.new(connection,  :type => "user" )
    end

    class User < ResourceProxy
      identify_by :id
    end

    def user
      User.new(connection,  :type => "user", :from => "login" )
    end

    class Users < ResourceProxy
      identify_by :id
    end

    def boards
      Board.new(connection,  :type => "board" )
    end

    class Board < ResourceProxy
      identify_by :id
    end

    def orgs
      Orgs.new(connection,  :type => "org" )
    end

    class Orgs < ResourceProxy
      identify_by :id
    end

    def repos
      Repos.new(connection,  :type => "repo" )
    end

    class Repos < ResourceProxy
      identify_by :id
    end

    def customers
      Customers.new(connection,  :type => "customer" )
    end

    class Customers < ResourceProxy
      identify_by :id

      def findPlanById(id)
        query_view "findPlanById", :key => id
      end
    end

    def stats
      Stats.new connection, :type => "stats"
    end

    class Stats < ResourceProxy
      identify_by :id

      def dashboard
        query_view "dashboardStats", :group_level => 1
      end
    end

    def integrations
      Integrations.new connection, :type => "integrations"
    end

    class Integrations < ResourceProxy
      identify_by :id

      def by_repo(id)
        query_view "by_repo", :key => id
      end

      def by_full_name(name)
        query_view "by_full_name", :key => name
      end
    end
  end

end
