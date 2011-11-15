require 'rake'
require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec) do |t|
  t.pattern = FileList['specs/*_spec.rb', 'specs/*.rspec']
  t.rspec_opts = ['--color --format nested']
  t.rcov = true
  t.rcov_opts = %w{--exclude gems\/,specs\/}
end

task :default => :spec
