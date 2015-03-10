CarrierWave.configure do |config|
  config.storage = :fog
  config.fog_credentials = {
    provider: "AWS",
    path_style: true,
    region: ENV['AWS_DEFAULT_REGION'] || "us-west-2",
    endpoint: 'https://s3-us-west-2.amazonaws.com',
    aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
  }
  config.fog_directory = ENV['AWS_S3_BUCKET']
  #config.fog_attributes = { :multipart_chunk_size => 104857600 }
  config.fog_attributes = {'Cache-Control'=>"max-age=#{365.day.to_i}"}
  config.min_file_size = "1"
  config.max_file_size = "#{5 * 1024 * 1024}"
  config.fog_public = true
  config.use_action_status = true
end
