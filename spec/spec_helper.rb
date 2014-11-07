Dir.glob('lib/**/*_spec*').each do |file|
  require File.expand_path(file)
end
