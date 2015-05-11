class FayeDisconnectTest < ActiveSupport::TestCase
  test 'override advice on handshake' do
    extension = FayeExtensions::Disconnect.new

    message = { 'advice' => { 'reconnect' => 'handshake' } }

    extension.outgoing message, ->(response) {
      assert response['advice']['reconnect'] == 'none'
    }

  end
end
