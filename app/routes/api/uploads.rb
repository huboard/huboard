module HuBoard
  module Routes
    module Api
      class Uploads < Base

        get '/api/uploads/asset' do
          raise Sinatra::NotFound unless logged_in?
          uploader = Uploader.new
          uploader.will_include_content_type = true
          uploader.success_action_status = "201"
          json(
            uploader: {
              key: uploader.key,
              aws_access_key_id: uploader.aws_access_key_id,
              acl: uploader.acl,
              policy: uploader.policy,
              signature: uploader.signature,
              upload_url: uploader.direct_fog_url,
              success_action_status: uploader.success_action_status
            }
          )
        end


        class Uploader < CarrierWave::Uploader::Base
          include CarrierWaveDirect::Uploader
        end
      end
    end
  end
end
