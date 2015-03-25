require "ember-cli-rails"
namespace "heroku-ember-cli" do
  task compile: :environment do
    EmberCLI.configure do |c|
      c.app :app, path: Rails.root.join('ember-app')
    end
    EmberCLI.install_dependencies!
    app = EmberCLI.get_app "app"
    Dir.chdir 'ember-app' do
      `#{app.ember_path} build --environment production`
    end
  end
end

task "assets:precompile" => "heroku-ember-cli:compile"
