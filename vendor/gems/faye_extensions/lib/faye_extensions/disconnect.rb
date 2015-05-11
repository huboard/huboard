module FayeExtensions
  class Disconnect
    def outgoing(message, callback)
      if message['advice'] && message['advice']['reconnect'] == "handshake"
        message['advice']['reconnect'] = "none"
      end
      callback.call(message)
    end
  end
end
