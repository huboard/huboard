class JobResolver
  include Singleton
  class Noop
    def self.perform_later(*args); end
  end
  def initialize
    @jobs = UberDictionary.new ->(params) {
      [
       "#{params[:controller]}_#{params[:action]}_job",
       "#{params[:controller]}_job",
      ].each do |job_name|
        job_class = job_name.classify.safe_constantize
        return job_class if job_class
      end
      Noop
    }
    @mutex = Mutex.new
  end

  def find_job(params)
    with_mutex do
      @jobs[{controller: params[:controller], action: params[:action]}]
    end
  end

  def self.find_job(params)
    instance.find_job params
  end

  private

  def with_mutex
    @mutex.synchronize { yield }
  end
end
