namespace :assets do
  desc 'Precompile assets'
  task :precompile => :app do
    assets = HuBoard::Routes::Base.assets
    precompile = HuBoard::Routes::Base.precompile
    target = Pathname(HuBoard::App.root) + 'public/assets'
    manifest = Sprockets::Manifest.new assets.index, target
    manifest.compile precompile
  end

  desc "Clean assets"
  task :clean => :app do
    target = Pathname(HuBoard::App.root) + 'public/assets'
    FileUtils.rm_rf(target)
  end
end
