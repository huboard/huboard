class QueryHandler

  def self.set_logger(&logger)
    @logger = logger
  end

  def self.logger
    @logger ||= lambda do |e|
      $stdout.puts("QUERYHANDLER GENERATED ERROR: \n")
      $stdout.puts(e)
      $stdout.puts(e.backtrace)
    end
  end

  def self.run
    chain = QueryChain.new(logger)
    yield(chain)
    chain.execute
  end

  def self.exec(&query)
    chain = QueryChain.new(logger)
    chain << query
    chain.execute
  end

  class QueryChain

    def initialize(logger)
      @logger = logger
      @queries = []
    end

    def <<(query)
      @queries << query
    end

    def execute
      response = false
      @queries.each do |q|
        begin
          return response = q.call
        rescue => e
          @logger.call(e)
        end
      end
      response
    end
  end
end
