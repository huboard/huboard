module Api
  class UploadsController < ApplicationController

    def asset_uploader
      not_found unless logged_in?
      uploader = AssetUploader.new
      uploader.will_include_content_type = true
      uploader.success_action_status = '201'
      render json: {
        uploader: {
          key: uploader.key,
          aws_access_key_id: uploader.aws_access_key_id,
          acl: uploader.acl,
          policy: uploader.policy,
          signature: uploader.signature,
          upload_url: uploader.direct_fog_url,
          success_action_status: uploader.success_action_status
        }
      }
    end

  end
end
