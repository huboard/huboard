require_relative "../lib/access_pipline"

Dir.glob('lib/**/*_spec*').each do |file|
  require File.expand_path(file)
end
