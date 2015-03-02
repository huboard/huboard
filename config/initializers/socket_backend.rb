Rails.application.config.sockets = OpenStruct.new(
  socket_backend: ENV["SOCKET_BACKEND"],
)

