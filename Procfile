web: bundle exec puma -C config/puma.rb
worker: bundle exec ruby ./lib/workers/worker.rb
faye: bundle exec rackup faye.ru  -s puma -p 9394 -E production
