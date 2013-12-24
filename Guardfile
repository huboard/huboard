require 'bundler'
Bundler.require
require './lib/bridge/huboard'
require './lib/helpers'
require './lib/base'
require './lib/app'


app = HuboardApplication.new

guard("sprockets2", sprockets: HuboardApplication.sprockets, asset_path: HuboardApplication.assets_path, precompile: HuboardApplication.precompile) do
  watch %r(^assets/.+$)

end
