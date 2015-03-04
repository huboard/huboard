$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "saas/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "saas"
  s.version     = Saas::VERSION
  s.authors     = [""]
  s.email       = [""]
  s.homepage    = "TODO"
  s.summary     = "TODO: Summary of Saas."
  s.description = "TODO: Description of Saas."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.2.0"
end
