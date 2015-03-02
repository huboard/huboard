Rails.application.config.client_environment = JSON.parse(File.read("#{Rails.root}/features.json"))
