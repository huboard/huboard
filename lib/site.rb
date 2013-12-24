class Site < HuboardApplication
    get "/site/privacy/?" do
      return erb :privacy, :layout => :marketing 
    end

    get "/site/terms/?" do
      return erb :terms_of_service, :layout => :marketing 
    end

    get '/pricing/?' do 
      erb :pricing, :layout => :marketing
    end

    get "/favicon.ico" do
     
      path = File.expand_path("../../public/img/favicon.ico",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "image/vnd.microsoft.icon"
      [status, headers, response]
    end

    get "/robots.txt" do
      path = File.expand_path("../../public/files/robots.txt",__FILE__)

      response = [ ::File.open(path, 'rb') { |file| file.read } ]

      headers["Content-Length"] = response.join.bytesize.to_s
      headers["Content-Type"]   = "text/plain"
      [status, headers, response]
    end
end

