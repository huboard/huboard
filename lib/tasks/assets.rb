namespace :assets do
  desc 'Precompile assets'
  task :precompile => :app do
    assets = HuBoard::Routes::Base.assets
    precompile = HuBoard::Routes::Base.precompile
    target = Pathname(HuBoard::App.root) + 'public/assets'

    assets.each_logical_path do |logical_path|
      next unless precompile.any? { |pattern| File.fnmatch pattern, logical_path }
      if asset = assets.find_asset(logical_path) 
        filename = target.join(asset.digest_path)
        FileUtils.mkpath(filename.dirname)
        asset.write_to(filename)

        filename = target.join(logical_path)
        FileUtils.mkpath(filename.dirname)
        asset.write_to(filename)
      end
    end
  end
end

