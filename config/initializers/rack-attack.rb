class Rack::Attack

  throttle('req/ip', :limit => 80, :period => 1.minutes) do |req|
    req.ip
  end


  blacklist('block a-holes') do |req|
    (ENV["BLACKLIST"] || "").split(",").include? req.ip
  end

end
