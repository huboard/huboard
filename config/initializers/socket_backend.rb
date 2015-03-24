Rails.application.config.sockets = OpenStruct.new(
  socket_backend: ENV["SOCKET_BACKEND"],
)

if ENV["SELF_HOST_FAYE"]
  #Faye.logger = Rails.logger
end
